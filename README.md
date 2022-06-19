
# Reference
We used two web page templates and adapted them to our application.

https://colorlib.com/wp/template/creative-login-form/

https://bbbootstrap.com/snippets/bootstrap-5-myprofile-90806631

# Group members
1. Shitong Dong; stdong(CnetId); shitongdong(Github id)
2. Yue Zhou; zhouyue(CnetId); water-fur-cat(Github id)
3. Yusen Zhang; yusen(CnetId); 77kumiya(Github id)


# Executive summary

## High-level Overview
This app allows every user to post a "moment" which consists of some texts and a picture that everyone can see. The app also supports account registration, user profile management, and "moment" management.

## Functionality split

### Login
frontend: Username and password empty checking

backend: Username and password verification

### Signup
frontend: Username in use checking prompt

backend: Username in use checking database queries

### Moments management
frontend: Moments presenting

backend: Moments database management (CRUD)

### Profile management
frontend: Profile presenting

backend: Profile database management (CRUD)

### Analytics
frontend: Analytics data presenting

backend: Analytics database management (CRUD)

### Health checking
backend: Scheduled task


## Cost estimation

### Assumptions
1. 1,000,000 registered users
2. 100,000 daily active users (10%)
3. Size of texts in each moment is about 0.25 KB on average
4. Size of the image in each moment is about 100 KB on average
5. Size of moment entity in datastore: about 0.5 KB (text, iamge url, metedata)
6. All DAU will post on average 2 moments each day
7. All DAU will view on average 50 moments
8. Moments will be deleted monthly
9. All users are in USA


### Datastore
| Pricing items | Daily usage | Daily free usage | Daily usage in charge | Daily cost | Monthly cost |
| - | - | - | - | - | - |
| Read | 5,000,000 | 50,000 | 4,950,000 | 0.06/100000*4950000=2.97 | 89.1 |
| Write | 200,000 | 20,000 | 180,000 | 0.18/100000*180000=0.324 | 9.72 |
| Storage | 3GiB(monthly) | 1GiB | 2GiB(monthly) | 0.012 | 0.36 |
| Network | 521.3GiB | 0.333GiB | 521Gib | 5.21 | 156.3 |


### Cloud Storage
| Pricing items | Daily usage | Daily free usage | Daily usage in charge | Daily cost | Monthly cost |
| - | - | - | - | - | - |
| Class A operations | 200,000 | 0 | 200,000 | 0.05/10000*200000=1 | 30 |
| Storage | 600GiB(monthly) | 0GiB | 600GiB(monthly) | 0.52 | 15.6 |
| Network | 20GiB | 0GiB | 20Gib | 0.2 | 6 |


### App Engine
| Pricing items | Daily usage | Daily free usage | Daily usage in charge | Daily cost | Monthly cost |
| - | - | - | - | - | - |
| Running hour (5 instances) | 120 | 0 | 120 | 0.05*120=6 | 180 |
| Network | 1.25GiB | 0GiB | 1.25Gib | 0.15 | 4.5 |


### Cloud Function
| Pricing items | Daily usage | Daily free usage | Daily usage in charge | Daily cost | Monthly cost |
| - | - | - | - | - | - |
| Invokation | 200,000 | 666,667 | 0 | 0 | 0 |
| Running time | 100,000 (100ms) | 0 | 100,000 | 0.000000231*100000=0.0231 | 0.693 |
| Network | 0.0128GiB | 0GiB | 0.0128Gib | 0.001536 | 0.04608 |

### Total Monthly Cost: $492.31908

# Note
Running the application locally and visiting it through http:127.0.0.1 will prevent the home page displaying feeds. This is because feeds fetching requires https but the application is accessed via http.

# Application
https://mymemo-final-project-dzz.uc.r.appspot.com/v1_0/login

Please sign up an account to proceed.

# Analytics Dashboard
https://analytics-dot-mymemo-final-project-dzz.uc.r.appspot.com/analytics/login

Please login using username: admin and password: 123

We implemented analytics data collecting logic in our code.

Please note that the latest heath check time is in a timezone 4 hours later than CST. e.g. 14:00 means 10:00 in CST time.

# Scheduled tasks
https://tasks-dot-mymemo-final-project-dzz.uc.r.appspot.com/tasks/health_check

This task is hourly triggered by a cron job to do health check.