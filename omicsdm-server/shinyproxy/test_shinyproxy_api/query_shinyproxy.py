import sys
import requests
import json

from get_kc_token import get_kc_token


def query_shinyproxy(endpoint, method="GET", data={}):
    print("query_shinyproxy")
    print("method:", method)
    print("data:", data)

    kc_token = get_kc_token()

    url = 'https://shinyproxy.cnag.dev'
    endpoint = f'api/{endpoint}'
    print("endpoint:", endpoint)
    
    if method == "GET":
        response = requests.get(
                f'{url}/{endpoint}',
                headers={
                    'Authorization': f'Bearer {kc_token}',
                }
            )
    elif method == "PUT":
        print("PUT method")
        print("data:",data)
        print("data dumps:",json.dumps(data))
        response = requests.put(
            f'{url}/{endpoint}',
            headers={
                'Authorization': f'Bearer {kc_token}',
                'Content-Type': 'application/json'
            },
            # TODO
            # should not be hardcoded
            data = '{"desiredState":"Stopping"}'
        )

    elif method == "POST":
        print("POST method")
        print(f"{url}/{endpoint}")
        response = requests.post(
            # f'{url}/{endpoint}',
            'https://shinyproxy.cnag.dev/app_i/03_cellxgene/cellxgene',
            headers={
                'Authorization': f'Bearer {kc_token}',
                'Content-Type': 'application/json',
            },
            data='{"parameters":{"data_path": "test/pbmc3k.h5ad_uploadedVersion_1.h5ad"}}'
        ) 

    # The POST endpoint returns a SHINYPROXY_PUBLIC_PATH
    # which then could be returned to the user in order to access the app
    # example: 'SHINYPROXY_PUBLIC_PATH': '/app_proxy/d33e6580-a664-47ee-afd5-0fdfae0acf2a/'

    if response.status_code != 200:
        print("Authentication failed!")
        print(f"Status Code: {response.status_code}")
        print(f"Response Content: {response.text}")
        exit()

    print(response.json())
    return response.json()

if __name__ == "__main__":
    args = sys.argv

    # Print the arguments
    print("Arguments passed:", args)

    method = args[1]
    endpoint = args[2]

    data={}
    print("len(args):", len(args))
    if len(args) > 3:
        print("args[3]",args[3])
        data = args[3]

    print("method:", method)
    print("endpoint:", endpoint)
    print("data:", data)
    query_shinyproxy(endpoint, method, data)