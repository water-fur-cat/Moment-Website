import logging
from google.cloud import datastore, exceptions

datastore_client = datastore.Client()

logging.basicConfig(level = logging.DEBUG)

def decrease_image_count(event, context):
    """Triggered by a change to a Cloud Storage bucket.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """
    logging.info("Cloud function 'decrease_image_count' started running")
    
    try:
        with datastore_client.transaction():
            key = datastore_client.key("Utilities", "Image")
            entity = datastore_client.get(key)
            if entity is None:
                logging.warning("Cloud function 'decrease_image_count': entity does not exist")
                return
            if 'count' not in entity:
                logging.warning("Cloud function 'decrease_image_count': 'count' attribute  does not exist")
                return
            if entity['count'] == 0:
                logging.warning("Cloud function 'decrease_image_count': attempted to decrease 'count' below 0, adjusted to 0")
                entity['count'] = 1
            entity['count'] -= 1
            datastore_client.put(entity)
        logging.info("Cloud function 'decrease_image_count' finished running")
    except exceptions.GoogleCloudError as exception:
        logging.error("Cloud function 'decrease_image_count' failed: " + str(exception))