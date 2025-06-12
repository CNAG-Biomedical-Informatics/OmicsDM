import requests
import logging

# Configuration
SHINY_PROXY_URL = 'https://shinyproxy.cnag.dev/' 
ENDPOINT = 'api/proxyspec'
USERNAME = 'admin'
PASSWORD = '1234'

response = requests.get(
    f"{SHINY_PROXY_URL}{ENDPOINT}", 
    auth=(USERNAME, PASSWORD)
)

if response.status_code != 200:
    print("Authentication failed!")
    print(f"Status Code: {response.status_code}")
    print(f"Response Content: {response.text}")
    exit()

print(response.json())