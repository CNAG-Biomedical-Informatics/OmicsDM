import json

from utils import req_get


class TestAuthClass:
    def test_token(self, client, header):
        res = req_get(client, header, "tokentest")
        response = json.loads(res.data.decode("utf8"))
        assert "test" in response["user"]
        assert "3tr" in response["groups"]
