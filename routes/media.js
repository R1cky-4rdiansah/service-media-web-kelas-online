const express = require("express");
const router = express.Router();
const isBase64 = require("is-base64");
const base64img = require("base64-img");
const { Media } = require("../models");

router.get("/", async (req, res) => {
  const media = await Media.findAll({ attributes: ["id", "image"] });

  const mediaMapped = media.map((val) => {
    val.image = `${req.get("host")}/${val.image}`;
    return val;
  });

  return res.json({
    status: "success",
    data: mediaMapped,
  });
});

router.post("/", (req, res) => {
  const image = req.body.image;

  if (!isBase64(image, { mimeRequired: true })) {
    return res.status(400).json({ status: "Error", message: "invalid base64" });
  }

  base64img.img(image, "./public/images", Date.now(), async (err, filepath) => {
    if (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }

    const filename = filepath.split("\\").pop();

    const data = await Media.create({ image: `images/${filename}` });

    return res.json({
      data: {
        id: data.id,
        image: `${req.get("host")}/images/${filename}`,
      },
    });
  });
});

module.exports = router;
