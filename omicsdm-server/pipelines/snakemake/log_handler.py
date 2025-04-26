import requests
import json

# can be used as follows:
# snakemake -c1 --log-handler-script log_handler.py

# advantage we would not have to parse the full log file
# to get the pipeline progress + Snakemake error messages
# However we would still need to parse the
# Jenkins log file to get the R error messages or the R log output
# Therefore not used for now


def get_token():
    url = ""
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "username": "",
        "password": "",
        "grant_type": "password",
        "client_id": "",
    }
    response = requests.post(url, headers=headers, data=data)
    return response.json()["access_token"]


def log_handler(msg):
    headers = {
        "Content-Type": "application/json",
        "authorization": get_token(),
    }

    # check if the message cn be converted to json
    data = None
    try:
        data = json.dumps(msg)
        print(data)
    except Exception as e:
        print(f"Error converting message to json: {e}")

    if data:
        requests.post(
            "http://localhost:8080/api/analysis/logs",
            headers=headers,
            data=json.dumps(data),
        )
