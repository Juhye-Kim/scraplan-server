const { User } = require("../../models");

const nock = require("nock");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const { expect } = require("chai");

chai.should();
chai.use(chaiHttp);

const url = "/google-sign/withdraw";
const reqFunc = (url, method, req, cb) => {
  switch (method) {
    case "post":
      chai.request(server).post(url).send(req).end(cb);
      break;
    case "patch":
      chai.request(server).patch(url).send(req).end(cb);
      break;
    case "delete":
      const { accessToken } = req;
      if ("accessToken" in req) {
        delete req.accessToken;
      }
      chai
        .request(server)
        .delete(url)
        .set({ authorization: `Bearer ${accessToken}` })
        .send(req)
        .end(cb);
      break;
  }
};

describe("🔥DELETE /google-sign/withdraw", () => {
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
    nock("https://oauth2.googleapis.com")
      .persist()
      .post("/revoke?token=temp-access-token")
      .reply(200);
    nock("https://oauth2.googleapis.com")
      .persist()
      .post("/revoke?token=failed-access-token")
      .reply(404);
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
      hashData: "#access_token=temp-access-token",
    };

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check accessToken required", (done) => {
    const req = {
      email,
      hashData: "#access_token=temp-access-token",
    };

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check hashData required", (done) => {
    const req = {
      accessToken,
      email,
    };

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check ignore wrong email", (done) => {
    const req = {
      accessToken,
      email: "tset@test.com",
      hashData: "#access_token=temp-access-token",
    };

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(401);
      res.body.should.have.property("message").eql("Wrong access");
      done();
    });
  });
  it("check withdraw user", (done) => {
    const req = {
      accessToken,
      email,
      hashData: "#access_token=temp-access-token",
    };

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("Successfully processed");

      User.findOne({ where: { email } })
        .then((userInfo) => {
          expect(userInfo).to.be.null;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
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
  it("check withdraw user when google api returned 404", (done) => {
    const req = {
      accessToken,
      email,
      hashData: "#access_token=failed-access-token",
    };

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("Successfully processed");
      User.findOne({ where: { email } })
        .then((userInfo) => {
          expect(userInfo).to.be.null;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
