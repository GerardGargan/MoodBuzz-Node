const express = require('express');
const path = require('path');
const db = require('../util/dbconn');
const util = require('util');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { currentPage: 'home' });    
});

router.get('/login', (req,res) => {
    res.render('login', {currentPage: 'login' });
});

router.post('/login', (req, res) => {
    const {email} = req.body;
    const checkEmailQuery = 'SELECT user_id FROM user WHERE email_address = (?)';
    db.query(checkEmailQuery, email, (err, rows) => {
        console.log(rows);
        console.log(rows.length);
    });
    //TODO
    //salt and hash password
    //check if email and password exists
    //redirect/store cookie?
});

router.get('/register', (req,res) => {
    res.render('register', { currentPage: 'register' });
});

router.get('/user/home', (req, res) => {

    const querySnapshots = 'SELECT snapshot.snapshot_id, date_time, emotion, rating FROM snapshot INNER JOIN snapshot_emotion ON snapshot.snapshot_id = snapshot_emotion.snapshot_id INNER JOIN emotion ON snapshot_emotion.emotion_id = emotion.emotion_id';

    db.query(querySnapshots, (err, rows) => {
        
        const groupedData = [];

    rows.forEach(row => {
        const { snapshot_id, date_time, emotion, rating } = row;

        // If there is no object for the current snapshot_id, create an object with an array
        if (!groupedData[snapshot_id]) {
            groupedData[snapshot_id] = {
            snapshot_id,
            date_time,
            emotions: [],
            };
        }

        // Push the current emotion into the array for its snapshot_id
        groupedData[snapshot_id].emotions.push({ [emotion]: rating });
        });

       // console.log(groupedData);
        console.log(util.inspect(groupedData, { showHidden: false, depth: null, colors: true }));

        res.render('userhome', { currentPage: 'userhome', data: groupedData });
    });

    
});

router.get('/user/snapshot', (req,res) => {
    res.render('snapshot', { currentPage: 'snapshot' });
});

router.get('/user/analytics', (req,res) => {
    res.send('Placeholder for Analytics')
});

router.get('/query', async(req, res) => {

    try {
        const query1 = 'SELECT * FROM emotion';
        const query2 = 'SELECT * FROM triggers';

        const result1 = await executeQuery(query1);
        const result2 = await executeQuery(query2);

        const combinedResults = {result1, result2};

        res.send(combinedResults);

    } catch(error) {
        console.log(error);
    }


});

router.get('*', (req,res) => {
    res.status(404).send('<h1>404: Page Not Found</h1>');
})

function executeQuery(query) {
    return new Promise((resolve, reject) => {
        db.query(query, (err, rows) => {
            if(err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = router;