const {
  Curation,
  CurationCard,
  sequelize,
  Sequelize,
} = require("../../models");

module.exports = async (req, res) => {
  const { authData } = req;
  if (!authData.isAdmin) {
    return res.status(403).send();
  }

  const { curationCardId, theme, title, detail, photo } = req.body;
  if (
    (curationCardId > -1 ? isNaN(Number(curationCardId)) : true) ||
    (theme > -1 ? isNaN(Number(theme)) : true) ||
    !(theme || title || detail || photo)
  ) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  function errorMessage(code, message) {
    this.code = code;
    this.message = message;
  }

  try {
    await sequelize.transaction(async (t) => {
      const curationCard = await CurationCard.findOne({
        where: { id: curationCardId },
        transaction: t,
      });
      if (!curationCard) {
        throw new errorMessage(
          404,
          "There is no data with given curation card id"
        );
      }

      let isChanged = false;
      if (theme && theme !== curationCard.theme) {
        //theme의 경우 기존 curation의 theme정보가 있는지 확인하여 없다면 저장, 있다면 409코드 반환
        const curation = await Curation.findOne({
          where: { id: curationCard.CurationId },
          transaction: t,
        });

        let existsTheme = false;
        curation.themeInfo = [
          ...curation.themeInfo.filter((el, idx) => {
            return el !== theme ? true : (existsTheme = true) && false;
          }),
          theme,
        ];

        if (existsTheme) {
          //속해 있는 curation에 theme이 이미 있는 경우
          throw new errorMessage(409, "Already exists theme");
        } else {
          //속해 있는 curation에 theme이 없는 경우
          await curation.save({ transaction: t });
          curationCard.theme = theme;
          isChanged = true;
        }
      }

      if (detail && detail !== curationCard.detail) {
        curationCard.detail = detail;
        isChanged = true;
      }
      if (title && title !== curationCard.title) {
        curationCard.title = title;
        isChanged = true;
      }
      if (photo && photo !== curationCard.photo) {
        curationCard.photo = photo;
        isChanged = true;
      }

      if (isChanged) {
        await curationCard.save({ transaction: t });
      } else {
        throw new errorMessage(400, "Nothing Changed");
      }
    });
  } catch (err) {
    if (err instanceof errorMessage) {
      return res.status(err.code).json({ message: err.message });
    } else {
      console.log(
        "-------------------------------Error occurred in curation-card/editCurationCard.js-------------------------------- \n",
        err,
        "-------------------------------Error occurred in curation-card/editCurationCard.js-------------------------------- \n"
      );
      return res.status(500).send();
    }
  }
  res.status(200).json({ message: "successfully edited" });
};
