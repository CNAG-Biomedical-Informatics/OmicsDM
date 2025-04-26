import boto3

boto3_client_args = {
    "aws_access_key_id": "admin",
    "aws_secret_access_key": "12345678",
    "endpoint_url": "http://localhost:9000/",
    "verify": False,
}

s3_resource = boto3.resource("s3", **boto3_client_args)
print(s3_resource)

buckets = s3_resource.buckets.all()

for bucket in buckets:
    print(bucket.name)
