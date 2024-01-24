const db = require('./../util/dbconn');
const bcrypt = require('bcrypt');

exports.getIndex = (req, res) => {
    res.render('index', { currentPage: 'home' });
};

exports.getLogin = (req, res) => {
    res.render('login', { currentPage: 'login' });
};

exports.postLogin = async (req, res) => {
    //destructure the values into variables
    const { email, password } = req.body;

    //set up in an array for the query function
    const vals = [email, password];
    const selectSQL = `SELECT * FROM user WHERE email_address = ?`;

    try {
        const [userData, fieldData] = await db.query(selectSQL, vals);
        if (userData.length >= 1) {
            console.log('user exists');
            //access the first element of the array to get the user details (we should only ever return one element)
            console.log(userData[0].email_address);

            //get the stored hashed password
            const hashedPassword = userData[0].password.toString();

            //check if the plain text password matches the hashed password
            const passwordMatch = await comparePassword(password, hashedPassword);
            if (passwordMatch) {
                //email and password matches - successful log in
                //TODO - store session and redirect to user home page
                console.log('Password match');
            } else {
                console.log('Password does not match')
            }
        } else {
            console.log('user does not exist');
        }
    } catch (err) {
        throw err;
    }
};

exports.getRegister = (req, res) => {
    res.render('register', { currentPage: 'register' });
};

exports.postRegister = async (req, res) => {
    let { firstname, surname, email, password } = req.body;
    console.log(`${firstname} ${surname} ${email} ${password}`);

    //sanitise user input
    firstname = firstname.trim();
    surname = surname.trim();
    email = email.trim();

    /* log out for testing
    console.log(validatePassword(password));
    console.log(validateEmail(email));
    console.log(validateName(firstname));
    console.log(validateName(surname));
    */

    //perform validation checks on data
    if (validateName(firstname) && validateName(surname) && validateEmail(email) && validatePassword(password)) {

        //check if user already exists
        const vals = [email];
        const selectSQL = `SELECT user_id FROM user WHERE email_address = ?`;

        try {
            const [userDetails, fielddata] = await db.query(selectSQL, vals);
            if (userDetails.length >= 1) {
                console.log('User exists, cant complete registration');
                //TODO stop registration and inform the user
            } else {
                console.log('User does not exist');
                //continue registration - we have validated the data and checked the email doesnt already exist

                //salt and hash password
                const hashed = await hashPassword(password);
                console.log(`hashed password ${hashed}`);

                const valsToInsert = [firstname, surname, email, hashed];
                const insertSQL = `INSERT INTO user (first_name, last_name, email_address, password) VALUES (?, ?, ?, ?)`;

                //insert user to database
                const [rows, fielddata] = await db.query(insertSQL, valsToInsert);
                console.log('success');

                //TODO
                //insert session
                //redirect to user home?

            }
        } catch (err) {
            if (err) console.log(err);
        }
    } else {
        //invalid data - did not pass validation functions
        console.log('invalid data entered!!');
    }
};

