const { sequelize } = require("../../models");

module.exports = async (req, res) => {
  try {
    let { coordinates } = req.query;

    if (!coordinates) {
      return res.status(400).json({ message: "Insufficient info" });
    }

    coorinates = JSON.parse(decodeURIComponent(coordinates));

    const [results, metadata] = await sequelize.query(
      `SELECT * FROM Curations WHERE MBRCONTAINS(ST_LINESTRINGFROMTEXT('LineString(? ?,? ?)'), coordinates); `,
      {
        replacements: [
          coorinates[0][0],
          coorinates[0][1],
          coorinates[1][0],
          coorinates[1][1],
        ],
      }
    );

    res.status(200).json(results);
  } catch (err) {
    console.log(
      "-------------------------------Error occurred in curation/getCurations.js-------------------------------- \n",
      err,
      "-------------------------------Error occurred in curation/getCurations.js-------------------------------- \n"
    );
    res.status(500).send();
  }
};
