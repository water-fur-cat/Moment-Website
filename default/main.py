from flask import Flask, request, jsonify, render_template, abort, redirect, url_for, session, flash
import requests
from google.cloud import storage
from google.cloud import datastore
from google.cloud import exceptions
from functools import wraps
import logging
import uuid
import json
import time
import datetime
import random

environment = 'config.Config'
app = Flask(__name__)
app.secret_key = b'a really random secret key'
app.config.from_object(environment)

logging.basicConfig(level = logging.DEBUG)

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        logging.info("checking API key...")
        header_key = request.headers.get('X-Api-Key', "")
        session_key = session.get("api_key", "")
        if (header_key != app.config['API_KEY'] and session_key != app.config['API_KEY']):
            logging.error("API KEY Error: " + header_key + session_key)
            abort(401)
        return f(*args, **kwargs)
    return decorated_function


"""
FeedID
{
'user_id': str,
'feed_id': str
}
Feed
{
'id': FeedID,
'text': str,
'image_urls': [str],
}"""

"""GET /v1_0/feeds
Description: Get a list of feeds
Request body: None
Query parameters: None
Returns:
    A list of Feed objects in JSON format if authenticated;
    Redirect to login otherwise
Status codes:
  - 200: success
  - 500: server error"""

"""POST /v1_0/feeds
Description: Create a new feed
Request body: multipart form
Query parameters: None
Returns:
  Redirect to the home page if authenticated;
  Redirect to login otherwise
Status codes:
  - 201: success
  - 400: user fault
  - 500: server error"""

"""DELETE /v1_0/feeds
Description: Delete a feed
Request body: FeedID object
Query parameters: None
Returns:
  None if succeeded;
  Redirect to login page otherwise
Status codes:
  - 200: success
  - 403: user fault: you are deleting others’ feed!
  - 404: user fault: invalid FeedID object
  - 500: server error"""

