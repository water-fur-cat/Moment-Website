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