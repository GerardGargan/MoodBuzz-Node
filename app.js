const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const dotenv = require('dotenv').config({ path: 'config.env' });
const router = require('./routes/routes');

const PORT = process.env.PORT || 3000;

//create an express application
const app = express();

//set up middleware and view engine
app.set('view engine', 'ejs');
//set up public folder
app.use(express.static(__dirname + "/public"));
//set up sessions
app.use(session({
    secret: 'moodbuzz',
    resave: false,
    saveUninitialized: false
}));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
//mount the router to the root path
app.use('/', router);

//listen on the specified port
app.listen(PORT, (err) => {
    if (err) {
        throw err;
    }
    console.log(`Server listening on port ${PORT}`);
})