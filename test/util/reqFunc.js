const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");

chai.use(chaiHttp);

module.exports = (url, method, req, cb) => {
  const { accessToken } = req;
  if ("accessToken" in req) {
    delete req.accessToken;
  }
  const authorization = accessToken
    ? { authorization: `Bearer ${accessToken}` }
    : {};

  switch (method) {
    case "get":
      chai.request(server).get(url).set(authorization).send(req).end(cb);
      break;
    case "post":
      chai.request(server).post(url).set(authorization).send(req).end(cb);
      break;
    case "patch":
      chai.request(server).patch(url).set(authorization).send(req).end(cb);
      break;
    case "delete":
      chai.request(server).delete(url).set(authorization).send(req).end(cb);
      break;
  }
};
