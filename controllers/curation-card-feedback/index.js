module.exports = {
  get: require("./getCurationFeedbacks"),
  post: require("./createCurationFeedback"),
  patch: require("./editCurationFeedback"),
  delete: require("./deleteCurationFeedback"),
};
