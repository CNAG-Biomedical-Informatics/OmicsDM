import json
import gzip
from io import BytesIO

from werkzeug.datastructures import FileStorage

import requests

from functools import wraps
import time

import os

# TODO
# this is no longer working


def timeit(func):
    @wraps(func)
    def timeit_wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        total_time = end_time - start_time

        if total_time > 60:
            print(f"{func.__name__} took {total_time/60:.2f} minutes")
        else:
            print(f"Function {func.__name__} took {total_time:.2f} seconds")
        return result

    return timeit_wrapper


def humanbytes(B):
    """Return the given bytes as a human friendly KB, MB, GB, or TB string."""
    B = float(B)
    KB = float(1024)
    MB = float(KB**2)  # 1,048,576
    GB = float(KB**3)  # 1,073,741,824
    TB = float(KB**4)  # 1,099,511,627,776

    if B < KB:
        return "{} {}".format(B, "Bytes" if 0 == B > 1 else "Byte")
    elif KB <= B < MB:
        return f"{B / KB:.2f} KB"
    elif MB <= B < GB:
        return f"{B / MB:.2f} MB"
    elif GB <= B < TB:
        return f"{B / GB:.2f} GB"
    elif TB <= B:
        return f"{B / TB:.2f} TB"


def read_test_file(fn):
    # script_dir = Path(__file__)
    test_files_path = f"data/{fn}"

    def is_gzipped(path):
        with open(path, "rb") as f:
            return f.read(2) == b"\x1f\x8b"

    try:
        open_fn = gzip.open if is_gzipped(test_files_path) else open
        with open_fn(test_files_path, "rb") as fh:
            return BytesIO(fh.read())
    except FileNotFoundError:
        print(f"file {test_files_path} does not exist")


# @timeit
def prepare_upload_files(meta_data, header):

    data = {"file": []}
    for meta in meta_data:
        for file_name in meta["File"]:
            test_file = read_test_file(file_name)
            data["file"].append(
                FileStorage(
                    stream=test_file, filename=file_name, content_type="text"
                )
            ),

    data["metaData"] = json.dumps(meta_data)
    print(data)

    # create_presigned_url("3tr/test", file_name)

    # print(res.text)
    return res.text


def run_upload_files(meta_data, presigned_url_string):

    data = {"file": []}
    for meta in meta_data:
        for file_name in meta["File"]:
            test_file = read_test_file(file_name)
            data["file"].append(
                FileStorage(
                    stream=test_file, filename=file_name, content_type="text"
                )
            ),

    data["metaData"] = json.dumps(meta_data)

    # files = {"file": (file_name, data["file"][0], "text/xml")}

    presigned_url_object = json.loads(presigned_url_string)
    print(presigned_url_object)

    # url_base = presigned_url_object["url"]

    # key=presigned_url_object["fields"]["key"]
    # AWSAccessKeyId=presigned_url_object["fields"]["AWSAccessKeyId"]
    # signature=presigned_url_object["fields"]["signature"]

    # url = f"{url_base}/{key}
    # ?AWSAccessKeyId={AWSAccessKeyId}&signature={signature}"
    # print("url:",url)

    url = presigned_url_object

    # bandit precommit hook is failing when verify=False
    res = requests.put(url, data["file"][0])
    print(res.text)
    return res.text


token = "eyJhb..."


header = {"Authorization": token}

test_file_name = "testfile.csv"
test_file_name = "1Mr_10c.csv"
test_file_name = "10Mr_10c.csv"
test_file_name = "20Mr_10c.csv"

files = [
    "testfile1.csv",
    # "1Mr_10c.csv",
    # "10Mr_10c.csv",
    # "20Mr_10c.csv",
    # "30Mr_10c.csv",
    # "40Mr_10c.csv",
    # "50Mr_10c.csv",
    # "60Mr_10c.csv",
    # "70Mr_10c.csv",
    # "80Mr_10c.csv",
    # "90Mr_10c.csv",
    # "100Mr_10c.csv"
]

# results:
# 1Mr_10c.csv --> 65.16 MB: 4.54 sec
# 10Mr_10c.csv --> 651.59 MB: 42.18 sec
# 20Mr_10c.csv --> 1.27 GB : 1.05 min
# 30Mr_10c.csv --> 1.91 GB : 1.50 min
# 40Mr_10c.csv --> 2.55 GB : Error msg see below
# 100Mr_10c.csv --> 6.36 GB : Error msg see below

# OverflowError: string longer than 2147483647 bytes

for test_file_name in files:
    meta_data = [
        {
            "DatasetID": "t",
            "File": [test_file_name],
            "Platform": "Pyrosequencing",
            "Comment": "test",
        }
    ]
    file_size = os.stat(f"data/{test_file_name}").st_size
    print(test_file_name, "-->", humanbytes(file_size))
    # print("Size of file :", file_size, "bytes")

    # generate presigned url
    res = prepare_upload_files(meta_data, header)
    print(res)

    # run_upload_files(meta_data,res)
