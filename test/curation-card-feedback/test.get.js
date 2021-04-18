const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const dbCreate = require("./db");

describe("🔥GET /curation-card-feedbacks", () => {
  let curationCard1, curationCard2;
  let curationFeedbacks = [];
  const url = "/curation-card-feedbacks";
  before(async () => {
    await dbCreate.init();

    const normalUser = {
      email: "test@test.com",
      nickname: "normalUser",
      password: 1234,
    };
    // const adminUser = {
    //   email: "admin@test.com",
    //   nickname: "adminUser",
    //   password: 1234,
    // };

    const normalUserResult = await dbCreate.makeUser(normalUser);
    // await dbCreate.makeUser(adminUser);

    const curationDummy = [
      {
        address: `testAddr1`,
        coordinates: { type: "Point", coordinates: [10, 12] },
        themeInfo: [1, 2],
      },
    ];

    const curationResult = await dbCreate.makeCuration(curationDummy[0]);

    const curationCardDummy = [
      {
        CurationId: curationResult.id,
        theme: 1,
        title: "감성 카페",
        detail: "테라스에서 보이는 강이 아주 분위기 있는 곳",
        photo: "https://photo.scraplan.com/~~~",
      },
      {
        CurationId: curationResult.id,
        theme: 2,
        title: "시원한 풍경",
        detail: "강 주변이 아주 아름답게 되어 있는 곳",
        photo: "https://photo.scraplan.com/~~~",
      },
    ];

    curationCard1 = await dbCreate.makeCurationCard(curationCardDummy[0]);
    curationCard2 = await dbCreate.makeCurationCard(curationCardDummy[1]);

    const curationFeedbackDummy = [
      {
        UserId: normalUserResult.id,
        CurationCardId: curationCard1.id,
        times: 1,
        comment: "AAAAAA",
        rate: 1,
      },
      {
        UserId: normalUserResult.id,
        CurationCardId: curationCard1.id,
        times: 1.3,
        comment: "BBBBBB",
        rate: 1,
      },
      {
        UserId: normalUserResult.id,
        CurationCardId: curationCard1.id,
        times: 2.15,
        comment: "CCCCCC",
        rate: 1,
      },
    ];

    curationFeedbacks.push(
      await dbCreate.makeCurationFeedback(curationFeedbackDummy[0])
    );
    curationFeedbacks.push(
      await dbCreate.makeCurationFeedback(curationFeedbackDummy[1])
    );
    curationFeedbacks.push(
      await dbCreate.makeCurationFeedback(curationFeedbackDummy[2])
    );

    curationFeedbacks = curationFeedbacks.map((feedback) => {
      return {
        curationFeedbackId: feedback.id,
        writer: normalUserResult.nickname,
        times: feedback.times,
        comment: feedback.comment,
        rate: feedback.rate,
      };
    });
  });
  it("check ignore request without path parameter", (done) => {
    reqFunc(url, "get", {}, (err, res) => {
      res.should.have.status(404);
      done();
    });
  });

  it("check ignore wrong data type of pagenation", (done) => {
    const path = `/${curationCard1.id}`;
    const query = `/?pagenation=test`;
    reqFunc(url + path + query, "get", {}, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check ignore wrong max-Time filter", (done) => {
    const path = `/${curationCard1.id}`;
    const wrongQuery = `/?max-Time=test`;
    reqFunc(url + path + wrongQuery, "get", {}, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check get empty value with none exists page info", (done) => {
    const path = `/${curationCard1.id}`;
    const query = `/?pagenation=2`;
    reqFunc(url + path + query, "get", {}, (err, res) => {
      res.should.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body).to.deep.eql([]);
      done();
    });
  });
  it("check get curationFeedback max-Time filter", (done) => {
    const path = `/${curationCard1.id}`;
    const query = `/?max-Time=1.15`;
    reqFunc(url + path + query, "get", {}, (err, res) => {
      res.should.have.status(200);
      expect(res.body).to.deep.equal([curationFeedbacks[0]]);
      done();
    });
  });
  it("check get curationFeedback min-Time filter", (done) => {
    const path = `/${curationCard1.id}`;
    const query = `/?min-Time=122ttes5`;
    reqFunc(url + path + query, "get", {}, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check get curationFeedback min-Time filter", (done) => {
    const path = `/${curationCard1.id}`;
    const query = `/?min-Time=1.15`;
    reqFunc(url + path + query, "get", {}, (err, res) => {
      res.should.have.status(200);
      expect(res.body).to.deep.equal([
        curationFeedbacks[1],
        curationFeedbacks[2],
      ]);
      done();
    });
  });
  it("check get curationFeedback max-Time and min-Time filter", (done) => {
    const path = `/${curationCard1.id}`;
    const query = `/?min-Time=1.15&max-Time=2`;
    reqFunc(url + path + query, "get", {}, (err, res) => {
      res.should.have.status(200);
      expect(res.body).to.deep.equal([curationFeedbacks[1]]);
      done();
    });
  });
  it("check get curationFeedback", (done) => {
    const path = `/${curationCard1.id}`;
    reqFunc(url + path, "get", {}, (err, res) => {
      res.should.have.status(200);
      expect(res.body).to.deep.equal(curationFeedbacks);
      done();
    });
  });
});
