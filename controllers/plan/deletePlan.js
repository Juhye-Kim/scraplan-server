const { Plan, PlanCard, sequelize, Sequelize } = require("../../models");
const checkNumberType = require("../util/checkNumberType");
module.exports = async (req, res) => {
  const { authData } = req;
  const { planId } = req.body;

  if (!authData || checkNumberType("required", planId)) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  try {
    const targetPlan = await Plan.findOne({ where: { id: planId } });

    if (!targetPlan) {
      return res
        .status(404)
        .json({ message: "There is no data with given plan id" });
    }

    if (targetPlan.UserId !== authData.id) {
      return res.status(403).send();
    }

    await targetPlan.destroy();

    return res.status(200).json({ message: "successfully deleted" });
  } catch (err) {
    console.log(
      "-------------------------------Error occurred in plan/deletePlan.js-------------------------------- \n",
      err,
      "-------------------------------Error occurred in plan/deletePlan.js-------------------------------- \n"
    );
    return res.status(500).send();
  }
};
