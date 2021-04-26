const { Curation } = require("../../models");

const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const url = "/curations";

describe("🔥GET /curations", () => {
  before(async () => {
    let dummy = [
      [
        [0, 0],
        [1, 2, 3],
      ],
      [[1, 1], [1]],
      [
        [2, 2],
        [2, 3],
      ],
      [[3, 3], [3]],
      [[1, 2], [4]],
    ];
    dummy = dummy.map((v, i) => {
      return {
        address: `dummy${i}`,
        coordinates: { type: "Point", coordinates: v[0] },
        themeInfo: v[1],
      };
    });
    await Curation.destroy({ where: {} });

    await Curation.bulkCreate(dummy, {
      fields: ["address", "coordinates", "themeInfo"],
      raw: true,
    });
  });

  it("check get coordinates filtered curations-1", (done) => {
    const coordinates = [
      [0, 0],
      [2.5, 2.5],
    ];
    const queryStr =
      "/?coordinates=" + encodeURIComponent(JSON.stringify(coordinates));
    reqFunc(url + queryStr, "get", {}, (err, res) => {
      res.should.have.status(200);
      expect(res.body).to.be.an("array");

      const returnData = res.body.map((v) => {
        return v.address;
      });

      expect(returnData).deep.equal(["dummy1", "dummy2", "dummy4"]);
      done();
    });
  });
  it("check get coordinates filtered curations-2", (done) => {
    const coordinates = [
      [2, 2],
      [6, 6],
    ];
    const queryStr =
      "/?coordinates=" + encodeURIComponent(JSON.stringify(coordinates));
    reqFunc(url + queryStr, "get", {}, (err, res) => {
      res.should.have.status(200);
      expect(res.body).to.be.an("array");

      const returnData = res.body.map((v) => {
        return v.address;
      });

      expect(returnData).deep.equal(["dummy3"]);
      done();
    });
  });

  it("check get theme filtered curations-1", (done) => {
    const coordinates = [
      [-1, -1],
      [6, 6],
    ];
    const theme = 1;
    const queryStr = `/?coordinates=${encodeURIComponent(
      JSON.stringify(coordinates)
    )}&theme=${theme}`;
    reqFunc(url + queryStr, "get", {}, (err, res) => {
      res.should.have.status(200);
      expect(res.body).to.be.an("array");

      const returnData = res.body.map((v) => {
        return v.address;
      });

      expect(returnData).deep.equal(["dummy0", "dummy1"]);
      done();
    });
  });

  it("check get theme filtered curations-2", (done) => {
    const coordinates = [
      [-1, -1],
      [6, 6],
    ];
    const theme = 4;
    const queryStr = `/?coordinates=${encodeURIComponent(
      JSON.stringify(coordinates)
    )}&theme=${theme}`;
    reqFunc(url + queryStr, "get", {}, (err, res) => {
      res.should.have.status(200);
      expect(res.body).to.be.an("array");

      const returnData = res.body.map((v) => {
        return v.address;
      });

      expect(returnData).deep.equal(["dummy4"]);
      done();
    });
  });

  it("check get coordinates and theme filtered curations", (done) => {
    const coordinates = [
      [0, 0],
      [3, 3],
    ];
    const theme = 2;
    const queryStr = `/?coordinates=${encodeURIComponent(
      JSON.stringify(coordinates)
    )}&theme=${theme}`;
    reqFunc(url + queryStr, "get", {}, (err, res) => {
      res.should.have.status(200);
      expect(res.body).to.be.an("array");

      const returnData = res.body.map((v) => {
        return v.address;
      });

      expect(returnData).deep.equal(["dummy2"]);
      done();
    });
  });

  it("check ignore wrong data type theme", (done) => {
    const coordinates = [
      [0, 0],
      [3, 3],
    ];
    const theme = "TEST";
    const queryStr = `/?coordinates=${encodeURIComponent(
      JSON.stringify(coordinates)
    )}&theme=${theme}`;

    reqFunc(url + queryStr, "get", {}, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check ignore wrong coordinates info", (done) => {
    const queryStr = "/?coordinates=" + "!!!test";
    reqFunc(url + queryStr, "get", {}, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check ignore unformatted coordinates - 1", (done) => {
    const queryStr =
      "/?coordinates=" + encodeURIComponent(JSON.stringify([[1, 0]], []));
    reqFunc(url + queryStr, "get", {}, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check ignore unformatted coordinates - 2", (done) => {
    const queryStr =
      "/?coordinates=" +
      encodeURIComponent(JSON.stringify([["!@#", 0]], [2, 2]));
    reqFunc(url + queryStr, "get", {}, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
});
