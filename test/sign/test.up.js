const { User } = require("../../models");

const chai = require("chai");
const reqFunc = require("../util/reqFunc");

chai.should();

describe("🔥POST /sign/up", () => {
  before(async () => {
    await User.destroy({
      where: {},
    });
  });
  it("check email required", (done) => {
    const req = {
      nickname: "yubin-j",
      password: 1234,
    };
    reqFunc("/sign/up", "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check nickname required", (done) => {
    const req = {
      email: "test@test.com",
      password: 1234,
    };
    reqFunc("/sign/up", "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check password required", (done) => {
    const req = {
      email: "test@test.com",
      nickname: "yubin-j",
    };
    reqFunc("/sign/up", "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check ignore empty value", (done) => {
    const req = {
      email: "",
      nickname: "",
      password: "",
    };
    reqFunc("/sign/up", "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check signup new user", (done) => {
    const req = {
      email: "test@test.com",
      nickname: "yubin-j",
      password: 1234,
    };
    reqFunc("/sign/up", "post", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("Successfully signedUp");
      done();
    });
  });
  it("check for ignore duplicate email", (done) => {
    const req = {
      email: "test@test.com",
      nickname: "yubin-j",
      password: 1234,
    };
    reqFunc("/sign/up", "post", req, (err, res) => {
      res.should.have.status(409);
      res.body.should.have.property("message").eql("Already exists email");
      done();
    });
  });
  it("check for ignore duplicate nickname", (done) => {
    const req = {
      email: "test1@test.com",
      nickname: "yubin-j",
      password: 1234,
    };
    reqFunc("/sign/up", "post", req, (err, res) => {
      res.should.have.status(409);
      res.body.should.have.property("message").eql("Already exists nickname");
      done();
    });
  });
});
