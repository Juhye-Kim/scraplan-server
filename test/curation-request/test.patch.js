const { CurationRequest, User, sequelize } = require("../../models");
const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const jwt = require("jsonwebtoken");

describe("🔥PATCH /curation-request", () => {
  const url = "/curation-request";

  const users = [
    {
      origin: {
        email: "t1@test.com",
        nickname: "user1",
        password: 1234,
        isAdmin: true,
      },
      result: {},
    },
    {
      origin: {
        email: "t2@test.com",
        nickname: "user2",
        password: 1234,
      },
      result: {},
    },
    {
      origin: {
        email: "admin@test.com",
        nickname: "admin",
        password: 1234,
        isAdmin: true,
      },
      result: {},
    },
  ];

  const curationRequest = {
    origin: {
      UserId: "",
      coordinates: [15, 20],
      address: "임시 데이터 1",
      requestTitle: "임시 제목 1",
      requestComment: "임시 코멘트 1",
      requestTheme: 1,
      status: 1,
    },
    result: {},
  };

  before(async () => {
    await sequelize.transaction(async (t) => {
      await User.destroy({ where: {}, transaction: t });
      await CurationRequest.destroy({ where: {}, transaction: t });

      for (const user of users) {
        user.result = await User.create(user.origin, { transaction: t });

        const accessToken = jwt.sign(
          { id: user.result.id, nickname: user.result.nickname },
          process.env.ACCESS_SECRET,
          { expiresIn: "1H" }
        );

        user.result.latestToken = accessToken;
        await user.result.save({ transaction: t });
      }

      curationRequest.origin.UserId = users[0].result.id;
      curationRequest.origin.coordinates = {
        type: "Point",
        coordinates: curationRequest.origin.coordinates,
      };
      curationRequest.result = await CurationRequest.create(
        curationRequest.origin,
        { transaction: t }
      );
    });
  });

  describe("👉check required fields", () => {
    const checkRequiredField = (done, requiredField) => {
      const req = {
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
        id: curationRequest.result.id,
        status: 0,
      };
      delete req[requiredField];

      reqFunc(url, "patch", req, (err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
    };
    it("check accessToken required", (done) => {
      checkRequiredField(done, "accessToken");
    });
    it("check email required", (done) => {
      checkRequiredField(done, "email");
    });
    it("check id required", (done) => {
      checkRequiredField(done, "id");
    });
    it("check status required", (done) => {
      checkRequiredField(done, "status");
    });
  });
  describe("👉check ignore case", () => {
    const checkIgnoreWrongData = (
      done,
      targetFields,
      message = "Insufficient info",
      code = 400
    ) => {
      const req = {
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
        id: curationRequest.result.id,
        status: 0,
      };
      for (const target in targetFields) {
        req[target] = targetFields[target];
      }

      reqFunc(url, "patch", req, (err, res) => {
        res.should.have.status(code);
        if (code !== 403) {
          res.body.should.have.property("message").eql(message);
        }
        done();
      });
    };

    it("check ignore wrong data type id", (done) => {
      checkIgnoreWrongData(done, { id: "TEST" });
    });
    it("check ignore wrong data type status", (done) => {
      checkIgnoreWrongData(done, { status: "TEST" });
    });
    it("check ignore same status data", (done) => {
      checkIgnoreWrongData(done, { status: 1 }, "Nothing Changed");
    });
    it("check ignore none exists resource", (done) => {
      checkIgnoreWrongData(done, { id: curationRequest.result.id + 1 });
    });
    it("check ignore not owner", (done) => {
      checkIgnoreWrongData(
        done,
        {
          accessToken: users[1].result.latestToken,
          email: users[1].result.email,
        },
        "",
        403
      );
    });
  });
  describe("👉check successfully changed state", () => {
    const checkSuccssfullyUpdated = (done, targetFields) => {
      const req = {
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
        id: curationRequest.result.id,
        status: 0,
      };
      for (const target in targetFields) {
        req[target] = targetFields[target];
      }

      reqFunc(url, "patch", req, (err, res) => {
        res.should.have.status(200);
        res.body.should.have
          .property("message")
          .eql("successfully updated status");

        CurationRequest.findOne({ where: { id: req.id }, raw: true })
          .then((result) => {
            expect(result.status).to.eql(req.status);
            done();
          })
          .catch((err) => done(err));
      });
    };
    it("check owner can edit status", (done) => {
      checkSuccssfullyUpdated(done, {});
    });
    it("check admin can edit status", (done) => {
      checkSuccssfullyUpdated(done, {
        accessToken: users[2].result.latestToken,
        email: users[2].result.email,
        status: 3,
      });
    });
  });
});
