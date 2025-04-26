module.exports = {
  request: {
    https: {
      rejectUnauthorized: false,
    },
  },
  environments: {
    local: {
      host: "http://localhost:8082/api",
    },
    dev: {
      host: "https://3tr.cnag.crg.dev/omics_datamanagement_service/api",
    },
  },
  // defaultHeaders:{
  //   Authorization: "{{token}}"
  // },
  configureHooks: (api) => {
    api.hooks.onRequest.addHook("removeBearer", (request) => {
      if (request.headers.Authorization) {
        request.headers.Authorization = request.headers.Authorization.replace(
          "Bearer",
          ""
        );
      }
    });
    api.hooks.onResponse.addHook("kcgroup", (response, { variables }) => {
      const accessToken = api.utils.decodeJWT(
        variables.oauth2Session.accessToken
      );
      variables.kcgroups = accessToken.group.map((e) => e.slice(1));
      delete response.access_token
    });
    api.hooks.responseLogging.addHook("removeSensitiveData", (response) => {
      if (response.request) {
        delete response.request.headers["authorization"];
      }
    });
  },
};
