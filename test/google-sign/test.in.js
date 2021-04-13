const { User } = require("../../models");

const nock = require("nock");
const chai = require("chai");

chai.should();

const url = "/google-sign/in";
const reqFunc = require("../util/reqFunc");

describe("🔥PATCH /google-sign/in", () => {
  const email = "testGoogle1@test.com",
    nickname = "yubin-j-google";
  before(async () => {
    await User.destroy({
      where: {},
    });

    if (!nock.isActive()) {
      nock.activate();
    }
    nock("https://people.googleapis.com", {
      reqheaders: {
        authorization: "Bearer none-exists-user",
      },
    })
      .persist()
      .get("/v1/people/me?personFields=emailAddresses")
      .reply(200, {
        resourceName: "testGoogleId",
        emailAddresses: [
          {
            value: "testGoogle5@test.com",
          },
        ],
      });

    nock("https://people.googleapis.com", {
      reqheaders: {
        authorization: "Bearer incorrect-google-data",
      },
    })
      .persist()
      .get("/v1/people/me?personFields=emailAddresses")
      .reply(200, {
        resourceName: "wrongGoogleId",
        emailAddresses: [
          {
            value: email,
          },
        ],
      });

    nock("https://people.googleapis.com")
      .persist()
      .get("/v1/people/me?personFields=emailAddresses")
      .reply(200, {
        resourceName: "testGoogleId",
        emailAddresses: [
          {
            value: email,
          },
        ],
      });
  });

  after(() => {
    nock.cleanAll();
    nock.restore();
  });

  it("check signup new user", (done) => {
    const req = {
      hashData: "#access_token=temp-access-token",
      nickname,
    };
    reqFunc("/google-sign/up", "post", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("Successfully signedup");
      done();
    });
  });

  it("check hashData required", (done) => {
    const req = {
      //hashData: "#access_token=temp-access-token",
    };
    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check ignore incorrect hashData", (done) => {
    const req = {
      hashData: "#test",
    };
    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check none exists user", (done) => {
    const req = {
      hashData: "#access_token=none-exists-user",
    };
    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("None exists user");

      done();
    });
  });

  it("check incorrect google data", (done) => {
    const req = {
      hashData: "#access_token=incorrect-google-data",
    };
    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(401);
      res.body.should.have.property("message").eql("Wrong data");
      done();
    });
  });

  it("check signin user", (done) => {
    const req = {
      hashData: "#access_token=temp-access-token",
    };
    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("accessToken");
      res.body.should.have.property("email").eql(email);
      res.body.should.have.property("nickname").eql(nickname);

      User.findOne({
        where: { nickname: res.body.nickname },
        raw: true,
      })
        .then((userInfo) => {
          userInfo.latestToken.should.eql(res.body.accessToken);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
