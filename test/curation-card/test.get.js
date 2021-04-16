const { Curation, CurationCard } = require("../../models");

const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");

describe("🔥GET /curation-cards", () => {
  let curationCardDummy, curationCardResult;
  before(async () => {
    await Curation.destroy({ where: {} });
    await CurationCard.destroy({ where: {} });

    const curationDummy = {
      address: `testAddr1`,
      coordinates: { type: "Point", coordinates: [10, 12] },
    };
    const resultCuration = await Curation.create(curationDummy);

    curationCardDummy = [
      {
        CurationId: resultCuration.id,
        theme: 1,
        title: "감성 카페",
        detail: "테라스에서 보이는 강이 아주 분위기 있는 곳",
        photo: "https://photo.scraplan.com/~~~",
        avgTime: 1,
        feedbackCnt: 10,
      },
      {
        CurationId: resultCuration.id,
        theme: 2,
        title: "시원한 풍경",
        detail: "강 주변이 아주 아름답게 되어 있는 곳",
        photo: "https://photo.scraplan.com/~~~",
        avgTime: 3.3,
        feedbackCnt: 5,
      },
    ];

    curationCardResult = await CurationCard.bulkCreate(curationCardDummy);
  });
  it("check ignore wrong type resource", (done) => {
    const url = `/curation-cards/1t`;

    reqFunc(url, "get", {}, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check curationId required", (done) => {
    const url = `/curation-cards`;

    reqFunc(url, "get", {}, (err, res) => {
      res.should.have.status(404);
      done();
    });
  });

  it("check empty array returned while none exists data", (done) => {
    const url = `/curation-cards/23`;

    reqFunc(url, "get", {}, (err, res) => {
      res.should.have.status(200);

      expect(res.body).to.be.an("array");
      expect(res.body).to.eql([]);

      done();
    });
  });

  it("check get curtion-cards", (done) => {
    const url = `/curation-cards/${curationCardDummy[0].CurationId}`;

    reqFunc(url, "get", {}, (err, res) => {
      res.should.have.status(200);
      expect(res.body).to.be.an("array");

      for (const [idx, curation] of curationCardResult.entries()) {
        expect(res.body[idx].curationCardId).to.eql(curation.id);
        expect(res.body[idx].theme).to.eql(curation.theme);
        expect(res.body[idx].title).to.eql(curation.title);
        expect(res.body[idx].detail).to.eql(curation.detail);
        expect(res.body[idx].photo).to.eql(curation.photo);
        expect(res.body[idx].avgTime).to.eql(curation.avgTime);
        expect(res.body[idx].feedbackCnt).to.eql(curation.feedbackCnt);
      }

      done();
    });
  });
});
