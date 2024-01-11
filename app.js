const express = require('express');
const dotenv = require('dotenv').config({path: 'config.env'});
const router = require('./routes/routes');

const PORT = process.env.PORT || 3000;

//create an express application
const app = express();

//set up middleware and view engine
app.set('view engine','ejs');
app.use(express.static(__dirname+"/public"));
app.use(express.urlencoded({extended: true}));
app.use('/', router);

//listen on the specified port
app.listen(PORT, (err) => {
    if(err) {
        throw err;
    }
    console.log(`Server listening on port ${PORT}`);
})