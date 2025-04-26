import re
from traceback import TracebackException as tbException
import xml.etree.ElementTree as ET
from requests.exceptions import ConnectionError

# https://github.com/pycontribs/jenkinsapi
from jenkinsapi.jenkins import Jenkins
from jenkinsapi.job import Job
from jenkinsapi.custom_exceptions import JenkinsAPIException

from server.utils.error_handler import ServiceErroredOut, ServiceUnavailable

from requests.exceptions import HTTPError


def get_client(config):
    """
    create the client to connect to jenkins
    """

    client = None

    try:
        client = Jenkins(
            config["JENKINS_URL"],
            config["JENKINS_USERNAME"],
            config["JENKINS_TOKEN"],
            ssl_verify=False,
        )

    except ConnectionError as err:
        raise ServiceUnavailable(
            "Jenkins",
            "this function is not working right now, please try again later",
            err,
        )

    return client


def remove_job_from_queue(config, job_key):
    # TODO
    client = get_client(config)
    job_name = config["JENKINS_JOBS"][job_key]

    job = Job(client.baseurl + "/job/" + job_name, job_name, client)
    job.delete_from_queue


def get_console_output(job, build_number):
    jenkins_obj = job.get_jenkins_obj()
    # remove the build number from the url
    url = "/".join(job.url.rsplit("/", 2)[:-1])
    job_obj = jenkins_obj.get_job_by_url(url, job.name)
    build_obj = job_obj.get_build(build_number)

    return build_obj.get_console()


def error_parser(console_out):
    error_substring = "Error in rule"
    snakemake_log = console_out.split("---snakemake-logs---")[1].split("\r\n")
    error_in_rule = next(
        (string for string in snakemake_log if error_substring in string), None
    )

    output = {}
    if error_in_rule:
        output["errored_out_snakemake_rule"] = error_in_rule.replace(
            "Error in rule ", ""
        )[:-1]
        output["R_log"] = console_out.split("---R-logs---")[1]

    return output


def parse_console_output(console_out, job_failed=False):
    if "---snakemake-logs---" in console_out is False:
        return {}

    if job_failed:
        return error_parser(console_out)

    jenkins_log = []
    try:
        jenkins_log = console_out.split("---jenkins-logs---")[2].split("\r\n")
    except IndexError:
        return {}

    pattern = r"(\d+) of (\d+) steps \((\d+)%\) done"
    percentages = [
        int(re.search(pattern, entry).group(3))
        for entry in jenkins_log
        if re.search(pattern, entry)
    ]

    highest_percentage = max(percentages) if len(percentages) > 0 else None

    r_log = []
    try:
        r_log = console_out.split('[1] "---R-logs---"')[1:]
    except IndexError:
        return {}

    output = {
        "workflow_done_in_percent": highest_percentage,
        "r_log": r_log,
    }
    return output


def stop_job(config, analysis_info, analyses_settings):
    client = get_client(config)

    job_name = config["JENKINS_JOBS"]["base"]
    if analyses_settings["options"]["bases_on"]:
        job_name = config["JENKINS_JOBS"]["follow_up"]

    build_number = analysis_info["build_number"]
    job_url = f"{client.baseurl}/job/{job_name}"

    job = client.get_job_by_url(job_url, job_name)
    job.poll()

    # check if job is in queue or already running

    if job._data["inQueue"]:
        # ! TODO
        # figure out why deleting from queue does not work
        # 404 Client Error: Not Found for url:
        # https://jenkins.admin.dev/view/3TR/queue/api/python
        # job.delete_from_queue()

        jenkins_obj = job.get_jenkins_obj()
        # remove the build number from the url
        url = "/".join(job.url.rsplit("/", 2)[:-1])
        job_obj = jenkins_obj.get_job_by_url(url, job.name)
        job_obj.delete_from_queue()
        return "aborted"

    build = job.get_build(build_number)
    build.stop()

    job.poll()
    if job._data["color"] == "aborted":
        return "aborted"
    else:
        return "not aborted please try again"


def get_job_status(config, job_key, build_number):
    # TODO
    # another interesting way to get the job status would
    # be to set up the following:
    # https://snakemake.readthedocs.io/en/stable/executing/monitoring.html
    # https://github.com/panoptes-organization/panoptes

    # so then we would not need to query the jenkins api for the job status

    client = get_client(config)
    job_name = config["JENKINS_JOBS"][job_key]
    job_url = f"{client.baseurl}/job/{job_name}/{build_number}"

    try:
        job = Job(job_url, job_name, client)
    except HTTPError as err:
        res = err.response
        if res.status_code == 404 and res.url == f"{job_url}/api/python":
            return "QUEUE", None
        raise ServiceUnavailable(
            "Jenkins", "the requested job is not available yet", err
        )
    console_out = get_console_output(job, build_number)
    job.poll()
    if job._data["inProgress"]:
        console_out = parse_console_output(console_out)
        return "RUNNING", console_out

    result = job._data["result"]
    if result == "FAILURE":
        console_out = parse_console_output(console_out, job_failed=True)
        return "FAILURE", console_out

    console_out_mapping = {
        "ABORTED": "Job was aborted",
        "SUCCESS": None,
    }
    console_out = console_out_mapping.get(result, "Unknown error")
    return result, console_out


def run_job(config, job_key, params, started_jobs):
    """
    create a job object and use it to invoke a job run in Jenkins.
    The jobname is handed over from the frontend and resolved by
    config.py to its job name in Jenkins.
    """

    client = get_client(config)
    job_name = config["JENKINS_JOBS"][job_key]

    # get all the values of the key build_number from the started_jobs dict

    build_numbers = []
    if started_jobs:
        build_numbers = [job["build_number"] for job in started_jobs.values()]

    try:
        job = Job(client.baseurl + "/job/" + job_name, job_name, client)
        job.poll()
        queue_item = job.invoke(build_params=params)
        print(queue_item)

        # !NOTE the queue_id is not per job but per jenkins instance
        # therefore it cannot be used to get the job status
        queue_id = queue_item.queue_id
        print(queue_id)
        # but maybe interesting when trying to remove a job from the queue

        nextBuildNumber = job._data["nextBuildNumber"]
        # recursively check if the build number is already used
        # if so, increment the build number and check again
        while nextBuildNumber in build_numbers:
            nextBuildNumber += 1

        return nextBuildNumber

    except JenkinsAPIException as err:
        tb = tbException.from_exception(err)._str

        # extracts the json of the key "data=" and of the key "headers="
        json_data = re.search(r"([^\s]+)=({.*})", tb).group(2)
        html = tb.split("b'")[1].replace("'", "").replace("\\n", "")
        print(json_data)

        try:
            tree = ET.fromstring(html)
            print(tree)
        except ET.ParseError as err2:
            print(err2)
            # Jenkins error html could not be parsed
            # because of missmatched Tag (hr/)
            error = re.search(r"(<title>)(.*?)(<\/title>)", html).group(2)
            raise ServiceErroredOut("Jenkins", "job failed", error)

        raise ServiceErroredOut("Jenkins", "job failed", err)
