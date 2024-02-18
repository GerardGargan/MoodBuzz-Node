const bcrypt = require("bcrypt");
const axios = require("axios");

exports.getIndex = (req, res) => {
  //store if the user is logged in & pass to the template (for dynamic navbar links)
  const { isLoggedIn } = req.session;
  res.render("index", { currentPage: "home", isLoggedIn });
};

exports.getLogin = (req, res) => {
  const { isLoggedIn } = req.session;
    res.render("login", { currentPage: "login", isLoggedIn, error: false });
};

exports.postLogin = async (req, res) => {

  const { isLoggedIn } = req.session;
  const { email, password } = req.body;

    try {
      const endpoint = "http://localhost:3001/user/login";
      const vals = { email, password };
      //post the form data to the api post route
      const response = await axios.post(endpoint, vals, {
        validateStatus: (status) => {
          return status < 500;
        },
      });
      //if email and password are a match
      if (response.status == 200) {
        //success, set up session and redirect
        //get the user data returned from the api
        const userData = response.data.result;
        //set up a session
        const session = req.session;
        session.isLoggedIn = true;
        session.userid = userData[0].user_id;
        session.firstName = userData[0].first_name;
        session.lastName = userData[0].last_name;

        //redirect to user homepage
        res.redirect("/user/home");
      } else {
        //invalid login credentials, handle error message to user
        console.log(response.data.message);
        res.render("login", { currentPage: "login", isLoggedIn, error: 'Incorrect email or password' });
      }
    } catch (err) {
      //server error
      console.log(err);
    }
};

exports.getRegister = (req, res) => {
  const { isLoggedIn } = req.session;
    res.render("register", { currentPage: "register", isLoggedIn, error: false });
};

exports.postRegister = async (req, res) => {
  const { isLoggedIn } = req.session;

    let vals = ({ firstname, surname, email, password } = req.body);
    console.log(`${firstname} ${surname} ${email} ${password}`);

    //sanitise user input, remove any leading or trailing whitespace
    firstname = firstname.trim();
    surname = surname.trim();
    email = email.trim();

    //perform validation checks on data, render an error message for each scenario
    if(!validateName(firstname) || !validateName(surname)){
      //names do not meet business rules, render error on registration page
      return res.render("register", { currentPage: "register", isLoggedIn, error: 'First and last name must be between 2-50 characters and contain no special characters' });
    }

    if(!validateEmail(email)) {
      //email does not meet business rules, render error on registration page
      return res.render("register", { currentPage: "register", isLoggedIn, error: 'Invalid email address' });
    }

    if(!validatePassword(password)) {
      //password does not meet business rules, render error on reigstration page
      return res.render("register", { currentPage: "register", isLoggedIn, error: 'Password must be at least 8 characters long and contain a capital letter' });
    }

    //we have passed all validation checks on user inputs, proceed to attempt registration with API call
      try {
        const endpoint = "http://localhost:3001/user/register";
        const response = await axios.post(endpoint, vals, {
          validateStatus: (status) => {
            return status < 500;
          },
        });
        if (response.status == 201) {
          //user created successfully, redirect to login
          res.redirect("/login");
        } else {
          //email already exists, render error on registration page
          res.render("register", { currentPage: "register", isLoggedIn, error: 'Email already exists' });
        }
      } catch (err) {
        console.log(err);
      }
};

exports.getUserHomePage = async (req, res) => {
  const { userid, firstName } = req.session;

    try {
      //query database, retrieve snapshots for the current user
      const endpointSnapshots = `http://localhost:3001/snapshot/user/${userid}`;
      const snapshotRequest = await axios.get(endpointSnapshots, {
        validateStatus: (status) => {
          return status < 500;
        },
      });
      const snapshots = snapshotRequest.data.result;
      //get emotions data from the database
      const endpointEmotions = `http://localhost:3001/emotions`;
      const emotionsRequest = await axios.get(endpointEmotions, {
        validateStatus: (status) => {
          return status < 500;
        },
      });
      const emotions = Object.values(emotionsRequest.data.result);

      //get the number of snapshots returned
      const numberOfSnapshots = snapshots.length;

      //count the number of snapshots recorded today
      const countToday = countTodaysSnapshots(snapshots);
      //pass this in to get todays message to display to the user
      const todaysSnapMessage = todaysSnapshotMessage(countToday);

      res.render("userhome", {
        groupedDataSorted: snapshots,
        emotions: emotions,
        numberOfSnapshots,
        todaysSnapMessage,
        firstName,
      });
    } catch (err) {
      //handle error
      console.log(err);
    }
};

exports.getNewSnapshotPage = async (req, res) => {
  const { firstName, userid, lastName } = req.session;

    try {
      const endpointEmotions = `http://localhost:3001/emotions`;
      const emotions = await axios.get(endpointEmotions, {
        validateStatus: (status) => {
          return status < 500;
        },
      });
      const groupedData = emotions.data.result;

      const endpointTriggers = `http://localhost:3001/triggers`;
      const triggers = await axios.get(endpointTriggers, {
        validateStatus: (status) => {
          return status < 500;
        },
      });
      const triggerData = triggers.data.result;

      const currentDate = formatDatabaseDate(getCurrentDate());
      const dateTime = `${currentDate} ${getCurrentTime()}`;

      res.render("snapshot", {
        groupedData,
        triggerData,
        lastName,
        firstName,
        dateTime,
      });
    } catch (err) {
      //API error, status 500
      console.log(err);
    }
};