@app.route("/v1_0/feeds", methods = ['GET', 'POST', 'DELETE'])
@require_api_key
def feeds():
  if request.method == 'GET':
    #[TODO]: comment not implemented
    #[TODO]: unread count not implemented: need user_id as a input
    logging.info("GET feeds endpoint triggered.\n")
    try:
      # read feeds from datastore
      datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
      query = datastore_client.query(kind = 'Feeds')
      # sorted by create time
      query.order = ["timestamp"]
      feed_entities = list(query.fetch())
      feed_array = []
      # convert entity to dict
      for entity in feed_entities:
          tmp = {}
          entity['timestamp'] = datetime.datetime.fromtimestamp(int(float(entity['timestamp'])))
          for k in entity.keys():
              tmp[k] = entity[k]
          feed_array.append(tmp)
    except exceptions.GoogleCloudError as exception:
      logging.error(exception)
      return "server error\n", 500
    #[FIXME]: form-data formats subject to change
    return jsonify(feed_entities), 200

  elif request.method == 'POST':
    logging.info("POST feeds endpoint triggered.\n")
    uploaded_files = []
    if 'image' in request.files:
      uploaded_files = [request.files['image']]
      logging.debug(uploaded_files[0].content_length)
      logging.debug(uploaded_files[0].filename)
    data = {
      'text': ''
    }
    if 'data' in request.form:
      data = json.loads(request.form['data'])
    logging.debug(data)
    logging.debug(uploaded_files)
    # integarity check
    user_id = get_user_id(data)
    if not user_id:
        abort(400, "Missing user_id")
    feed_object = {
      'id': '',
      'feed_id': str(uuid.uuid4()),
      'user_id': user_id,
      'text': data['text'],
      'image_urls': [],
      #----- additional structures
      'image_names': [],
      'timestamp': str(time.time()),
      'comments': [],
      'username':session["username"]
    }
    feed_object['id'] = json.dumps({'user_id': feed_object['user_id'], 'feed_id': feed_object['feed_id']})
    # check if user exsit
    datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
    query = datastore_client.query(kind = 'Profiles')
    query.add_filter('user_id', '=', feed_object['user_id'])
    user = list(query.fetch())
    if len(user) == 0:
        abort(400, "Invalid user_id")
    # upload (multiple) images
    try:
      storage_client = storage.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
      bucket = storage_client.bucket(app.config['CLOUD_STORAGE_BUCKET'])
    except exceptions.GoogleCloudError as exception:
        abort(500, "upload file error: " + str(exception))
    for file in uploaded_files:
      feed_object['image_names'].append(feed_object['feed_id'] + '.' + file.filename)
      blob = bucket.blob(feed_object['feed_id'] + '.' + file.filename)
      blob.upload_from_string(file.read(), content_type = file.content_type)
      url = blob.generate_signed_url(expiration = datetime.timedelta(days = 7), version="v4", method="GET")
      feed_object['image_urls'].append(url)
      logging.info(f"File uploaded: {file.filename} to {blob.public_url}")
    # create entity
    try:
      datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
      key = datastore_client.key('Feeds', feed_object['feed_id'])
      entity = datastore.Entity(key)
      for k in feed_object.keys():
          entity[k] = feed_object[k]
      datastore_client.put(entity)
    except exceptions.GoogleCloudError as exception:
        abort(500, "create entity error: " + str(exception))
    # update number of feeds:
    with datastore_client.transaction():
      key = datastore_client.key("Utilities", "Feeds")
      task = datastore_client.get(key)
      if task == None:
        task = datastore.Entity(key)
      if 'count' not in task:
        task['count'] = 0
      task['count'] += 1
      datastore_client.put(task)
    #[FIXME]: for debug
    return redirect(url_for('home'))
  elif request.method == 'DELETE':
    logging.info("DELETE feed endpoint triggered.\n")
    feed_id = json.loads(request.form.get('data'))
    # integrity check
    if feed_id == None or 'user_id' not in feed_id.keys() or 'feed_id' not in feed_id.keys():
      logging.error("user fault: invalid FeedID object " + json.dumps(feed_id))
      return "user fault: invalid FeedID object\n", 404
    try:
      # validate feed ID and user ID
      datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
      key = datastore_client.key('Feeds', feed_id['feed_id'])
      task = datastore_client.get(key)
      if task == None:
        logging.error("user fault: invalid FeedID object")
        return "user fault: invalid FeedID object\n", 404
      if task['user_id'] != feed_id['user_id']:
        logging.error("user fault: you are deleting others’ feed!")
        return "user fault: you are deleting others’ feed!\n", 403
      for img in task['image_names']:
        storage_client = storage.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
        bucket = storage_client.bucket(app.config['CLOUD_STORAGE_BUCKET'])
        blob = bucket.blob(img)
        blob.delete()
      # delete the feed
      datastore_client.delete(task)
      # update number of feeds
      with datastore_client.transaction():
        key = datastore_client.key("Utilities", "Feeds")
        task = datastore_client.get(key)
        task['count'] -= 1
        datastore_client.put(task)
    except exceptions.GoogleCloudError as exception:
      logging.error("delete error: " + str(exception))
      return "server error\n", 500
    return "delete done\n", 200

"""PersonalInfo
{
'name': str,
'photo_url': str,
'age': integer,
'gender': str,
'email': str,
'contact': str
}"""

"""GET /v1_0/users/{user_id}
Description: Get a user’s profile
Request body: None
Query parameters: None
Returns:
  profile.html for the user if authenticated;
  Redirect to login otherwise
Status codes:
  - 200: success
  - 400: user fault: invalid user_id
  - 500: server error
"""

