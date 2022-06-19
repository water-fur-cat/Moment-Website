# API

### POST /v1_0/signup
Description: Signup a user

Request body: SignupInfo object

Query parameters: None

Returns: Redirect to login

Status codes:
- 201: success
- 500: server error


### GET /v1_0/login
Description: Get the login page

Request body: None

Query parameters: None

Returns: login.html

Status codes:
- 200: success
- 500: server error

### POST /v1_0/login
Description: Login a user

Request body: LoginInfo object

Query parameters: None

Returns: Redirect to the home page if succeeded; Remain in the same page otherwise

Status codes:
- 200: success
- 400: user fault: invalid username or password
- 500: server error

### DELETE /v1_0/logout/{user_id}
Description: Logout a user

Request body: None

Query parameters: None

Returns: Redirect to the login page if authenticated

Status codes:
- 200: success
- 403: user fault: you cannot logout others
- 500: server error

### GET /v1_0/home
Description: Get the home page

Request body: None

Query parameters: None

Returns: home.html if authenticated; Redirect to login otherwise

Status codes:
- 200: success
- 500: server error


### GET /v1_0/feeds
Description: Get a list of feeds

Request body: None

Query parameters: None

Returns: A list of Feed objects in JSON format if authenticated; Redirect to login otherwise

Status codes:
- 200: success
- 500: server error

### POST /v1_0/feeds
Description: Create a new feed

Request body: multipart form

Query parameters: None

Returns: Redirect to the home page if authenticated; Redirect to login otherwise

Status codes:
- 201: success
- 400: user fault
- 500: server error

### DELETE /v1_0/feeds
Description: Delete a feed

Request body: FeedID object

Query parameters: None

Returns: None if succeeded; Redirect to login page otherwise

Status codes:
- 200: success
- 403: user fault: you are deleting others’ feed!
- 404: user fault: invalid FeedID object
- 500: server error

### GET /v1_0/users/{user_id}
Description: Get a user’s profile

Request body: None

Query parameters: None

Returns: profile.html for the user if authenticated; Redirect to login otherwise

Status codes:
- 200: success
- 400: user fault: invalid user_id
- 500: server error

### PUT /v1_0/users/{user_id}
Description: Update personal info

Request body: PersonalInfo object

Query parameters: None

Returns: PersonalInfo object if authenticated; Redirect to login otherwise

Status codes:
- 200: success
- 400: user fault
- 500: server error

### GET /v1_0/user_feeds/{user_id}
Description: Get a list of feeds created by the user

Request body: None

Query parameters: None

Returns: user_feeds.html if authenticated; Redirect to login otherwise

Status codes:
- 200: success
- 404: user fault: invalid user_id
- 500: server error


# Schema
```
SignupInfo
{
	'username': str,
	'password': str
}
```

```
LoginInfo
{
	'username': str,
	'password': str
}
```

```
FeedID
{
	'user_id': str,
	'feed_id': str
}
```

```
Feed
{
	'id': FeedID,
	'text': str,
	'image_urls': [str],
}
```

```
PersonalInfo
{
	'name': str,
	'photo_url': str,
	'age': integer,
	'gender': str,
	'email': str,
	'contact': str
}
```
