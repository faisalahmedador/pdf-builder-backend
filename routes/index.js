const express = require('express');
const {generatePdf} = require("../controllers/generatePdf");
const router = express.Router();

router.post('/generatePdf', generatePdf);

module.exports = router;