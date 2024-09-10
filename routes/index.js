const express = require('express');
const {generatePdf} = require("../controllers/generatePdf");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const {generateMinimal} = require("../controllers/generateMinimal");
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Welcome');
});

router.post('/generatePdf', generatePdf);

router.post('/minimalTest', generateMinimal)

module.exports = router;