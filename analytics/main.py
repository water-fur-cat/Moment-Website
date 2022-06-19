import logging, random
from flask import Flask, render_template, request, session, abort, jsonify, flash, url_for, redirect
from functools import wraps
from google.cloud import datastore, exceptions


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



@app.route("/analytics/login", methods = ['GET', 'POST'])
def login():
    if request.method == 'GET':
        logging.info("GET login.")
        return render_template('login.html'), 200
    elif request.method == 'POST':
        logging.info("POST login.")
        logging.debug(request.form)
        return handle_post_login()


@app.route('/analytics/dashboard', methods=['GET'])
@require_api_key
def get_analytics_dashboard():
    data = {
        "health_timestamp": '-',
        "registered": '-',
        "online": '-',
        "images": '-',
        "moments": '-'
    }
    try:
        datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])

        key = datastore_client.key("Utilities", "Health")
        entity = datastore_client.get(key)
        if entity:
            data['health_timestamp'] = entity.get('health_timestamp', '-')
        
        key = datastore_client.key("Utilities", "Users")
        entity = datastore_client.get(key)
        if entity:
            data['online'] = entity.get('count', '-')
            data['registered'] = entity.get('registered_user_count', '-')
        
        key = datastore_client.key("Utilities", "Feeds")
        entity = datastore_client.get(key)
        if entity:
            data['moments'] = entity.get('count', '-')
        
        key = datastore_client.key("Utilities", "Image")
        entity = datastore_client.get(key)
        if entity:
            data['images'] = entity.get('count', '-')
    except exceptions.GoogleCloudError as exception:
        abort(500, "Health check failed: " + str(exception))
    return render_template("dashboard.html", data=data)


# ---------------------- helpers ---------------------- #

def handle_post_login():
    username = request.form["username"]
    password = request.form["password"]
    if username != app.config['ADMIN_USERNAME'] or password != app.config['ADMIN_PASSWORD']:
        flash("Invalid username or password")
        return redirect(url_for("login"))
    session["username"] = username
    session["api_key"] = app.config['API_KEY']
    return redirect(url_for("get_analytics_dashboard"))


# ------------------ error handlers ------------------- #
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