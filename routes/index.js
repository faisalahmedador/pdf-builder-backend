const express = require('express');
const {generatePdf} = require("../controllers/generatePdf");
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Welcome');
});

router.post('/generatePdf', generatePdf);

module.exports = router;