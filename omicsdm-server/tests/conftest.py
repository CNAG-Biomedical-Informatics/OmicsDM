import sys
from os import path
import pytest
from io import BytesIO

# sys.path.append(path.join(path.dirname(__file__), "server"))
from server.app import app
from server.model import db

from server.config.config_test import DevelopmentConfig
from server.config.config_3tr_client import ClientConfig

sys.path.append(path.join(path.dirname(__file__), "helpers"))
from utils import get_header, MyTester  # noqa: E402

# Content-type constant
content_type = "application/json"


@pytest.fixture(scope="module")
def header():
    return get_header("test", DevelopmentConfig)


@pytest.fixture(scope="module")
def header_2():
    return get_header("test2", DevelopmentConfig)


@pytest.fixture(scope="module")
def header_3():
    return get_header("test3", DevelopmentConfig)


@pytest.fixture(scope="module")
def header_4():
    return get_header("test4", DevelopmentConfig)


@pytest.fixture(scope="module")
def header_5():
    return get_header("test5", DevelopmentConfig)


@pytest.fixture(scope="module")
def header_admin():
    return get_header("admin", DevelopmentConfig)


@pytest.fixture(scope="module")
def client(request, scope="class"):
    with app.app_context():
        test_client = app.test_client()
        # app.app_context().push()
        db.drop_all()
        db.create_all()
        test_client.headers = {
            "Content-Type": content_type,
            "Authorization": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJRUGRBRE9LdzlFVk1hTFFLOGwydFZWcW1WYmhSd1l0WFhhZ19UNWhXOHlJIn0.eyJleHAiOjE3MzQwMjk2MzgsImlhdCI6MTczNDAyOTMzOCwianRpIjoiYmMwNjhjMDgtZmUzNS00M2UyLTk3ZjUtOGRmN2VhNzk3OGUzIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9TaGlueXByb3h5IiwiYXVkIjpbInNoaW55cHJveHkiLCJhY2NvdW50Il0sInN1YiI6ImMyYjU0YzBmLTdkY2YtNGYzOC05OThhLWNiYzkzNmQwZDJkMiIsInR5cCI6IkJlYXJlciIsImF6cCI6Im9taWNzZG0iLCJzZXNzaW9uX3N0YXRlIjoiYTgwZjUyNjEtZmZkYS00MGUwLTg1Y2QtZmRiMmVkMGQzODAzIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjUwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtcmVhY3RfYXBwX3JlYWxtIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSBzaGFyZWRfbWFwcGVycyIsInNpZCI6ImE4MGY1MjYxLWZmZGEtNDBlMC04NWNkLWZkYjJlZDBkMzgwMyIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6InRlc3QgdGVzdCIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3RAdGVzdC5jb20iLCJnaXZlbl9uYW1lIjoidGVzdCIsImZhbWlseV9uYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImdyb3VwIjpbIi9jbmFnIl19.qIMWUzVGsc5zdO-TkCvI7FIl3ygDMiqxR-QTfM6by0hILTrAZEiEIc031Fu7XrkEIHObAbS7uC148TjxkVt-bnu2kE9V1qGdOnQgRhq9DS3ZSenVR586SLGHykYuQwp2TSW9cEJjo9mSQOJQeR0s0TjAtA3FUw_3ZowG_S8mYgYWZlUP792yccqJdmJaL0ltFvNDBiyH-Z6bxmdIo6YTYiGuhMm1Y7K_iSFRxeCbRqyC3wT9gZ3016kbSer-jsBvYymmM3MQQYObkcHj0hvjfOYTiQAYsi13XvPr3bPGFiXm7JCZYYU7KGry6sa_sc8BggkisY_u5AMf7Yyt3QKeww",
        }
        # app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tmp.db'

    def teardown():
        with app.app_context():
            print("Teardown")
            db.drop_all()
            # app.app_context().push()
            pass  # databases and resourses have to be freed at the end. But so far we don't have anything

    request.addfinalizer(teardown)
    return test_client


# @pytest.fixture(scope="module")
# def client(request):
#     app.testing = True  # propagate exceptions to the test client
#     # ! overwrite app.config set in run.py
#     # ! not working as expected
#     # it is overwriting but regarding the
#     # the IDRSA too late because it still takes the
#     # IDRSA from config.py and not from config_test.py
#     # So before this is fixed the tests cannot be run on the master branch
#     # maybe it is a race condition
#     app.config.from_object(DevelopmentConfig)
#     test_client = app.test_client()

#     db.create_all()

#     def teardown():
#         db.drop_all()
#         db.session.remove()

#     request.addfinalizer(teardown)
#     return test_client


@pytest.fixture()
def project_fields():
    return [
        ("id", "str"),
        ("name", "str"),
        ("description", "str"),
        ("owners", "list(str)"),
        ("datasetVisibilityDefault", "str"),
        ("datasetVisibilityChangeable", "bool"),
        ("fileDlAllowed", "bool"),
        ("diseases", "list(str)"),
        ("logoUrl", "str"),
    ]


@pytest.fixture()
def dataset_fields_old():
    return [
        "id",
        "name",
        "description",
        "tags",
        "responsible_partner",
        "disease",
        "treatment",
        "category",
        "visibility",
    ]


@pytest.fixture()
def dataset_fields():

    # TODO
    # return all the fields
    # similar to fields below

    # fields = ClientConfig.SUBMIT_DATASETS_HEADERS

    return [
        "id",
        "project_id",
        "name",
        "disease",
        "treatment",
        "molecularInfo",
        "sampleType",
        "dataType",
        "valueType",
        "platform",
        "genomeAssembly",
        "annotation",
        "samplesCount",
        "featuresCount",
        "featuresID",
        "healthyControllsIncluded",
        "additionalInfo",
        "contact",
        "tags",
        "visibility",
    ]


@pytest.fixture()
def datasets_fields_mandatory_and_string():

    fields = ClientConfig.SUBMIT_DATASETS_HEADERS

    mandatory_fields = [
        field["id"]
        for field in fields
        if field["mandatory"] is True and field["inputType"] == "text"
    ]

    mandatory_fields.append("project_id")

    for field in ["samplesCount", "featuresCount"]:
        mandatory_fields.remove(field)

    return mandatory_fields


@pytest.fixture()
def file_fields():
    return ["projectId", "DatasetID", "fileName", "Comment"]


@pytest.fixture()
def view_query():
    return {"page": 1, "pageSize": 100, "sorted": None, "filtered": None}


@pytest.fixture()
def empty_file():
    script_dir = path.dirname(__file__)
    with open(path.join(script_dir, "data/emptyfile.csv"), "rb") as fh:
        return BytesIO(fh.read())


@pytest.fixture
def tester(request):
    """Create tester object"""
    return MyTester(request.param)


@pytest.fixture
def db_uri():
    return DevelopmentConfig.SQLALCHEMY_DATABASE_URI
