import sys
from query_shinyproxy import query_shinyproxy

def query_containerProxy(method, spec_id="03_cellxgene",data={}):
    print("method:", method)
    print("spec_id:",spec_id)
    endpoint = "proxy"	

    response = query_shinyproxy(endpoint, method="GET", data={})
    data = response["data"]

    proxy_id = None
    for item in data:
        if item["specId"] == spec_id:
            proxy_id = item["id"]
            break

    if proxy_id is None:
        print(f"Spec ID {spec_id} not found!")
        print("Container not running!")
        exit()

    if method == "GET":
        # get the status of the container
        response = query_shinyproxy(f"{proxy_id}/status", method="GET", data={})
        print("response:", response)

    elif method == "PUT":
        print("####### PUT method")
        # stop the container
        response = query_shinyproxy(f"{proxy_id}/status", method="PUT", data=data)
        print("response:", response)

if __name__ == "__main__":
        args = sys.argv

        # Print the arguments
        print("Arguments passed:", args)

        url = 'https://shinyproxy.cnag.dev/api'
        endpoint = f"{url}/proxy"
        data = None

        method = args[1]
        spec_id = args[2]

        data = {}
        if len(args) > 3:
            data = args[3]

        query_containerProxy(method, spec_id="03_cellxgene", data=data)