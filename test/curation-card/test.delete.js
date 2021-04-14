const { User, Curation, CurationCard } = require("../../models");

const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");

describe("🔥POST /curation-card", () => {
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
  const url = "/curation-card";
  let targetCurationCardId;
  let targetCurationId;
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
    targetCurationId = curationId;

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

    const curationCards = await CurationCard.bulkCreate(curationCardDummy);
    targetCurationCardId = curationCards[1].id;

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

  it("check accessToken required", (done) => {
    const req = {
      email: adminUser.email,
      curationCardId: 2,
    };

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check email required", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      curationCardId: 2,
    };

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check curationCardId required", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
    };

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check ignore wrong data type curationCardId", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
      curationCardId: "test",
    };

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check ignore normal user", (done) => {
    const req = {
      accessToken: normalUser.accessToken,
      email: normalUser.email,
      curationCardId: 2,
    };

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(403);
      done();
    });
  });
  it("check delete curation card", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
      curationCardId: targetCurationCardId,
    };
    console.log(targetCurationCardId);

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully deleted");
      done();
    });
  });
  it("check ignore none exists resource", (done) => {
    const req = {
      accessToken: adminUser.accessToken,
      email: adminUser.email,
      curationCardId: targetCurationCardId,
    };

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(404);
      done();
    });
  });
  it("check db changed", (done) => {
    Curation.findOne({
      where: { id: targetCurationId },
    })
      .then((curationInfo) => {
        expect(curationInfo.themeInfo).to.deep.equal([1]);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
