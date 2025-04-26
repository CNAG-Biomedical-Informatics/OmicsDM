import requests
from requests.exceptions import Timeout

from server.app import app
from server.utils.error_handler import ServiceUnavailable

cfg = app.config


def get_all_kc_groups(token):
    """
    Get all groups from keycloak
    and check if the group is in the list
    """
    url = f"{cfg['AUTH_BASE_URL']}/admin/realms/{cfg['AUTH_REALM']}/groups"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(  # nosec (for now, should be changed)
            url, headers=headers, verify=False, timeout=10
        )
    except Timeout:
        print("Timeout has been raised.")

    # TODO
    # return the error message that the user is not configured
    # correctly. Please contact the keycloak adminstrators to resolve this

    # if response.status_code == 403:
    #     raise ServiceUnavailable("Service unavailable")

    if response.status_code != 200:
        print("url", url)
        print("headers", headers)
        raise ServiceUnavailable(
            "Keycloak",
            response.text,
            response.reason,
            status_code=response.status_code,
        )

    # * if it returns unknown error the admin user is not configured correctly
    # asign the following role to the admin user
    # realm-management -> query-groups

    groups = [res["name"] for res in response.json()]
    groups.remove("admin")
    return groups


def is_valid_kc_group(group_name, token):
    """
    Get all groups from keycloak
    and check if the group is in the list
    """
    groups = get_all_kc_groups(token)
    return group_name in groups
