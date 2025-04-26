import { jwtDecode } from "jwt-decode";

export default {
  user: {
    authenticated: false,
    access_token: "",
  },
  getToken() {
    return this.user.keycloak !== undefined
      ? this.user.keycloak.token
      : false;
  },
  decoded() {
    return this.user.keycloak !== undefined
      ? jwtDecode(this.user.keycloak.token)
      : "empty";
  },
  setToken(user) {
    this.user = user;
    this.user.authenticated = true;
  },
  getUser() {
    console.log(this.user);
    return this.user;
  },
  getUserGroups() {
    if (window.Cypress) {
      return [localStorage.getItem('kcGroup')]
    }
    if (this.user.keycloak !== undefined) {
      console.log(this.user.keycloak.idTokenParsed)
      console.log(this.user.keycloak.idTokenParsed.group);
      // if this is undefined check if the Keycloak client has the group claim mapper enabled
      return this.user.keycloak.idTokenParsed.group.map(group => group.replace('/', ''));
    }
    return [];
  },
  tokenExpired() {
    const now = new Date();
    const secondsSinceEpoch = Math.round(now.getTime() / 1000);
    return this.decoded().exp > secondsSinceEpoch
      ? false
      : true;
  },
  logout() {
    this.user.keycloak.logout();
  },
};
