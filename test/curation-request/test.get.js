const { CurationRequest, User, sequelize } = require("../../models");
const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const jwt = require("jsonwebtoken");

describe("🔥GET /curation-requests", () => {
  const url = "/curation-requests";

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
  ];

  const curationRequests = [
    {
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
    },
    {
      origin: {
        UserId: "",
        coordinates: [17, 23],
        address: "임시 데이터 2",
        requestTitle: "임시 제목 2",
        requestComment: "임시 코멘트 2",
        requestTheme: 2,
        status: 1,
      },
      result: {},
    },
    {
      origin: {
        UserId: "",
        coordinates: [12, 32],
        address: "임시 데이터 3",
        requestTitle: "임시 제목 3",
        requestComment: "임시 코멘트 3",
        requestTheme: 3,
        status: 1,
      },
      result: {},
    },
    {
      origin: {
        UserId: "",
        coordinates: [28, 35],
        address: "임시 데이터 4",
        requestTitle: "임시 제목 4",
        requestComment: "임시 코멘트 4",
        requestTheme: 4,
        status: 1,
      },
      result: {},
    },
  ];

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

      //curation request 각 user당 2개 만들기.
      for (const [idx, curationRequest] of curationRequests.entries()) {
        curationRequest.origin.UserId = users[idx < 2 ? 0 : 1].result.id;
        curationRequest.origin.coordinates = {
          type: "Point",
          coordinates: curationRequest.origin.coordinates,
        };
        curationRequest.result = await CurationRequest.create(
          curationRequest.origin,
          { transaction: t }
        );
        curationRequest.result.requester =
          users[idx < 2 ? 0 : 1].result.nickname;
      }
    });
  });

  describe("👉check ignore values", () => {
    it("check email path parameter required", (done) => {
      const req = { accessToken: users[0].result.latestToken };

      reqFunc(url, "get", req, (err, res) => {
        res.should.have.status(404);
        done();
      });
    });
    it("check accessToken required", (done) => {
      const path = `/${users[0].result.email}`;

      reqFunc(url + path, "get", {}, (err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
    });
    it("check ignore wrong data type - isAdmin", (done) => {
      const req = { accessToken: users[0].result.latestToken };
      const path = `/${users[0].result.email}`;
      const query = `/?isAdmin=test&pagenation=1`;

      reqFunc(url + path + query, "get", req, (err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
    });
    it("check ignore wrong data type - pagenation", (done) => {
      const req = { accessToken: users[0].result.latestToken };
      const path = `/${users[0].result.email}`;
      const query = `/?pagenation=test`;

      reqFunc(url + path + query, "get", req, (err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
    });
  });

  describe("👉check get data successfully", () => {
    const checkCurationRequest = (result, target) => {
      expect(result.id).to.eql(target.id);
      expect(result.requester).to.eql(target.requester);
      expect(result.coordinates).to.deep.eql(target.coordinates);
      expect(result.address).to.eql(target.address);
      expect(result.requestTitle).to.eql(target.requestTitle);
      expect(result.requestComment).to.eql(target.requestComment);
      expect(result.requestTheme).to.eql(target.requestTheme);
      expect(result.status).to.eql(target.status);
    };

    it("check get empty value with none exists page info", (done) => {
      const req = { accessToken: users[0].result.latestToken };
      const path = `/${users[0].result.email}`;
      const query = "/?pagenation=2";

      reqFunc(url + path + query, "get", req, (err, res) => {
        res.should.have.status(200);
        expect(res.body.curationRequests).to.be.an("array");
        expect(res.body.curationRequests).to.deep.eql([]);
        done();
      });
    });
    it("check get data without pagenation parameter", (done) => {
      const req = { accessToken: users[0].result.latestToken };
      const path = `/${users[0].result.email}`;

      reqFunc(url + path, "get", req, (err, res) => {
        res.should.have.status(200);
        for (const [idx, result] of res.body.curationRequests.entries()) {
          const target = curationRequests[idx].result;
          checkCurationRequest(result, target);
        }
        done();
      });
    });
    it("check get data only user2's data with user2's auth data", (done) => {
      const req = { accessToken: users[1].result.latestToken };
      const path = `/${users[1].result.email}`;

      reqFunc(url + path, "get", req, (err, res) => {
        res.should.have.status(200);
        for (const [idx, result] of res.body.curationRequests.entries()) {
          const target = curationRequests[idx + 2].result;
          checkCurationRequest(result, target);
        }
        done();
      });
    });
    it("check get all data with admin authdata and isAdmin true", (done) => {
      const req = { accessToken: users[0].result.latestToken };
      const path = `/${users[0].result.email}`;
      const query = "/?isAdmin=true";

      reqFunc(url + path + query, "get", req, (err, res) => {
        res.should.have.status(200);
        expect(res.body.curationRequests.length).to.eql(
          curationRequests.length
        );
        for (const [idx, result] of res.body.curationRequests.entries()) {
          const target = curationRequests[idx].result;
          checkCurationRequest(result, target);
        }
        done();
      });
    });
  });
});
