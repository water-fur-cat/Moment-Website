class Config(object):

  CLOUD_STORAGE_BUCKET = "feeds_images"
  CLOUD_STORAGE_BUCKET_AVARTOR = "moments_avatar"
  SERVICE_ACCOUNT = "mymemo-final-project-dzz-d703a4ba9e13.json"
  API_KEY = "abcdef123456"
  ADMIN_USERNAME = 'admin'
  ADMIN_PASSWORD = '123'
  """API Key decorator
  Test using the command line using curl:
  curl -H'X-Api-Key: abcdef123456' 'http://127.0.0.1:5000/api/dogs'
  """
