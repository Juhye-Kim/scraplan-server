const { sequelize } = require("../../models");
const checkNumberType = require("../util/checkNumberType");

module.exports = async (req, res) => {
  try {
    let { coordinates, theme } = req.query;

    if (!coordinates || checkNumberType("optional", theme)) {
      return res.status(400).json({ message: "Insufficient info" });
    }

    try {
      coordinates = JSON.parse(decodeURIComponent(coordinates));
      if (
        !Array.isArray(coordinates[0]) ||
        !Array.isArray(coordinates[1]) ||
        typeof coordinates[0][0] !== "number" ||
        typeof coordinates[0][1] !== "number" ||
        typeof coordinates[1][0] !== "number" ||
        typeof coordinates[1][1] !== "number"
      )
        throw new Error();
    } catch (err) {
      return res.status(400).json({ message: "Insufficient info" });
    }

    const query = `SELECT id, coordinates, address FROM Curations WHERE MBRCONTAINS(ST_LINESTRINGFROMTEXT('LineString(? ?,? ?)'), coordinates)
    ${theme > -1 ? `AND ${theme} MEMBER OF (themeInfo)` : ""};`;

    const [results, metadata] = await sequelize.query(query, {
      replacements: [
        coordinates[0][0],
        coordinates[0][1],
        coordinates[1][0],
        coordinates[1][1],
      ],
    });

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
