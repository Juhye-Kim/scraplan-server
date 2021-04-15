const {
  User,
  Curation,
  CurationCard,
  CurationFeedback,
} = require("../../../models");

module.exports = {
  init: async () => {
    await User.destroy({ where: {} });
    await Curation.destroy({ where: {} });
    await CurationCard.destroy({ where: {} });
    await CurationFeedback.destroy({ where: {} });
  },
  makeUser: async (userData) => {
    return await User.create(userData);
  },
  makeCuration: async (curationData) => {
    return await Curation.create(curationData);
  },
  makeCurationCard: async (curationCardData) => {
    return await CurationCard.create(curationCardData);
  },
  makeCurationFeedback: async (curationFeedbackData) => {
    return await CurationFeedback.create(curationFeedbackData);
  },
};
