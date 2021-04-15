const { CurationCard, CurationFeedback } = require("../../models");
const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const dbCreate = require("./db");
const calcAvgTime = require("../../controllers/curation-card-feedback/calcAvgTime");

describe("🔥GET /curation-card-feedbacks", () => {
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
    reqFunc(url, "patch", req, (err, res) => {
      insufficientCall(err, res, 400, message, done);
    });
  };
  const optionalCheck = (
    done,
    terminateFields,
    message = "successfully edited"
  ) => {
    const req = { ...baseReq };

    terminateFields.forEach((field) => {
      delete req[field];
    });
    reqFunc(url, "patch", req, (err, res) => {
      insufficientCall(err, res, 200, message, done);
    });
  };

  let curationCard1, curationCard2;
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

    curationCard1 = await dbCreate.makeCurationCard(curationCardDummy[0]);

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
    baseReq.curationFeedbackId = curationFeedbacks[0].curationFeedbackId;
    baseReq.times = 5;
    baseReq.comment = "DDDDDD";
    baseReq.rate = 3;
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
    requiredCheck(done, [
      "email",
      "curationFeedbackId",
      "times",
      "comment",
      "rate",
    ]);
  });
  it("check email required", (done) => {
    requiredCheck(done, [
      "accessToken",
      "curationFeedbackId",
      "times",
      "comment",
      "rate",
    ]);
  });
  it("check curationFeedbackId required", (done) => {
    requiredCheck(done, ["email", "accessToken", "times", "comment", "rate"]);
  });
  it("check at least one optional data required", (done) => {
    requiredCheck(done, ["accessToken", "email", "curationFeedbackId"]);
  });

  it("check can change by one optional data - times", (done) => {
    optionalCheck(done, ["comment", "rate"]);
  });
  it("check can change by one optional data - comment", (done) => {
    optionalCheck(done, ["times", "rate"]);
  });
  it("check can change by one optional data - rate", (done) => {
    optionalCheck(done, ["times", "comment"]);
  });

  it("check ignore wrong data type - times", (done) => {
    const req = { ...baseReq };
    req.times = "test";

    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");

      done();
    });
  });
  it("check ignore wrong data type - rate", (done) => {
    const req = { ...baseReq };
    req.rate = "test";

    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");

      done();
    });
  });

  it("check at least one changed option required", (done) => {
    const req = { ...baseReq };

    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Nothing Changed");

      done();
    });
  });

  it("check changed curation feedback and curation cards avgTime", (done) => {
    const req = { ...baseReq };
    req.times = 10;
    req.comment = "wow!!";
    req.rate = 10;

    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully edited");

      CurationFeedback.findOne({
        include: [{ model: CurationCard, required: true }],
        where: { id: req.curationFeedbackId },
        raw: true,
      })
        .then((curationFeedback) => {
          let sumOfTime = req.times;
          for (const curationFeedback of curationFeedbacks) {
            if (
              curationFeedback.curationFeedbackId !== req.curationFeedbackId
            ) {
              sumOfTime += curationFeedback.times;
            }
          }

          expect(calcAvgTime(sumOfTime, curationFeedbacks.length)).to.eql(
            curationFeedback["CurationCard.avgTime"]
          );
          expect(curationFeedback.times).to.eql(req.times);
          expect(curationFeedback.comment).to.eql(req.comment);
          expect(curationFeedback.rate).to.eql(req.rate);
          done();
        })
        .catch((err) => done(err));
    });
  });

  it("ignore other user access", (done) => {
    const req = { ...baseReq };
    req.accessToken = otherUserResult.accessToken;
    req.email = otherUserResult.email;

    reqFunc(url, "patch", req, (err, res) => {
      res.should.have.status(403);
      done();
    });
  });
});
