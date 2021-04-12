const { User } = require("../../models");

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const should = chai.should();

chai.use(chaiHttp);

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
    chai
      .request(server)
      .patch("/sign/in")
      .send({
        email,
        password,
      })
      .end((err, res) => {
        accessToken = res.body.accessToken;
        done();
      });
  });

  it("check authorization requred", (done) => {
    const req = {
      email: "test@test.com",
    };

    chai
      .request(server)
      .patch("/sign/out")
      .send(req)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
  });

  it("check email requred", (done) => {
    const req = {};

    chai
      .request(server)
      .patch("/sign/out")
      .set({ authorization: `Bearer ${accessToken}` })
      .send(req)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
  });

  it("check logout success", (done) => {
    const req = {
      email: "test@test.com",
    };

    chai
      .request(server)
      .patch("/sign/out")
      .set({ authorization: `Bearer ${accessToken}` })
      .send(req)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("message").eql("Successfully logouted");
        done();
      });
  });

  it("check logout request was delete accessToken", async () => {
    const userInfo = await User.findOne({ where: { email } });
    userInfo.should.property("latestToken").is.null;
  });
});