"""PUT /v1_0/users/{user_id}
Description: Update personal info
Request body: PersonalInfo object
Query parameters: None
Returns:
  PersonalInfo object if authenticated;
  Redirect to login otherwise
Status codes:
  - 200: success
  - 400: user fault
  - 500: server error
"""
@app.route("/v1_0/users/<id>", methods = ['GET', 'POST'])
@require_api_key
def profile(id):
  if "user_id" in session:
    id = session["user_id"]
  if request.method == 'GET':
    logging.info("GET profile endpoint triggered.\n")
    try:
      datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
      key = datastore_client.key('Profiles', id)
      task = datastore_client.get(key)
      # validate the user id
      if task == None:
        logging.error("user fault: invalid user_id")
        return "user fault\n", 400
      personalInfo = {}
      for k in task.keys():
        personalInfo[k] = task[k]
    except exceptions.GoogleCloudError as exception:
      logging.error("profile GET error: " + str(exception))
      return "server error\n", 500
    #[FIXME]: for debug
    return render_template('profile.html', personalInfo = personalInfo), 200
  elif request.method == 'POST':
    logging.info("POST profile endpoint triggered.\n")
    # handle avatar update
    if len(request.files) > 0:
      logging.info("Updating avator")
      return updateAvatar(id)
    logging.info("Updating profile")
    personalInfo = json.loads(request.form.get('data'))
    logging.debug(personalInfo)
    # remove empty fields
    for k in list(personalInfo.keys()):
      if personalInfo[k] == '':
        del personalInfo[k]
    # validate input format
    for k in personalInfo.keys():
      if k not in ['nick_name', 'age', 'gender', 'email', 'contact', 'password', 'country', 'region', 'email']:
        abort(400, "Profile update: invalid key")
    logging.debug(personalInfo)
    try:
      datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
      with datastore_client.transaction():
        key = datastore_client.key('Profiles', id)
        task = datastore_client.get(key)
        # validate user id
        if task == None:
          abort(400, "user fault: invalid user_id")
        for k in personalInfo.keys():
          task[k] = personalInfo[k]
        datastore_client.put(task)
    except exceptions.GoogleCloudError as exception:
      abort(500, "update profile error: " + str(exception))
    return jsonify(task), 200

"""GET /v1_0/user_feeds/{user_id}
Description: Get a list of feeds created by the user
Request body: None
Query parameters: None
Returns:
  user_feeds.html if authenticated;
  Redirect to login otherwise
Status codes:
  - 200: success
  - 404: user fault: invalid user_id
  - 500: server error"""
@app.route("/v1_0/user_feeds/<id>", methods = ['GET'])
@require_api_key
def user_feeds(id):
  logging.info("GET user_feed endpoint triggered.\n")
  try:
    # validate user id
    datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
    key = datastore_client.key('Profiles', id)
    personalInfo = datastore_client.get(key)
    if personalInfo == None:
      logging.error("user fault: invalid user_id")
      return "user fault: invalid user_id\n", 400
  except exceptions.GoogleCloudError as exception:
    logging.error("profile GET error: " + str(exception))
    return "server error\n", 500
  try:
    # read feeds from datastore
    datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
    query = datastore_client.query(kind = 'Feeds')
    query.add_filter('user_id', '=', id)
    feeds = list(query.fetch())
    ret = []
    for feed in feeds:
      tmp = {}
      tmp['id'] = feed['id']
      tmp['feed_id'] = feed['feed_id']
      tmp['text'] = feed['text']
      tmp['image_urls'] = feed['image_urls']
      tmp['timestamp'] = datetime.datetime.fromtimestamp(int(float(feed['timestamp'])))
      ret.append(tmp)
  except exceptions.GoogleCloudError as exception:
    logging.error("profile GET error: " + str(exception))
    return "server error\n", 500
  #[FIXME]: form-data formats subject to change
  #return render_template('user_feeds.html', feeds = ret), 200
  return jsonify(ret), 200

@app.route("/v1_0/mymoments/<id>", methods = ['GET'])
def my_moment_pages(id):
  return render_template('my_moments_new.html',user_id=session["user_id"]), 200


"""SignupInfo
{
'username': str,
'password': str
}"""

"""GET /v1_0/signup
Description: Get the signup page
Request body: None
Query parameters: None
Returns: signup.html
Status codes:
  - 200: success
  - 500: server error"""
"""POST /v1_0/signup
Description: Signup a user
Request body: SignupInfo object
Query parameters: None
Returns: Redirect to login
Status codes:
  - 201: success
  - 500: server error"""
