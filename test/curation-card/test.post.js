const { User, Curation, CurationCard } = require("../../models");

const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");

describe("🔥POST /curation-card", () => {
  before(async () => {
    await Curation.destroy({ where: {} });
    await CurationCard.destroy({ where: {} });
    await User.destroy({ where: {} });

    const curationDummy = {
      address: `testAddr1`,
      coordinates: { type: "Point", coordinates: [10, 12] },
      themeInfo: [1, 2],
    };
    const resultCuration = await Curation.create(curationDummy);
    const curationId = resultCuration.id;
    baseReq.curationId = curationId;
    const curationCardDummy = [
      {
        CurationId: curationId,
        theme: 1,
        title: "감성 카페",
        detail: "테라스에서 보이는 강이 아주 분위기 있는 곳",
        photo: "https://photo.scraplan.com/~~~",
      },
      {
        CurationId: curationId,
        theme: 2,
        title: "시원한 풍경",
        detail: "강 주변이 아주 아름답게 되어 있는 곳",
        photo: "https://photo.scraplan.com/~~~",
      },
    ];

    await CurationCard.bulkCreate(curationCardDummy);

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
      baseReq.accessToken = adminUser.accessToken;
      done();
    });
  });
  const url = "/curation-card";
  const baseReq = {
    accessToken: "",
    email: adminUser.email,
    curationId: 0,
    theme: 3,
    title: "제목 테스트",
    detail: "디테일 테스트",
    photo: "http://~~~~~",
  };

  const insufficientCall = (err, res, done) => {
    res.should.have.status(400);
    res.body.should.have.property("message").eql("Insufficient info");
    done();
  };
  const requiredCheck = (done, requiredField) => {
    const req = { ...baseReq };
    delete req[requiredField];
    reqFunc(url, "post", req, (err, res) => {
      insufficientCall(err, res, done);
    });
  };
  it("check accessToken required", (done) => {
    requiredCheck(done, "accessToken");
  });
  it("check email required", (done) => {
    requiredCheck(done, "email");
  });
  it("check curationId required", (done) => {
    requiredCheck(done, "curationId");
  });
  it("check ignore wrong type curationId", (done) => {
    const req = { ...baseReq };
    req.curationId = "TEST";
    reqFunc(url, "post", req, (err, res) => {
      insufficientCall(err, res, done);
    });
  });
  it("check theme required", (done) => {
    requiredCheck(done, "theme");
  });
  it("check ignore wrong type theme", (done) => {
    const req = { ...baseReq };
    req.theme = "TEST";
    reqFunc(url, "post", req, (err, res) => {
      insufficientCall(err, res, done);
    });
  });
  it("check title required", (done) => {
    requiredCheck(done, "title");
  });
  it("check detail required", (done) => {
    requiredCheck(done, "detail");
  });
  it("check photo required", (done) => {
    requiredCheck(done, "photo");
  });

  it("check ignore normal user", (done) => {
    const req = { ...baseReq };
    req.accessToken = normalUser.accessToken;
    req.email = normalUser.email;
    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(403);
      done();
    });
  });
  it("check ignore none exists curation", (done) => {
    const req = { ...baseReq };
    req.curationId = Number(req.curationId) + 1;
    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(404);
      res.body.should.have
        .property("message")
        .eql("There is no data with given curation id");
      done();
    });
  });
  it("check create curationCard", (done) => {
    const req = { ...baseReq };
    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully added");
      done();
    });
  });
  it("check ignore exists theme", (done) => {
    const req = { ...baseReq };
    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(409);
      res.body.should.have.property("message").eql("Already exists theme");
      done();
    });
  });
});
