const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const indexRouter = require('./routes/index');
const cors = require('cors');


const app = express();
// Configure CORS options
// const corsOptions = {
//     origin: 'http://127.0.0.1:8080/', // Change this to your Angular app's URL
//     optionsSuccessStatus: 200, // For legacy browser support
//     methods: 'GET,PUT,POST,DELETE', // Allowable methods
//     allowedHeaders: '*', // Allowable headers
// };
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 2 * 1024 * 1024 * 1024 //2MB max file(s) size
    }
}))

app.use('/', indexRouter);

app.listen( 3000, () => {
    console.log('App listening on port ' +  3000);
})
module.exports = app;