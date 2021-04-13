const { User, Curation } = require("../../models");

const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const url = "/curations";

describe("🔥POST /curation", () => {
  let insertedData;
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

    insertedData = await Curation.bulkCreate(dummy, {
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

  it("check id required", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
    };
    reqFunc("/curation", "delete", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check ignore wrong data type", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
      id: "!@#",
    };
    reqFunc("/curation", "delete", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check deleted data", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
      id: insertedData[0].id,
    };
    reqFunc("/curation", "delete", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully deleted");
      done();
    });
  });

  it("check ignore none exists data", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
      id: insertedData[0].id,
    };
    reqFunc("/curation", "delete", req, (err, res) => {
      res.should.have.status(404);
      res.body.should.have
        .property("message")
        .eql("There is no data with given id");
      done();
    });
  });
});
