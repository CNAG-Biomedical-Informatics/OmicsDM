import requests
from os import environ

def get_kc_token():
	# Authenticate with Keycloak to get access token
	data = {
	'client_id': environ.get("CLIENT_ID"),
	'client_secret': environ.get("CLIENT_SECRET"),
	'grant_type': 'password',
	'username': environ.get("USERNAME"),
	'password': environ.get("PASSWORD"),
	'scope': 'openid'
	}
	response = requests.post(
		environ.get("KEYCLOAK_URL"),
		data=data,
		verify=False
	)

	response_data = response.json()
	if 'access_token' not in response_data:
		print("Authentication failed!")
		exit()
	else:
		# print("Authentication successful!")
		# print(f"Access token: {response_data['access_token']}")
		return response_data['access_token']