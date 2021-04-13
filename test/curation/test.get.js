const { Curation } = require("../../models");

const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const url = "/curations";

describe("🔥GET /curations", () => {
  before(async () => {
    let dummy = [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [1, 2],
    ];
    dummy = dummy.map((v, i) => {
      return {
        address: `dummy${i}`,
        coordinates: { type: "Point", coordinates: v },
      };
    });
    await Curation.destroy({ where: {} });

    await Curation.bulkCreate(dummy, {
      fields: ["address", "coordinates"],
      raw: true,
    });

    // const check = await Curation.findAll({ raw: true });

    // check.map((v) => {
    //   console.log(v.coordinates.coordinates);
    // });
  });

  it("check get filtered curations-1", (done) => {
    const coordinates = [
      [0, 0],
      [2.5, 2.5],
    ];
    const queryStr =
      "/?coordinates=" + encodeURIComponent(JSON.stringify(coordinates));
    reqFunc(url + queryStr, "get", {}, (err, res) => {
      const returnData = res.body.map((v) => {
        return v.address;
      });

      expect(returnData).deep.equal(["dummy1", "dummy2", "dummy4"]);
      done();
    });
  });

  it("check get filtered curations-2", (done) => {
    const coordinates = [
      [2, 2],
      [6, 6],
    ];
    const queryStr =
      "/?coordinates=" + encodeURIComponent(JSON.stringify(coordinates));
    reqFunc(url + queryStr, "get", {}, (err, res) => {
      const returnData = res.body.map((v) => {
        return v.address;
      });

      expect(returnData).deep.equal(["dummy3"]);
      done();
    });
  });
});
