const { User } = require("../../models");

const nock = require("nock");
const chai = require("chai");
const reqFunc = require("../util/reqFunc");

chai.should();

const url = "/google-sign/up";

describe("🔥POST /google-sign/up", () => {
  before(async () => {
    await User.destroy({
      where: {},
    });

    if (!nock.isActive()) {
      nock.activate();
    }

    nock("https://people.googleapis.com", {
      reqheaders: {
        authorization: "Bearer same-nickname",
      },
    })
      .get("/v1/people/me?personFields=emailAddresses")
      .reply(200, {
        resourceName: "testGoogleId",
        emailAddresses: [
          {
            value: "testGoogle2@test.com",
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
            value: "testGoogle1@test.com",
          },
        ],
      });
  });
  after(() => {
    nock.cleanAll();
    nock.restore();
  });

  it("check hashData required", (done) => {
    const req = {
      nickname: "yubin-j-google",
    };
    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check nickname required", (done) => {
    const req = {
      hashData: "#access_token=temp-access-token",
    };
    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check ignore wrong value", (done) => {
    const req = {
      hashData: "test value",
      nickname: "",
    };
    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check signup new user", (done) => {
    const req = {
      hashData: "#access_token=temp-access-token",
      nickname: "yubin-j-google",
    };
    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("Successfully signedup");
      done();
    });
  });

  it("check ignore duplicate email of googledata", (done) => {
    const req = {
      hashData: "#access_token=temp-access-token",
      nickname: "yubin-j-google-1234",
    };
    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(409);
      res.body.should.have.property("message").eql("Already exists email");
      done();
    });
  });

  it("check ignore duplicate nickname", (done) => {
    const req = {
      hashData: "#access_token=same-nickname",
      nickname: "yubin-j-google",
    };
    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(409);
      res.body.should.have.property("message").eql("Already exists nickname");
      done();
    });
  });
});
