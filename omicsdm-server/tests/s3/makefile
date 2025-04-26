
aws_http=http://127.0.0.1:5000
AWS := /usr/local/aws-cli/v2/2.9.6/bin/aws
bucket=bucketdevelomicsdmcellxgene

run:
	moto_server

get_buckets:
	$(AWS) --endpoint-url=${aws_http} s3 ls

create_bucket:
	$(AWS) --endpoint-url=${aws_http} s3 mb s3://${bucket} 

upload_file:
	$(AWS) --endpoint-url=${aws_http} s3 cp test2.csv s3://${bucket}/cnag/test/test2.csv 

files:
	$(AWS) --endpoint-url=${aws_http} s3 ls s3://${bucket}/cnag/test/
