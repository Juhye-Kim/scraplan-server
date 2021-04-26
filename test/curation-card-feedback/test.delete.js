const { CurationCard, CurationFeedback } = require("../../models");
const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const dbCreate = require("./db");
const calcAvgTime = require("../../controllers/curation-card-feedback/calcAvgTime");

describe("🔥DELETE /curation-card-feedback", () => {
  const baseReq = {};
  const insufficientCall = (err, res, code, message, done) => {
    res.should.have.status(code);
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
    reqFunc(url, "delete", req, (err, res) => {
      insufficientCall(err, res, 400, message, done);
    });
  };

  //curation-card-feedback DELETE메서드 확인용 함수. 다른 곳에서 그대로 사용 금지...
  const checkDeleteFeedback = (done) => {
    CurationFeedback.findAll({
      include: [{ model: CurationCard }],
      where: { CurationCardId: curationCard.id },
      raw: true,
    })
      .then((feedbacks) => {
        const sourceLen = curationFeedbacks.length;
        if (sourceLen > 0) {
          expect(feedbacks.length).to.eql(sourceLen);
          let sumOfTime = 0;
          for (const curationFeedback of curationFeedbacks) {
            sumOfTime += curationFeedback.times;
          }

          expect(calcAvgTime(sumOfTime, sourceLen)).to.eql(
            feedbacks[0]["CurationCard.avgTime"]
          );
          done();
        } else {
          CurationCard.findOne({ where: curationCard.id })
            .then((curationCard) => {
              expect(curationCard.avgTime).to.eql(0);
              expect(curationCard.feedbackCnt).to.eql(0);
              done();
            })
            .catch((err) => done(err));
        }
      })
      .catch((err) => done(err));
  };

  let curationCard;
  let curationFeedbacks = [];
  let normalUserResult, otherUserResult;
  const url = "/curation-card-feedback";
  before(async () => {
    await dbCreate.init();

    const normalUser = {
      email: "test@test.com",
      nickname: "normalUser",
      password: 1234,
    };
    const otherUser = {
      email: "other@test.com",
      nickname: "otherUser",
      password: 1234,
    };

    normalUserResult = await dbCreate.makeUser(normalUser);
    otherUserResult = await dbCreate.makeUser(otherUser);

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
    ];

    curationCard = await dbCreate.makeCurationCard(curationCardDummy[0]);

    const curationFeedbackDummy = [
      {
        UserId: normalUserResult.id,
        CurationCardId: curationCard.id,
        times: 1,
        comment: "AAAAAA",
        rate: 1,
      },
      {
        UserId: normalUserResult.id,
        CurationCardId: curationCard.id,
        times: 1.3,
        comment: "BBBBBB",
        rate: 1,
      },
      {
        UserId: normalUserResult.id,
        CurationCardId: curationCard.id,
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
        times: feedback.times,
      };
    });

    baseReq.email = normalUserResult.email;
    baseReq.curationFeedbackId = curationFeedbacks[0].curationFeedbackId;
  });

  it("get accesstoken", (done) => {
    const normalReq = {
      email: normalUserResult.email,
      password: 1234,
    };
    reqFunc("/sign/in", "patch", normalReq, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("accessToken");
      normalUserResult.accessToken = res.body.accessToken;
      baseReq.accessToken = res.body.accessToken;
    });
    const otherReq = {
      email: otherUserResult.email,
      password: 1234,
    };
    reqFunc("/sign/in", "patch", otherReq, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("accessToken");
      otherUserResult.accessToken = res.body.accessToken;
      done();
    });
  });

  it("check accessToken required", (done) => {
    requiredCheck(done, ["email", "curationFeedbackId"]);
  });
  it("check email required", (done) => {
    requiredCheck(done, ["accessToken", "curationFeedbackId"]);
  });
  it("check curationFeedbackId required", (done) => {
    requiredCheck(done, ["accessToken", "email"]);
  });

  it("check ignore wrong data type - curationFeedbackId", (done) => {
    const req = { ...baseReq };
    req.curationFeedbackId = "test";

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");

      done();
    });
  });

  it("check deleted feedback-1 and updated curation card ", (done) => {
    const req = { ...baseReq };
    //curationCard.id => curatinoCard의 id값
    req.curationFeedbackId = curationFeedbacks.shift().curationFeedbackId;

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully deleted");
      checkDeleteFeedback(done);
    });
  });
  it("check deleted feedback-2 and updated curation card ", (done) => {
    const req = { ...baseReq };
    //curationCard.id => curatinoCard의 id값
    req.curationFeedbackId = curationFeedbacks.shift().curationFeedbackId;

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully deleted");
      checkDeleteFeedback(done);
    });
  });
  it("check deleted feedback-3 and updated curation card ", (done) => {
    const req = { ...baseReq };
    //curationCard.id => curatinoCard의 id값
    req.curationFeedbackId = curationFeedbacks.shift().curationFeedbackId;

    reqFunc(url, "delete", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully deleted");
      checkDeleteFeedback(done);
    });
  });
});
