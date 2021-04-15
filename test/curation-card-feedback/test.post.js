const { CurationCard, CurationFeedback } = require("../../models");
const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const dbCreate = require("./db");
const calcAvgTime = require("../../controllers/curation-card-feedback/calcAvgTime");

describe("🔥GET /curation-card-feedbacks", () => {
  const baseReq = {};
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

  let curationCard1, curationCard2;
  let curationFeedbacks = [];
  let normalUserResult;
  const url = "/curation-card-feedback";
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

    normalUserResult = await dbCreate.makeUser(normalUser);
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

    baseReq.email = normalUserResult.email;
    baseReq.curationCardId = curationCard1.id;
    baseReq.times = 5;
    baseReq.comment = "DDDDDD";
    baseReq.rate = 1;
  });

  it("get accesstoken", (done) => {
    const req = {
      email: normalUserResult.email,
      password: 1234,
    };
    reqFunc("/sign/in", "patch", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("accessToken");
      normalUserResult.accessToken = res.body.accessToken;
      baseReq.accessToken = res.body.accessToken;
      done();
    });
  });

  it("check accessToken required", (done) => {
    requiredCheck(done, "accessToken");
  });
  it("check email required", (done) => {
    requiredCheck(done, "email");
  });
  it("check curationCardId required", (done) => {
    requiredCheck(done, "curationCardId");
  });
  it("check times required", (done) => {
    requiredCheck(done, "times");
  });
  it("check comment required", (done) => {
    requiredCheck(done, "comment");
  });
  it("check rate required", (done) => {
    requiredCheck(done, "rate");
  });

  it("check ignore different type times", (done) => {
    const req = { ...baseReq };
    req.times = "test";
    reqFunc(url, "post", req, (err, res) => insufficientCall(err, res, done));
  });
  it("check ignore different type rate", (done) => {
    const req = { ...baseReq };
    req.rate = "test";
    reqFunc(url, "post", req, (err, res) => insufficientCall(err, res, done));
  });

  it("check inserted curationCard avgTime, feedbackCnt changed", (done) => {
    const req = {
      accessToken: normalUserResult.accessToken,
      email: normalUserResult.email,
      curationCardId: curationCard1.id,
      times: 5,
      comment: "DDDDDD",
      rate: 1,
    };

    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully added");

      CurationCard.findOne({
        where: { id: curationCard1.id },
        raw: true,
      })
        .then((curationCard) => {
          let sumOfTime = req.times;
          for (const curationFeedback of curationFeedbacks) {
            sumOfTime += curationFeedback.times;
          }

          expect(calcAvgTime(sumOfTime, curationFeedbacks.length + 1)).to.eql(
            curationCard.avgTime
          );

          //다음에도 위와 같은 구문으로 시간값이 잘 들어갔는지 확인할 때를 대비하여 추가.
          curationFeedbacks.push(req);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
  it("check inserted curation feedback", (done) => {
    const req = {
      accessToken: normalUserResult.accessToken,
      email: normalUserResult.email,
      curationCardId: curationCard2.id,
      times: 0.15,
      comment: "CHECK INSERTED",
      rate: 2,
    };

    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully added");

      CurationFeedback.findOne({
        where: { CurationCardId: curationCard2.id },
        raw: true,
      })
        .then((curationFeedback) => {
          expect(curationFeedback.CurationCardId).to.eql(req.curationCardId);
          expect(curationFeedback.times).to.eql(req.times);
          expect(curationFeedback.comment).to.eql(req.comment);
          expect(curationFeedback.rate).to.eql(req.rate);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