@app.route("/v1_0/signup", methods = ['POST'])
def signup():
  if request.method == 'POST':
    logging.info("POST signup.")
    signupInfo = request.form
    try:
        # craete a user profile
        datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
        user_id = str(uuid.uuid4())
        key = datastore_client.key('Profiles', user_id)
        entity = datastore.Entity(key)
        entity['name'] = signupInfo['username']
        entity['nick_name'] = ''
        entity['photo_url'] = 'https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg'
        entity['age'] = ''
        entity['gender'] = ''
        entity['email'] = ''
        entity['contact'] = ''
        # additional info
        entity['password'] = signupInfo['password']
        entity['user_id'] = user_id
        entity['logout_time'] = str(time.time())
        entity['country'] = ''
        entity['region'] = ''
        datastore_client.put(entity)
    except exceptions.GoogleCloudError as exception:
        abort(500, "profile create entility error: " + str(exception))
    with datastore_client.transaction():
        key = datastore_client.key("Utilities", "Users")
        task = datastore_client.get(key)
        if task == None:
            task = datastore.Entity(key)
        if 'registered_user_count' not in task:
            task['registered_user_count'] = 0
        task['registered_user_count'] += 1
        datastore_client.put(task)
    return redirect(url_for('login'))

"""GET /v1_0/usernames
Description: Check whether a username has been used
Request body: None
Query parameters:
q: str (username)
Returns: None
Status codes:
 - 200: username found
 - 404: username not found"""
@app.route('/v1_0/usernames', methods = ['GET'])
@require_api_key
def check_username():
    logging.info("GET username.\n")
    username = request.args.get('q')
    '''
    if username == None:
        logging.error("user fault: invalid username or password")
        # [FIXME] adding error code
        return "user fault: invalid username or password\n", 404
    '''
    if is_valid_username(username):
        return jsonify({"exist":"False"}), 200
    return jsonify({"exist":"True"}), 200




"""LoginInfo
{
'username': str,
'password': str
}
"""
"""GET /v1_0/login
Description: Get the login page
Request body: None
Query parameters: None
Returns: login.html
Status codes:
  - 200: success
  - 500: server error"""
"""POST /v1_0/login
Description: Login a user
Request body: LoginInfo object
Query parameters: None
Returns:
  Redirect to the home page if succeeded;
  Remain in the same page otherwise
Status codes:
  - 200: success
  - 400: user fault: invalid username or password
  - 500: server error"""
@app.route("/v1_0/login", methods = ['GET', 'POST'])
def login():
    if request.method == 'GET':
        logging.info("GET login.")
        return render_template('login.html'), 200
    elif request.method == 'POST':
        logging.info("POST login.")
        logging.debug(request.form)
        return handle_post_login()


"""DELETE /v1_0/login/{user_id}
Description: Logout a user
Request body: None
Query parameters: None
Returns: Redirect to the login page if authenticated
Status codes:
  - 200: success
  - 403: user fault: you cannot logout others
  - 500: server error"""
@app.route("/v1_0/logout/<id>", methods = ['DELETE','GET'])
@require_api_key
def logout(id):
  try:
    datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
    # record logout time
    with datastore_client.transaction():
      key = datastore_client.key("Profiles", id)
      task = datastore_client.get(key)
      if task == None:
        logging.error("no such userid")
        return " user fault: you cannot logout others\n", 403
      task['logout_time'] = str(time.time())
      datastore_client.put(task)
    # remove online user
    with datastore_client.transaction():
      key = datastore_client.key("Utilities", 'Users')
      task = datastore_client.get(key)
      if id not in task['online'].keys():
        logging.error("user is not online")
        return " user fault: you cannot logout others\n", 403
      task['count'] -= 1
      del task['online'][id]
      datastore_client.put(task)
  except exceptions.GoogleCloudError as exception:
      abort(500, "logout update error: " + str(exception))
  session.pop("user_id", None)
  session.pop("username", None)
  session.pop("api_key", None)
  return redirect(url_for("login"))

"""GET /v1_0/home
Description: Get the home page
Request body: None
Query parameters: None
Returns:
  home.html if authenticated;
  Redirect to login otherwise
Status codes:
  - 200: success
  - 500: server error"""

