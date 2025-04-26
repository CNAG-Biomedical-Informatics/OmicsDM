#!/bin/bash

#import token
. vscode.env
. kc.env

echo "TOKEN"
echo $TOKEN1

KEYCLOAK_URL="http://$HOST/auth/admin/realms/$REALM/groups"
echo $KEYCLOAK_URL

RES=$(curl -X -v GET "$KEYCLOAK_URL" "--insecure" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN1")

echo $RES
