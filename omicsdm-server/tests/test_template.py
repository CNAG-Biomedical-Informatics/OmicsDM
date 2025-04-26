from utils import req_get, req_post, req_put, req_del

# TODO
# end2end test download template and make sure
# that the template has the correct fields


class TestTemplateClass:
    def test_template_project(self, client, header_admin):
        """
        download dataset template xlsx
        and make sure that it has the correct fields
        """

        # make sure that it is only accessible for admins

        with open("server/templates/project_template.xlsx", "rb") as file:
            data = file.read()

        response = req_get(
            client,
            header_admin,
            "template?arg=project",
        )

        assert 200 == response.status_code
        assert data == response.data

    def test_template_project_not_admin(self, client, header):
        """
        download dataset template xlsx
        and make sure that it has the correct fields
        """
        response = req_get(
            client,
            header,
            "template?arg=project",
        )

        # TODO
        # figure out why not status code 403 is returned
        assert "You are not allowed to create a project" == response["message"]

    def test_template_dataset(self, client, header):
        """
        download dataset template xlsx
        and make sure that it has the correct fields
        """
        with open("server/templates/dataset_template.xlsx", "rb") as file:
            data = file.read()

        response = req_get(
            client,
            header,
            "template?arg=dataset",
        )

        assert 200 == response.status_code
        assert data == response.data

    def test_template_file(self, client, header):
        """
        download file template xlsx
        and make sure that it has the correct fields
        """

        with open("server/templates/file_template.xlsx", "rb") as file:
            data = file.read()

        response = req_get(
            client,
            header,
            "template?arg=file",
        )

        assert 200 == response.status_code
        assert data == response.data

    def test_template_arg_not_allowed(self, client, header):
        """
        only argument dataset or file should be allowed
        """

        response = req_get(
            client,
            header,
            "template?arg=arg",
        )

        assert 405 == response.status_code
        assert "405 METHOD NOT ALLOWED" == response.status
        assert "arg forbidden" == response.json["message"]

    def test_template_post_not_allowed(self, client, header):

        res = req_post(
            client,
            header,
            "template",
            {"id": "test"},
        )
        assert 405 == res.status_code
        assert "405 METHOD NOT ALLOWED" == res.status

    def test_template_put_not_allowed(self, client, header):

        res = req_put(
            client,
            header,
            "template?arg",
            ["dataset=test", "group=test"],
        )

        assert 405 == res.status_code
        assert "405 METHOD NOT ALLOWED" == res.status

    def test_template_del_not_allowed(self, client, header):

        res = req_del(
            client,
            header,
            "template",
            {"id": "test"},
        )
        assert 405 == res.status_code
        assert "405 METHOD NOT ALLOWED" == res.status