exports.getUserHomePage = async (req, res) => {
    //this query retrieves the data from snapshots, and the emotions/levels recorded on those snapshots
    const selectSnapshots = `SELECT snapshot.snapshot_id, date, time, emotion, emotion.emotion_id, rating FROM snapshot INNER JOIN snapshot_emotion ON snapshot.snapshot_id = snapshot_emotion.snapshot_id INNER JOIN emotion ON snapshot_emotion.emotion_id = emotion.emotion_id WHERE user_id = 4`; //user id hardcoded for now
    //this query selects the emotions for our table headers
    const selectEmotions = `SELECT emotion FROM emotion`;

    const todaysDate = [getCurrentDate()];
    const selectTodaysSnapshots = `SELECT COUNT(snapshot_id) AS count FROM snapshot WHERE date = ?`;

    //set up an empty array (for parsing data into an appropriate data structure to pass to the ejs template)
    const groupedData = [];

    try {
        
        //run the queries
        const [emotions, fieldData] = await db.query(selectEmotions);
        const [data, fielddata] = await  db.query(selectSnapshots);
        const [todaysSnapshots, fieldData2] = await db.query(selectTodaysSnapshots, todaysDate);
        
        //initialise counter
        let numberOfSnapshots = 0;
        //loop through each row, we need to create an array of snapshot objects, that each contain an array of emotions with ratings
        data.forEach(row => {
            //destructure into variables
            const {snapshot_id, date, time, emotion, emotion_id, rating} = row;

            //check if the snapshot object already exists in the array, if not create the object
            if(!groupedData[snapshot_id]) {
                groupedData[snapshot_id] = {
                    snapshot_id,
                    date: formatDatabaseDate(date),
                    time,
                    emotions: [],
                }
                //increase the counter to keep track of how many snapshots there are in the array
                numberOfSnapshots +=1;
            }
            //add the emotion into the emotions array (within the snapshot object), along with the id and rating
            groupedData[snapshot_id].emotions.push({emotion_id: emotion_id, emotion: emotion, rating: rating});
        });

        //sort the snapshots based on the id, in descending order - so that the most recent is displayed first.
        const groupedDataSortedDesc = groupedData.sort((a,b) => {
            return b.snapshot_id - a.snapshot_id;
        });

        let todaysSnapMessage = null;
        if(todaysSnapshots[0].count>0) {
            todaysSnapMessage = { message: `You have recorded ${todaysSnapshots[0].count} snapshots today! Well done!`};
        } else {
            todaysSnapMessage = { message: `You have not recorded any snapshots yet today`};
        }

        //render the page and data
        res.render('userhome', { currentPage: 'userhome', groupedDataSortedDesc, emotions, numberOfSnapshots, todaysSnapMessage });
    } catch(err) {
        throw err;
    }
};


exports.getNewSnapshotPage = async (req, res) => {

    const selectRatings = `SELECT emotion.emotion_id, emotion, rating, short_desc, long_desc FROM emotion INNER JOIN emotion_rating ON emotion.emotion_id = emotion_rating.emotion_id INNER JOIN rating ON emotion_rating.rating_id = rating.rating_id`;
    const selectTriggers = `SELECT trigger_id, trigger_name, icon FROM triggers`;
    try {
        //run query to get the emotions and ratings data
        const [data, fielddata2] = await db.query(selectRatings);
        //console.log(data)
        const groupedData = [];
        //parse data into an appropriate structure to pass to the template
        data.forEach(row => {
            //if it doesnt already exist, create the emotion object
            const { emotion_id, emotion, rating, short_desc, long_desc } = row;
            if (!groupedData[emotion_id]) {
                groupedData[emotion_id] = {
                    emotion_id,
                    emotion,
                    rating: []
                }
            }
            //push each rating data into the rating array in the emotion object
            groupedData[emotion_id].rating.push({ rating: rating, shortdesc: short_desc, longdesc: long_desc });
        });

        //run the query to get the triggers
        const [triggerData, fieldData] = await db.query(selectTriggers);

        //console.log(JSON.stringify(groupedData));
        //console.log(triggerData);
        res.render('snapshot', { groupedData, triggerData, currentPage: 'snapshot' });
    } catch (err) {
        throw err;
    }
};

