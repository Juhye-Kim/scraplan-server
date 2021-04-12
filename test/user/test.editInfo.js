const { User } = require("../../models");

const nock = require("nock");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const { expect } = require("chai");

chai.should();
chai.use(chaiHttp);

const reqFunc = (url, method, req, cb) => {
  const { accessToken } = req;
  if ("accessToken" in req) {
    delete req.accessToken;
  }
  switch (method) {
    case "post":
      chai.request(server).post(url).send(req).end(cb);
      break;
    case "patch":
      chai.request(server).patch(url).send(req).end(cb);
      break;
    case "patchWithAccessToken":
      chai
        .request(server)
        .patch(url)
        .set({ authorization: `Bearer ${accessToken}` })
        .send(req)
        .end(cb);
      break;
  }
};

describe("🔥PATCH /user/edit-info", () => {
  let accessToken,
    email,
    nickname = "yubin-j";
  before(async () => {
    await User.destroy({
      where: {},
    });

    await User.create({
      email: "test@test.com",
      nickname: "test-user",
      password: 1234,
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
  it("check ignore request without access token", (done) => {
    const req = {
      email,
      nickname: "1234",
      password: "test",
    };

    reqFunc("/user/edit-info", "patch", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check ignore request without email", (done) => {
    const req = {
      accessToken,
      nickname: "1234",
      password: "test",
    };

    reqFunc("/user/edit-info", "patchWithAccessToken", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check ignore not matched accessToken and email ", (done) => {
    const req = {
      accessToken,
      email: "test@test.com",
      nickname: "1234",
      password: "test",
    };

    reqFunc("/user/edit-info", "patchWithAccessToken", req, (err, res) => {
      res.should.have.status(403);
      res.body.should.have
        .property("message")
        .eql("Expired token or Not matched inform");
      done();
    });
  });

  it("check ignore request without nickname and password", (done) => {
    const req = {
      accessToken,
      email,
    };

    reqFunc("/user/edit-info", "patchWithAccessToken", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check user password edit work", (done) => {
    const req = {
      accessToken,
      email,
      password: "changedNick",
    };

    reqFunc("/user/edit-info", "patchWithAccessToken", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("accessToken");
      accessToken = res.body.accessToken;

      User.findOne({ where: { email } })
        .then((userInfo) => {
          expect(userInfo.latestToken).eql(res.body.accessToken);
          expect(userInfo.validPassword(req.password)).to.be.true;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  it("check user nickname edit work", (done) => {
    const req = {
      accessToken,
      email,
      nickname: "changedNick",
    };

    reqFunc("/user/edit-info", "patchWithAccessToken", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("accessToken");

      User.findOne({ where: { email }, raw: true })
        .then((userInfo) => {
          expect(userInfo.latestToken).eql(res.body.accessToken);
          expect(userInfo.nickname).eql(req.nickname);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
