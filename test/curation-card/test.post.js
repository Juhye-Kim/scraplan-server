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
    };
    const resultCuration = await Curation.create(curationDummy);

    //기존 테스트 케이스 세팅에서 사용하지 않는 curation-card에 관한 부분을 다 지우고
    //curation의 themeInfo가 undefined값인지 확인하기 위해 아래 조건과 같이 작성하였다.
    if (!resultCuration.themeInfo) {
      //undefined값인 상태이면 baseReq에서 꼭 필요한 데이터인 curationId를 설정할 것이고.
      //undefined값이 아닌 상태이면 curationId는 없는 값이 되어 테스트케이스가 통과하지 못할 것이다.
      baseReq.curationId = resultCuration.id;
    }
    //themeInfo가 빈 배열이 아닌 undefined상태임에도 모든 테스트케이스가 잘 동작한다는 것은 API에서
    //처리를 해주고 있다고 보고 테스트 케이스 통과로 볼 수 있다.

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
    theme: 1,
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
