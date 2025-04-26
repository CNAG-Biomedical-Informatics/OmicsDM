import json

import requests

from functools import wraps
import time


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
    MB = float(KB ** 2)  # 1,048,576
    GB = float(KB ** 3)  # 1,073,741,824
    TB = float(KB ** 4)  # 1,099,511,627,776

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


@timeit
def upload_files(meta_data, header):

    data = {"file": []}
    for meta in meta_data:
        pass

    data["metaData"] = json.dumps(meta_data)

    # files = {"file": (file_name, data["file"][0], "text/xml")}

    url = "http://localhost:8082/api/presignedUrl?arg=upload"

    # bandit precommit hook is failing when verify=False
    res = requests.post(
        url, files=files, data=data, headers=header, verify=True
    )
    print(res.text)
    return res, res.status_code


token = "eyJh..."

header = {"Authorization": token, "Content-type": "application/json"}

test_file_name = "testfile1.csv"
test_file_name2 = "1Mr_10c.csv"
# test_file_name = "10Mr_10c.csv"
# test_file_name = "20Mr_10c.csv"


files = (
    [
        {
            "name": test_file_name,
            "version": 1,
            "dataset_id": "test",
            "owner": "3tr",
        },
        {
            "name": test_file_name2,
            "version": 1,
            "dataset_id": "test",
            "owner": "3tr",
        },
    ],
)

files = [
    {
        "name": test_file_name,
        "version": 1,
        "dataset_id": "t",
        "owner": "3tr",
    }
]

url = "http://localhost:8082/api/presignedUrl?arg=download"

print(files)

res = requests.post(url, headers=header, data=json.dumps(files), verify=True)

print(res)