exports.processNewSnapshot = async (req, res) => {

    //Extract data from the URL (assuming they are in the query parameters)
    const formData = req.query;
    const { notes } = req.query;
    const user_id = 4; //hardcode for now

    //Process the form data and prepare it for database insertion
    const emotionsToInsert = [];

    try {
        //insert snapshot record first
        const snapshotInsert = `INSERT INTO snapshot (user_id, date, time, note) VALUES (?, ?, ?, ?)`;
        const date = getCurrentDate();
        const time = getCurrentTime();
        const snapshotVals = [user_id, date, time, notes];
        const triggersToInsert = Array.isArray(req.query.trigger) ? req.query.trigger : (req.query.trigger ? [req.query.trigger] : []);
        //Ensures triggers are stored in an array so we can later iterate through - as if only one trigger is submitted it does not create an array, it is stored as a string. We have avoided this behaviour.
        //We have also done a check to ensure we dont create an array with one object of undefined - if no triggers are selected
        const [snapInsert, fieldData] = await db.query(snapshotInsert, snapshotVals);
        //store the id of the snapshot - needs to be inserted on each many to many record we insert on the many to many table
        const snapshotId = snapInsert.insertId;
        //loop through emotions and values in the url query and insert into array
        for (const id in formData) {
            if (Object.hasOwnProperty.call(formData, id) && id != 'notes' && id != 'trigger') {
                const value = formData[id];
                // push the data into the array as an object with the snapshot id, emotion id and the value submitted
                emotionsToInsert.push({ snapshotId, id, value });
            }
        }
        //console.log(emotionsToInsert);

        //now insert each emotion record in the many to many table snapshot_emotion
        if (emotionsToInsert.length > 0) { //check first if we have any records to insert
            const emotionQuery = 'INSERT INTO snapshot_emotion (snapshot_id, emotion_id, rating) VALUES ?';
            const [rows, fielddata] = await db.query(emotionQuery, [emotionsToInsert.map(record => [record.snapshotId, record.id, record.value])]);
        }

        //now insert each trigger in the many to many table snapshot_trigger
        if (triggersToInsert.length > 0) {
            console.log(triggersToInsert.length);
            console.log(triggersToInsert);
            const triggerQuery = `INSERT INTO snapshot_trigger (snapshot_id, trigger_id) VALUES (?, ?)`;
            triggersToInsert.forEach(async trig => {
                const vals = [snapshotId, trig];
                const [data, fielddata] = await db.query(triggerQuery, vals);
            });
        }

        res.redirect('/user/home');
    } catch (err) {
        throw err;
    }

};

exports.getNotFound = (req, res) => {
    //render page not found
    res.status(404).send('<h1>404: Page Not Found</h1>');
};


function validatePassword(password) {
    //regex to check if a password contains a capital letter
    const capitalRegex = /[A-Z]/;
    //check the password is at least 8 characters long and has a capital letter
    if (password.length >= 8 && capitalRegex.test(password)) {
        return true;
    } else {
        return false;
    }
}

function validateEmail(email) {
    /*must start with one or more characters that are not whitespace or @
    then must contain @ symbol
    Followed by one or more characters that are not whitespace or @
    must contain a . for domain seperator
    must end with one or more characters that are not whitespace or @ 
    */

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
        return true;
    } else {
        return false;
    }
}

function validateName(name) {
    const minLength = 2;
    const maxLength = 50;
    const nameRegex = /^[A-Za-z\s-]+$/;
    //check if name is within the allowed range and doesnt contain any special characters or numbers

    if (name.length >= minLength && name.length <= maxLength && nameRegex.test(name)) {
        return true;
    } else {
        return false;
    }
}

//takes a plain text password, returns a salted and hashed password using bcrypt
async function hashPassword(password) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        throw err;
    }
}

async function comparePassword(password, hashedPassword) {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (err) {
        throw err;
    }
}

//Get the current date YY/MM/DD in this format for the mysql database insertion
function getCurrentDate() {
    let currentDate = new Date();

    let year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1; //zero indexed
    let date = currentDate.getDate();

    let formattedDate = `${year}/${month}/${date}`;

    return `${formattedDate}`;
}

//Get the current time
function getCurrentTime() {
    let currentDate = new Date();

    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    let seconds = currentDate.getSeconds();

    let formattedTime = `${hours}:${minutes}:${seconds}`;
    return formattedTime;
}

//parse the long version of the data from the database to the format DD/MM/YYYY
function formatDatabaseDate(date) {
    const databaseDate = new Date(date);
    const year = databaseDate.getFullYear();
    const month = databaseDate.getMonth() +1; //zero indexed
    const day = databaseDate.getDate();

    return `${day}/${month}/${year}`;
}