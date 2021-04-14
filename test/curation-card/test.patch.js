const { User, Curation, CurationCard } = require("../../models");

const chai = require("chai");
chai.should();
const reqFunc = require("../util/reqFunc");

describe("🔥PATCH /curation-card", () => {
  const url = "/curation-card";

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

  const baseReq = {
    accessToken: "",
    email: adminUser.email,
    curationCardId: 0,
    theme: 0,
  };

  const insufficientCall = (err, res, message, done) => {
    res.should.have.status(400);
    res.body.should.have.property("message").eql(message);
    done();
  };
  const requiredCheck = (
    done,
    requiredFields,
    message = "Insufficient info"
  ) => {
    const req = {};

    requiredFields.forEach((field) => {
      req[field] = baseReq[field];
    });
    reqFunc(url, "patch", req, (err, res) => {
      insufficientCall(err, res, message, done);
    });
  };

  let valueWillChangedTheme;
  let valueExistsTheme;
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
    valueWillChangedTheme = 3;
    valueExistsTheme = 1;
    const curationResult = await CurationCard.bulkCreate(curationCardDummy);

    baseReq.curationCardId = curationResult[1].id;
    baseReq.theme = curationResult[1].theme;
    baseReq.title = curationResult[1].title;
    baseReq.detail = curationResult[1].detail;
    baseReq.photo = curationResult[1].photo;

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
      baseReq.accessToken = adminUser.accessToken;

      done();
    });
  });

  it("check accessToken required", (done) => {
    requiredCheck(done, ["email", "curationCardId", "theme"]);
  });
  it("check email required", (done) => {
    requiredCheck(done, ["accessToken", "curationCardId", "theme"]);
  });
  it("check curationCardId required", (done) => {
    requiredCheck(done, ["accessToken", "email", "theme"]);
  });
  it("check at least one option field required", (done) => {
    requiredCheck(done, ["accessToken", "email", "curationCardId"]);
  });
  it("check at least one changed option required", (done) => {
    requiredCheck(
      done,
      [
        "accessToken",
        "email",
        "curationCardId",
        "theme",
        "title",
        "detail",
        "photo",
      ],
      "Nothing Changed"
    );
  });
  it("check value changed", (done) => {
    baseReq.title = "change test title";
    baseReq.detail = "change test detail";
    baseReq.photo = "https://change.com";
    const req = { ...baseReq };

    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully edited");
      done();
    });
  });
  it("check change none exists theme", (done) => {
    const req = { ...baseReq };
    req.theme = valueWillChangedTheme;
    delete req.theme.title;
    delete req.theme.detail;
    delete req.theme.photo;

    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully edited");
      done();
    });
  });
  it("check ignore normal user", (done) => {
    const req = { ...baseReq };
    req.accessToken = normalUser.accessToken;
    req.email = normalUser.email;

    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(403);
      done();
    });
  });
  it("check ignore change to exists theme", (done) => {
    const req = { ...baseReq };
    req.theme = valueExistsTheme;
    delete req.theme.title;
    delete req.theme.detail;
    delete req.theme.photo;

    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(409);
      res.body.should.have.property("message").eql("Already exists theme");
      done();
    });
  });
  it("check db changed", (done) => {
    CurationCard.findOne({
      where: { id: baseReq.curationCardId },
      raw: true,
    })
      .then((curationCardInfo) => {
        curationCardInfo.theme.should.eql(valueWillChangedTheme);
        curationCardInfo.title.should.eql(baseReq.title);
        curationCardInfo.detail.should.eql(baseReq.detail);
        curationCardInfo.photo.should.eql(baseReq.photo);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
