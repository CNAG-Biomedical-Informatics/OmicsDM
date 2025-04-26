import json


class TestHealthClass:
    def test_curl(self, client):
        res = client.get("/api/curltest")
        response = json.loads(res.data.decode("utf8"))
        assert "OK" in response["curlTest"]
