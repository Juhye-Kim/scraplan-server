const { CurationRequest, User, sequelize } = require("../../models");
const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const jwt = require("jsonwebtoken");

describe("🔥POST /curation-requests", () => {
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
    // {
    //   origin: {
    //     email: "t2@test.com",
    //     nickname: "user2",
    //     password: 1234,
    //   },
    //   result: {},
    // },
  ];

  const curationRequest = {
    coordinates: [15, 20],
    address: "임시 데이터 1",
    requestTitle: "임시 제목 1",
    requestComment: "임시 코멘트 1",
    requestTheme: 1,
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
    });
  });

  describe("👉check required fields", () => {
    const checkRequiredField = (done, requiredField) => {
      const req = {
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
        ...curationRequest,
      };
      delete req[requiredField];

      reqFunc(url, "post", req, (err, res) => {
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
    it("check coordinates required", (done) => {
      checkRequiredField(done, "coordinates");
    });
    it("check address required", (done) => {
      checkRequiredField(done, "address");
    });
    it("check requestTitle required", (done) => {
      checkRequiredField(done, "requestTitle");
    });
    it("check requestComment required", (done) => {
      checkRequiredField(done, "requestComment");
    });
    it("check requestTheme required", (done) => {
      checkRequiredField(done, "requestTheme");
    });
    it("check ignore wrong data type of requestTheme", (done) => {
      const req = {
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
        ...curationRequest,
      };
      req.requestTheme = "TEST";

      reqFunc(url, "post", req, (err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
    });
    it("check ignore wrong data type of coordinates - 1", (done) => {
      const req = {
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
        ...curationRequest,
      };
      req.coordinates = [1, 2, 3];

      reqFunc(url, "post", req, (err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
    });
    it("check ignore wrong data type of coordinates - 2", (done) => {
      const req = {
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
        ...curationRequest,
      };
      req.coordinates = [1, "1"];

      reqFunc(url, "post", req, (err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
    });
  });
  describe("👉check successfully added", () => {
    it("check successfully added", (done) => {
      const req = {
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
        ...curationRequest,
      };

      reqFunc(url, "post", req, (err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("message").eql("successfully added");
        CurationRequest.findAll({
          where: { UserId: users[0].result.id },
          raw: true,
        })
          .then((result) => {
            expect(result.length).to.eql(1);
            expect(result[0].coordinates.coordinates).to.deep.eql(
              curationRequest.coordinates
            );
            expect(result[0].address).to.eql(curationRequest.address);
            expect(result[0].requestTitle).to.eql(curationRequest.requestTitle);
            expect(result[0].requestComment).to.eql(
              curationRequest.requestComment
            );
            expect(result[0].requestTheme).to.eql(curationRequest.requestTheme);
            expect(result[0].status).to.eql(0);
            done();
          })
          .catch((err) => done(err));
      });
    });
  });
});
