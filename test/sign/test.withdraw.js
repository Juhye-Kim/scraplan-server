const { User } = require("../../models");

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const should = chai.should();
const { expect } = require("chai");

chai.use(chaiHttp);

describe("🔥DELETE /sign/withdraw", () => {
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
      .delete("/sign/withdraw")
      .send(req)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
  });

  it("check email requred", (done) => {
    const req = {
      password,
    };

    chai
      .request(server)
      .delete("/sign/withdraw")
      .set({ authorization: `Bearer ${accessToken}` })
      .send(req)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
  });

  it("check password requred", (done) => {
    const req = {
      email,
    };

    chai
      .request(server)
      .delete("/sign/withdraw")
      .set({ authorization: `Bearer ${accessToken}` })
      .send(req)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
  });

  it("check withdraw success", (done) => {
    const req = {
      email,
      password,
    };

    chai
      .request(server)
      .delete("/sign/withdraw")
      .set({ authorization: `Bearer ${accessToken}` })
      .send(req)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("message").eql("Successfully processed");
        done();
      });
  });

  it("check withdraw request was delete user", async () => {
    const userInfo = await User.findOne({ where: { email } });
    expect(userInfo).to.be.null;
  });
});
