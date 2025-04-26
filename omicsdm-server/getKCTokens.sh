#!/bin/bash

#import keycloak credentials
. kc.env

[ -f vscode.env ] && truncate -s 0 vscode.env
# [ -f .env ] && truncate -s 0 .env

USERS=($USER1 $USER2 $USER3 $USER4)
for((i=0;i<${#USERS[@]};i++)); do
	USERNAME=${USERS[$i]}
	KEYCLOAK_URL="http://$HOST/realms/$REALM/protocol/openid-connect/token"
	RES=$(curl -X POST "$KEYCLOAK_URL" "--insecure" \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-d "username=$USERNAME" \
	-d "password=$PASSWORD" \
	-d "grant_type=password" \
	-d "client_id=$CLIENT_ID")

	ERROR=$(grep 'error' <<< $RES)
	if ! [ -z "$ERROR" ];then echo "$ERROR";exit 1;fi

	TOKEN=$(echo $RES | jq -r '.access_token')
	# echo $TOKEN

	NUM=$((i+1))
	echo $NUM
	echo "TOKEN$NUM="$TOKEN >> vscode.env
	echo "export TOKEN$NUM="$TOKEN >> .env
done
echo "KC env files have been generated"
exit 0
