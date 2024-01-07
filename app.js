const express = require('express');
const dotenv = require('dotenv').config({path: 'config.env'});

const PORT = process.env.PORT || 3000;

//create an express application
const app = express();

//listen on the specified port
app.listen(PORT, (err) => {
    if(err) {
        throw err;
    }
    console.log(`Server listening on port ${PORT}`);
})