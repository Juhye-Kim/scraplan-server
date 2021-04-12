const { User } = require("../../models");

const nock = require("nock");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const { expect } = require("chai");

chai.should();
chai.use(chaiHttp);

const url = "/google-sign/out";
const reqFunc = (url, method, req, cb) => {
  switch (method) {
    case "post":
      chai.request(server).post(url).send(req).end(cb);
      break;
    case "patch":
      chai.request(server).patch(url).send(req).end(cb);
      break;
    case "patchWithAccessToken":
      const { accessToken } = req;
      if ("accessToken" in req) {
        delete req.accessToken;
      }
      chai
        .request(server)
        .patch(url)
        .set({ authorization: `Bearer ${accessToken}` })
        .send(req)
        .end(cb);
      break;
  }
};

describe("🔥PATCH /google-sign/out", () => {
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

  it("check email required", (done) => {
    const req = {
      accessToken,
    };
    reqFunc(url, "patchWithAccessToken", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check accessToken required", (done) => {
    const req = {
      email,
    };
    reqFunc(url, "patchWithAccessToken", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check ignore empty accessToken", (done) => {
    const req = {
      accessToken: "",
      email,
    };
    reqFunc(url, "patchWithAccessToken", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check sign out", (done) => {
    const req = {
      accessToken,
      email,
    };
    reqFunc(url, "patchWithAccessToken", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.property("message").eql("Successfully logouted");

      User.findOne({
        where: { email },
        raw: true,
      })
        .then((userInfo) => {
          userInfo.should.property("latestToken").is.null;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