@app.route("/v1_0/home", methods = ['GET'])
@require_api_key
def home():
  logging.info("GET homepage.")
  return render_template('main_page_new.html',user_id=session["user_id"]), 200

@app.route("/v1_0/moment_creation", methods = ['GET'])
@require_api_key
def moment_creation():
    logging.info("GET moment_creation page.")
    return render_template('moment_creation.html', bgid=str(random.randint(1,7))), 200

@app.route("/", methods = ['GET'])
def index():
    return redirect(url_for("login"))


#------------------------------HELERS-----------------------------#

def handle_post_login():
    username = request.form["username"]
    password = request.form["password"]
    try:
        # check user existence and password
        datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
        query = datastore_client.query(kind = 'Profiles')
        query.add_filter('name', '=', username)
        user = list(query.fetch())
        if len(user) == 0 or user[0]['password'] != password:
            err_msg = "user fault: invalid username or password"
            logging.info(err_msg)
            flash("Invalid username or password")
            return redirect(url_for("login"))
    except exceptions.GoogleCloudError as exception:
        err_msg = "login check error: " + str(exception)
        abort(500, err_msg)
    # add online user count
    with datastore_client.transaction():
        key = datastore_client.key("Utilities", "Users")
        task = datastore_client.get(key)
        if task == None:
            task = datastore.Entity(key)
        if 'count' not in task:
            task['count'] = 0
        if 'online' not in task:
            task['online'] = {}
        task['count'] += 1
        task['online'][user[0]['user_id']] = username
        datastore_client.put(task)
    session["username"] = request.form["username"]
    session["user_id"] = user[0]['user_id']
    session["api_key"] = app.config['API_KEY']
    return redirect(url_for("home"))


def is_valid_username(username):
    try:
        datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
        query = datastore_client.query(kind = 'Profiles')
        query.add_filter('name', '=', username)
        user = list(query.fetch())
        logging.debug("Checking uniquess: " + username)
        if len(user) > 0:
            return False
        return True
    except exceptions.GoogleCloudError as exception:
        abort(500, "useranme check error: " + str(exception))


def get_user_id(data):
    if "user_id" in data:
        return data["user_id"]
    if "user_id" in session:
        return session["user_id"]
    return None

def updateAvatar(id):
    avatar = request.files['avatar']
    try:
      storage_client = storage.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
      bucket = storage_client.bucket(app.config['CLOUD_STORAGE_BUCKET_AVARTOR'])
      blob = bucket.blob(id + '.' + avatar.filename)
      blob.upload_from_string(avatar.read(), content_type = avatar.content_type)
      #[FIXME] do we neeed signed url
      public_url = blob.public_url
    except exceptions.GoogleCloudError as exception:
        abort(500, "upload avator to cloud storage error: " + str(exception))
    logging.info(f"File uploaded: {avatar.filename} to {blob.public_url}")
    # create entity
    try:
      datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
      with datastore_client.transaction():
        key = datastore_client.key("Profiles", id)
        profile = datastore_client.get(key)
        profile["photo_url"] = public_url
        datastore_client.put(profile)
    except exceptions.GoogleCloudError as exception:
        abort(500, "create entity error: " + str(exception))
    return "", 200

#------------------------ERROR HANDLERS---------------------------#

"""404 Error Page"""
@app.errorhandler(404)
def error_page_not_found(e):
    logging.info(e.description)
    return error_response(404, "page not found")


"""400 Bad Request"""
@app.errorhandler(400)
def error_bad_request(e):
    logging.info(e.description)
    return error_response(400, e.description)


"""401 Unauthorized"""
@app.errorhandler(401)
def error_unauthorized(e):
    logging.info(e.description)
    return error_response(401, "Invalid Api Key")


"""500 Server Error"""
@app.errorhandler(500)
def error_server_error(e):
    logging.warning(e.description)
    return error_response(500, "Server Error")


def error_response(code, message):
    return jsonify({'code': code, 'message': message}), code


if __name__ == '__main__':
  app.run(debug=True)
