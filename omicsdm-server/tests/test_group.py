# import json

# from utils import req_get, req_post, req_put, req_del, create_datasets

# TODO
# figure out if the grouplist api is still needed

# class TestGroupClass:
#     def test_datasets_create(
#         self, client, header, header_2, header_3, dataset_fields
#     ):
#         """
#         needed to create groups
#         """

#         # test2 and test are in that order to make sure
#         # that the dataset list sorting works
#         datasets_headers = [
#             (["test"], header),
#             (["test"], header_2),
#             (["test"], header_3),
#         ]
#         res = create_datasets(client, datasets_headers, dataset_fields)
#         response = json.loads(res.data.decode("utf8"))
#         assert "dataset inserted" in response["message"]

#     def test_get_groups(self, client, header):

#         res = req_get(
#             client,
#             header,
#             "grouplist",
#         )

#         response = json.loads(res.data.decode("utf8"))

#         assert 200 == res.status_code
#         assert "cnag" in response
#         assert "3tr" not in response

#     def test_group_post_not_allowed(self, client, header):

#         res = req_post(
#             client,
#             header,
#             "grouplist",
#             {"id": "test"},
#         )
#         assert 405 == res.status_code
#         assert "405 METHOD NOT ALLOWED" == res.status

#     def test_group_put_not_allowed(self, client, header):

#         res = req_put(
#             client,
#             header,
#             "grouplist?arg",
#             ["dataset=test", "group=test"],
#         )

#         assert 405 == res.status_code
#         assert "405 METHOD NOT ALLOWED" == res.status

#     def test_group_del_not_allowed(self, client, header):

#         res = req_del(
#             client,
#             header,
#             "grouplist",
#             {"id": "test"},
#         )
#         assert 405 == res.status_code
#         assert "405 METHOD NOT ALLOWED" == res.status
