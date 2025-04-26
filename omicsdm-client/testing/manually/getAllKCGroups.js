const fetch = require("node-fetch");
const https = require("https");
const fs = require("fs");
require("dotenv").config();

const httpsAgent = new https.Agent({
  // rejectUnauthorized: false,
  ca: fs.readFileSync(process.env.CA_PATH),
});

const get_keycloak_token_using_password = async () => {
  const realm = process.env.REALM;
  const url = `${process.env.AUTH_URL}/realms/${realm}/protocol/openid-connect/token`;

  const params = new URLSearchParams([
    ["grant_type", "password"],
    ["client_id", process.env.CLIENT_ID],
    ["username", process.env.USERNAME],
    ["password", process.env.PASSWORD],
    ["scope", "openid"],
  ]).toString();

  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
    agent: httpsAgent,
  });
  const token = await res.json();
  
  return token.access_token;
};

const groups_get = (token, url) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
  
  return fetch(url, { method: "GET", headers: headers, agent: httpsAgent });
};

const getAllGroups = async () => {
  const token = await get_keycloak_token_using_password();
  const url = `${process.env.AUTH_URL}/admin/realms/3TR/groups`;
  const res = await groups_get(token, url);
  
  let groupData = await res.json();
  
};
getAllGroups();
