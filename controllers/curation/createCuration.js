const { Curation, Sequelize } = require("../../models");

module.exports = async (req, res) => {
  const { authData } = req;
  const { address } = req.body;
  let { coordinates } = req.body;

  if (!authData || !coordinates || !address) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  if (!authData.isAdmin) {
    return res.status(403).send();
  }

  try {
    coordinates = JSON.parse(decodeURIComponent(coordinates));
    if (
      typeof coordinates[0] !== "number" ||
      typeof coordinates[1] !== "number"
    )
      throw new Error();
  } catch (err) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  try {
    const [curation, created] = await Curation.findOrCreate({
      where: {
        coordinates: Sequelize.fn(
          "ST_GeomFromText",
          `POINT(${coordinates[0]} ${coordinates[1]})`
        ),
      },
      defaults: {
        coordinates: { type: "Point", coordinates },
        address,
      },
    });

    if (created) {
      res.status(200).json({
        message: "successfully added",
        id: curation.id,
      });
    } else {
      res.status(409).json({ message: "Already exists coordinates" });
    }
  } catch (err) {
    console.log(
      "-------------------------------Error occurred in curation/createCurations.js-------------------------------- \n",
      err,
      "-------------------------------Error occurred in curation/createCurations.js-------------------------------- \n"
    );
    res.status(500).send();
  }
};
