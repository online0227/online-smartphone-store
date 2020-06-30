const express = require("express");
const router = express.Router();
const marked = require("marked");
const yaml = require("yaml-front-matter");
const read = (req, res) => {
  try {
    const site = req.hostname.split(".")[0]

    if (!site) {
      throw new Error("No site provided")
    }

    const file = path.resolve(__dirname, `../data/${site}/Homepage.md`)

    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        res.status(404).send(err)
        return
      }
      const obj = yaml.loadFront(data)
      obj.__content = marked(obj.__content)
      res.json(obj)
    })
  } catch (err) {
    res.status(404).json(err)
  }
}

router.get("/markdown", read);

module.exports = router;
