## Endpoint testing (done at local)
```
#export URL=http://127.0.0.1:5000/
export URL=https://mymemo-final-project-dzz.uc.r.appspot.com/
```

### GET usernames (READ)
* not exsit

```
curl -X GET \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
${URL}/v1_0/usernames?q=Shitong
```
* exsit

```
curl -X GET \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
${URL}/v1_0/usernames?q=test-1
```
* without auth

```
curl -X GET \
-H "Content-Type:multipart/form-data" \
${URL}/v1_0/usernames?q=test-1
```

### POST signup (Create)

* success

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-F 'username=test-4' \
-F 'password=test-4' \
${URL}/v1_0/signup
```
* username occupied

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-F 'username=test-1' \
-F 'password=test-1' \
${URL}/v1_0/signup

```
* username wrong formate

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-F 'xxxxx=test-1' \
-F 'password=test-1' \
${URL}/v1_0/signup
```

### POST login (UPDATE)
* success

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-F 'username=test-1' \
-F 'password=test-1' \
${URL}/v1_0/login
```
* wrong username

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-F 'username=test' \
-F 'password=test-2' \
${URL}/v1_0/login
```
* wrong password

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-F 'username=test-1' \
-F 'password=test-2' \
${URL}/v1_0/login
```

### GET profile (READ)
* success

```
curl -X GET \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
${URL}/v1_0/users/cfec91b4-0227-408c-87b6-4b713eaa8832
```
* without auth

```
curl -X GET \
-H "Content-Type:multipart/form-data" \
${URL}/v1_0/users/cfec91b4-0227-408c-87b6-4b713eaa8832
```
* wrong id

```
curl -X GET \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
${URL}/v1_0/users/1234
```

### POST profile (UPDATE)
* sccuess update

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
-F 'data={"age": 18, "gender": "male", "email": "test-1@uchicago.edu", "contact": "(888)-888-8889"}' \
${URL}/v1_0/users/cfec91b4-0227-408c-87b6-4b713eaa8832
```
* without auth

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-F 'data={"age": 18, "gender": "male", "email": "test-1@uchicago.edu", "contact": "(888)-888-8888"}' \
${URL}/v1_0/users/cfec91b4-0227-408c-87b6-4b713eaa8832
```
* wrong format

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
-F 'data={"agg": 18}' \
${URL}/v1_0/users/cfec91b4-0227-408c-87b6-4b713eaa8832
```
* wrong id

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
-F 'data={"age": 18, "gender": "male", "email": "test-1@uchicago.edu", "contact": "(888)-888-8888"}' \
${URL}/v1_0/users/1234
```

### POST feeds (CREATE)
* without image

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
-F 'data={"user_id": "cfec91b4-0227-408c-87b6-4b713eaa8832", "text": "test feed 10 from test-1"}' \
${URL}/v1_0/feeds
```
* with one image

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
-F 'data={"user_id": "cfec91b4-0227-408c-87b6-4b713eaa8832", "text": "test feed 2 from test-10"}' \
-F "files[]=@./img/lucy.jpeg" \
${URL}/v1_0/feeds
```
* with two images

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
-F 'data={"user_id": "e6f80353-e8b3-4543-886f-061c0177087b", "text": "test feed 3 from test-2"}' \
-F "files[]=@./img/lucy1.jpeg" \
-F "files[]=@./img/lucy2.jpeg" \
${URL}/v1_0/feeds
```

* without auth

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-F 'data={"user_id": "cfec91b4-0227-408c-87b6-4b713eaa8832", "text": "test feed 1 from test-1"}' \
-F "file=@./img/lucy.jpeg" \
${URL}/v1_0/feeds
```
* wrong format

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
-F 'data={"wrong": "cfec91b4-0227-408c-87b6-4b713eaa8832", "text": "test feed 1 from test-1"}' \
-F "file=@./img/lucy.jpeg" \
${URL}/v1_0/feeds
```
* wrong user_id

```
curl -X POST \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
-F 'data={"user_id": "1234", "text": "test feed 1 from test-1"}' \
-F "file=@./img/lucy.jpeg" \
${URL}/v1_0/feeds
```

### GET feeds (READ)
* with auth

```
curl -X GET \
-H 'X-Api-Key: abcdef123456' \
-H "Content-Type:multipart/form-data" \
${URL}/v1_0/feeds
```
* without auth

```
curl -X GET \
-H "Content-Type:multipart/form-data" \
${URL}/v1_0/feeds
```

### GET user feeds (READ)
* success

```
curl -X GET \
-H 'X-Api-Key: abcdef123456' \
-H "Content-Type:multipart/form-data" \
${URL}/v1_0/user_feeds/cfec91b4-0227-408c-87b6-4b713eaa8832
```
```
curl -X GET \
-H 'X-Api-Key: abcdef123456' \
-H "Content-Type:multipart/form-data" \
${URL}/v1_0/user_feeds/e6f80353-e8b3-4543-886f-061c0177087b
```
* without auth

```
curl -X GET \
-H "Content-Type:multipart/form-data" \
${URL}/v1_0/user_feeds/cfec91b4-0227-408c-87b6-4b713eaa8832
```
* wrong id

```
curl -X GET \
-H 'X-Api-Key: abcdef123456' \
-H "Content-Type:multipart/form-data" \
${URL}/v1_0/user_feeds/1234
```

### Delete feeds (DELETE)
* success

```
curl -X DELETE \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
-F 'data={"user_id": "cfec91b4-0227-408c-87b6-4b713eaa8832", "feed_id": "79bd09a9-9405-4dd0-a146-30af1ebfc1dc"}' \
${URL}/v1_0/feeds
```
* without auth

```
curl -X DELETE \
-H "Content-Type:multipart/form-data" \
-F 'data={"user_id": "cfec91b4-0227-408c-87b6-4b713eaa8832", "feed_id": "79bd09a9-9405-4dd0-a146-30af1ebfc1dc"}' \
${URL}/v1_0/feeds
```
* wrong format

```
curl -X DELETE \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
-F 'data={"user_id": "cfec91b4-0227-408c-87b6-4b713eaa8832", "feed_id": "1234"}' \
${URL}/v1_0/feeds
```
```
curl -X DELETE \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
-F 'data={"xxxx": "1234", "feed_id": "79bd09a9-9405-4dd0-a146-30af1ebfc1dc"}' \
${URL}/v1_0/feeds
```
* wrong user

```
curl -X DELETE \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
-F 'data={"user_id": "1234", "feed_id": "79bd09a9-9405-4dd0-a146-30af1ebfc1dc"}' \
${URL}/v1_0/feeds
```

### logout (UPDATE)
* success

```
curl -X DELETE \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
${URL}/v1_0/logout/cfec91b4-0227-408c-87b6-4b713eaa8832
```
* without auth

```
curl -X DELETE \
-H "Content-Type:multipart/form-data" \
${URL}/v1_0/logout/cfec91b4-0227-408c-87b6-4b713eaa8832
```
* wrong id

```
curl -X DELETE \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
${URL}/v1_0/logout/1234
```
* wrong user

```
curl -X DELETE \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
${URL}/v1_0/logout/e6f80353-e8b3-4543-886f-061c0177087b
```

## additional test without CRUD

### GET login
```
curl -X GET \
-H "Content-Type:multipart/form-data" \
${URL}/v1_0/login
```
### GET homepage
* with auth

```
curl -X GET \
-H "Content-Type:multipart/form-data" \
-H 'X-Api-Key: abcdef123456' \
${URL}/v1_0/home
```
* without auth

```
curl -X GET \
-H "Content-Type:multipart/form-data" \
${URL}/v1_0/home
```
