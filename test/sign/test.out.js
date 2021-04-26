const { User } = require("../../models");

const chai = require("chai");
const reqFunc = require("../util/reqFunc");

chai.should();

describe("🔥PATCH /sign/out", () => {
  const email = "test@test.com",
    nickname = "yubin-j",
    password = 1234;
  let accessToken;

  before(async () => {
    await User.destroy({
      where: {},
    });
    await User.create({
      email,
      nickname,
      password,
    });
  });
  it("get access token", (done) => {
    reqFunc("/sign/in", "patch", { email, password }, (err, res) => {
      accessToken = res.body.accessToken;
      done();
    });
  });

  it("check authorization requred", (done) => {
    const req = {
      email: "test@test.com",
    };
    reqFunc("/sign/out", "patch", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check email requred", (done) => {
    const req = { accessToken };
    reqFunc("/sign/out", "patch", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check logout success", (done) => {
    const req = {
      email: "test@test.com",
      accessToken,
    };
    reqFunc("/sign/out", "patch", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("Successfully logouted");

      User.findOne({ where: { email } })
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
