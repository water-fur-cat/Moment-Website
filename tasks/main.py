import logging, time
from flask import Flask
from google.cloud import datastore
from google.cloud import exceptions

environment = 'config.Config'
app = Flask(__name__)
app.config.from_object(environment)

logging.basicConfig(level = logging.DEBUG)

@app.route("/tasks/health_check", methods=["GET"])
def health_check():
    try:
        datastore_client = datastore.Client.from_service_account_json(app.config['SERVICE_ACCOUNT'])
        with datastore_client.transaction():
            key = datastore_client.key("Utilities", "Health")
            task = datastore_client.get(key)
            if task is None:
                task = datastore.Entity(key)
            check_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(int(time.time())))
            task['health_timestamp'] = check_time
            datastore_client.put(task)
        logging.info("Health check succeeded at: " + check_time)
    except exceptions.GoogleCloudError as exception:
        logging.error("Health check failed: " + str(exception))
        return "Internel Server Error", 500
    return "health checking done", 200

if __name__ == "__main__":
    app.run(debug=True)