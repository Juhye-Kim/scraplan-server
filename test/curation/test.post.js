const { User, Curation } = require("../../models");

const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const url = "/curations";

describe("🔥POST /curation", () => {
  before(async () => {
    //기존 좌표값들 세팅
    let dummy = [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [1, 2],
    ];
    dummy = dummy.map((v, i) => {
      return {
        address: `dummy${i}`,
        coordinates: { type: "Point", coordinates: v },
      };
    });

    await Curation.destroy({ where: {} });

    await Curation.bulkCreate(dummy, {
      fields: ["address", "coordinates"],
      raw: true,
    });

    //유저 정보 세팅
    await User.destroy({ where: {} });
    await User.create({
      email: "test@test.com",
      nickname: "normalUser",
      password: 1234,
    });
    await User.create({
      email: "admin@test.com",
      nickname: "adminUser",
      password: 1234,
      isAdmin: true,
    });
  });

  const normalUser = {
    email: "test@test.com",
    password: 1234,
    accessToken: "",
  };
  const adminUser = {
    email: "admin@test.com",
    password: 1234,
    accessToken: "",
  };
  it("login normal and admin user", (done) => {
    reqFunc("/sign/in", "patch", normalUser, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("accessToken");
      normalUser.accessToken = res.body.accessToken;
    });
    reqFunc("/sign/in", "patch", adminUser, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("accessToken");
      adminUser.accessToken = res.body.accessToken;
      done();
    });
  });

  it("check address required", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
      coordinates: encodeURIComponent(JSON.stringify([0, 1])),
    };
    reqFunc("/curation", "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check coordinates required", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
      address: "test",
    };
    reqFunc("/curation", "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check ignore unformatted coordinates", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
      coordinates: encodeURIComponent(JSON.stringify(["test", 1])),
      address: "test",
    };
    reqFunc("/curation", "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check ignore normal user", (done) => {
    const req = {
      accessToken: normalUser.accessToken,
      email: normalUser.email,
      coordinates: encodeURIComponent(JSON.stringify([0, 1])),
      address: "test",
    };
    reqFunc("/curation", "post", req, (err, res) => {
      res.should.have.status(403);
      done();
    });
  });

  it("check create curation", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
      coordinates: encodeURIComponent(JSON.stringify([0, 1])),
      address: "test",
    };
    reqFunc("/curation", "post", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully added");
      res.body.should.have.property("id");
      done();
    });
  });

  it("check ignore duplicate geometry", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
      coordinates: encodeURIComponent(JSON.stringify([0, 1])),
      address: "test",
    };
    reqFunc("/curation", "post", req, (err, res) => {
      res.should.have.status(409);
      res.body.should.have
        .property("message")
        .eql("Already exists coordinates");
      done();
    });
  });
});
