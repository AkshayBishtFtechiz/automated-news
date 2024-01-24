const NewFirmsWireSchema = require("../Schema/NewFirmModel");

// Create NewFirmWireNews
exports.createNewFirmWire = async (req, res) => {
  const r = req.body;

  await NewFirmsWireSchema.find({
    $and: [{ firmName: r.firmName }, { newsWire: r.newsWire }],
  })
    .then(async (data) => {
      if (data.length > 0) {
        const getNewFirm = await NewFirmsWireSchema.find();
        res.send([
          {
            message: "Firm Already Present",
            newFirms: getNewFirm,
          },
        ]);
      } else {
        // Insert new firm in db
        NewFirmsWireSchema.create(r)
          .then(async (data) => {
            const getNewFirm = await NewFirmsWireSchema.find();
            res.send(getNewFirm);
          })
          .catch((err) => {
            res.send(err);
          });
      }
    })
    .catch((err) => {
      res.send(err);
    });
};

// Delete NewFirmWireNews

exports.deleteNewFirmWire = async (req, res) => {
  NewFirmsWireSchema.deleteMany({})
    .then((data) => {
      data === null
        ? res.send({
            message: "News already deleted",
          })
        : res.send({
            message: "News deleted successfully",
          });
    })
    .catch((err) => {
      res.send(err);
    });
};