exports.processNewSnapshot = async (req, res) => {
  const { firstName, userid } = req.session;

    //Extract data from the request body
    const formData = req.body;

    try {
      const endpoint = "http://localhost:3001/snapshot";
      const response = await axios.post(endpoint, formData, {
        validateStatus: (status) => {
          return status < 500;
        },
        headers: { userid: `${userid}` },
      });
      const snapshotId = response.data.id;
      res.redirect(`/user/snapshot/view/${snapshotId}`);
    } catch (err) {
      //Server error, status 500 - log out
      console.log(err);
    }
};

exports.getViewSnapshot = async (req, res) => {
  const { userid, firstName, lastName } = req.session;
  const { id } = req.params;
  console.log(id);

    try {
      const response = await axios.get(`http://localhost:3001/snapshot/${id}`, {
        validateStatus: (status) => {
          return status < 500;
        },
        headers: { userid: `${userid}` },
      });

      if (response.status == 200) {
        //successfully retrieved a snapshot, render

        res.render("viewsnapshot", {
          snapshot: response.data.result,
          firstName,
          lastName,
          error: false
        });
      } else {
        //pass error message back to the view snapshot page
        res.render('viewsnapshot', {
          snapshot: null,
          firstName,
          lastName,
          error: 'Snapshot does not exist or does not belong to current user'
        })
      }
    } catch {
      //server error status 500 - log out
      console.log("error in catch");
    }
};

exports.deleteSnapshot = async (req, res) => {
  //get the snapshot id from the parameters
  const { id } = req.params;
  //get session details
  const { userid, firstName, lastName } = req.session;

    try {
      const response = await axios.delete(
        `http://localhost:3001/snapshot/${id}`,
        {
          validateStatus: (status) => {
            return status < 500;
          },
          headers: {
            userid: userid,
          },
        }
      );

      if (response.status == 200) {
        //successful deletion, redirect
        console.log(`snapshot ${id} deleted`);
        res.redirect("/user/home");
      } else {
        //invalid id or does not belong to user, log out message
        console.log(response.data.message);
        //redirect to user home
        res.redirect("/user/home");
      }
    } catch (err) {
      //server error, log out error
      console.log(response.data.message);
    }
};

exports.getLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getEdit = async (req, res) => {
  const { id } = req.params;
  const { userid, firstName, lastName } = req.session;

    try {
      const response = await axios.get(`http://localhost:3001/snapshot/${id}`, {
        validateStatus: (status) => {
          return status < 500;
        },
        headers: { userid: `${userid}` },
      });

      if (response.status == 200) {
        //success, render snapshot
        res.render("editsnapshot", {
          snapshot: response.data.result,
          firstName,
          lastName,
          error: false
        });
      } else {
        //unsuccessful, snapshot doesnt exist or doesnt belong to user
        res.render("editsnapshot", {
          snapshot: response.data.result,
          firstName,
          lastName,
          error: 'Snapshot doesnt exist or doesnt belong to current user'
        });
      }
    } catch (err) {
      console.log(err);
    }
};

exports.postEditUpdate = async (req, res) => {
  //get user info from the session
  const { firstName, userid } = req.session;
  //get the id of the snapshot being edited
  const { id } = req.params;

    //get the data from the form
    const formData = req.body;

    //API endpoint for editing
    const endpoint = `http://localhost:3001/snapshot/edit/${id}`;
    try {
      //send patch request to API with formData
      const response = await axios.patch(endpoint, formData, {
        validateStatus: (status) => {
          return status < 500;
        },
        headers: { userid: `${userid}` }
      });

      if(response.status == 201) {
        //successful update, redirect to view the updated snapshot
        res.redirect(`/user/snapshot/view/${id}`);
      } else {
        //handle error - snapshot does not exist or does not blong to current logged in user
        console.log(response.data.message);
      }
    } catch (err) {
      //server error, handle
      console.log(err.message);
    }
};

exports.getNotFound = (req, res) => {
  //render page not found
  res.status(404).send("<h1>404: Page Not Found</h1>");
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
  //check if name is within the allowed range (2-50) and doesnt contain any special characters or numbers

  if (
    name.length >= minLength &&
    name.length <= maxLength &&
    nameRegex.test(name)
  ) {
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
  const month = databaseDate.getMonth() + 1; //zero indexed
  const day = databaseDate.getDate();

  return `${day}/${month}/${year}`;
}

function countTodaysSnapshots(snapshots) {
  let countToday = 0;
  let currentDate = formatDatabaseDate(getCurrentDate());
  snapshots.forEach((snapshot) => {
    let date = snapshot.date;
    if (date == currentDate) {
      countToday += 1;
    }
  });
  return countToday;
}

function todaysSnapshotMessage(number_of_snapshots) {
  let todaysSnapMessage = null;
  //check if there have been snapshots today and display an appropriate message
  if (number_of_snapshots > 0) {
    todaysSnapMessage = {
      message: `You have recorded ${number_of_snapshots} snapshots today! Well done!`,
    };
  } else {
    todaysSnapMessage = {
      message: `You have not recorded any snapshots yet today`,
    };
  }
  return todaysSnapMessage;
}