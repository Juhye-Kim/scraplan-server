const { User } = require("../../models");

const nock = require("nock");
const chai = require("chai");
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");

chai.should();

describe("🔥GET /user/info", () => {
  let accessToken,
    email,
    nickname = "yubin-j";
  before(async () => {
    await User.destroy({
      where: {},
    });

    if (!nock.isActive()) {
      nock.activate();
    }

    nock("https://people.googleapis.com")
      .persist()
      .get("/v1/people/me?personFields=emailAddresses")
      .reply(200, {
        resourceName: "testGoogleId",
        emailAddresses: [
          {
            value: "testGoogle@test.com",
          },
        ],
      });
  });

  after(() => {
    nock.cleanAll();
    nock.restore();
  });

  it("sign up and in", (done) => {
    const req = {
      hashData: "#access_token=temp-access-token",
      nickname,
    };
    reqFunc("/google-sign/up", "post", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("Successfully signedup");

      delete req.nickname;
      reqFunc("/google-sign/in", "patch", req, (err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("accessToken");
        res.body.should.have.property("email");

        accessToken = res.body.accessToken;
        email = res.body.email;

        done();
      });
    });
  });

  it("check ignore none exists email", (done) => {
    reqFunc(`/user/info/1234@test.com`, "get", {}, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("No user with given info");
      done();
    });
  });

  it("check ignore none exists email in token check", (done) => {
    const req = {
      accessToken,
    };
    reqFunc(`/user/info/1234@test.com`, "get", req, (err, res) => {
      res.should.have.status(401);
      res.body.should.have.property("message").eql("Wrong access");
      done();
    });
  });

  it("check ignore wrong accessToken", (done) => {
    const req = {
      accessToken: "!!!!!",
    };
    reqFunc(`/user/info/${email}`, "get", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("get info witdhout auth", (done) => {
    reqFunc(`/user/info/${email}`, "get", {}, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("isValid").eql(false);
      res.body.should.have.property("email").eql(email);
      res.body.should.have.property("nickname").eql(nickname);
      done();
    });
  });

  it("get info witdhout auth", (done) => {
    const req = {
      accessToken,
    };
    reqFunc(`/user/info/${email}`, "get", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("isValid").eql(true);
      res.body.should.have.property("email").eql(email);
      res.body.should.have.property("nickname").eql(nickname);
      done();
    });
  });
});
