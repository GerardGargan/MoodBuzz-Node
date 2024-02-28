const axios = require("axios");
const { average, validatePassword, validateEmail, validateName, getCurrentDate, getCurrentTime, 
  formatDatabaseDate, countTodaysSnapshots, todaysSnapshotMessage } = require('../util/helper_functions');

exports.getIndex = (req, res) => {
  //store if the user is logged in & pass to the template (for dynamic navbar links)
  const { isLoggedIn } = req.session;
  res.render("index", { currentPage: "home", isLoggedIn });
};

exports.getLogin = (req, res) => {
  const { isLoggedIn } = req.session;
  //check if a user was just registered, if so display success message
  const successMessage = req.query.success ? 'Registration successful. You can now log in.' : null;

    res.render("login", { currentPage: "login", isLoggedIn, error: false, successMessage });
};

exports.postLogin = async (req, res) => {

  const { isLoggedIn } = req.session;
  let { email, password } = req.body;
    
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
        const orig_route = session.route;

        //redirect to appropriate page
        if(!orig_route) {
          res.redirect("/user/home");
        } else {
          res.redirect(`${orig_route}`);
        }
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

    let { firstname, surname, email, password } = req.body;

    //sanitise user input, remove any leading or trailing whitespace, force to be lowercase
    firstname = firstname.trim().toLowerCase();
    surname = surname.trim().toLowerCase();
    email = email.trim().toLowerCase();

    //capitalise first letter of firstname and surname
    firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);
    surname = surname.charAt(0).toUpperCase() + surname.slice(1);

    const vals = { firstname, surname, email, password };

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
          res.redirect('/login?success=1');
        } else {
          //email already exists, render error on registration page
          res.render("register", { currentPage: "register", isLoggedIn, error: 'Email already exists' });
        }
      } catch (err) {
        console.log(err);
      }
};

exports.getUserHomePage = async (req, res) => {
  const { userid, firstName, lastName } = req.session;
  //check if a deletion occured, so we can display a success message to the user
  const deletedMessage = req.query.deleted ? 'Snapshot deleted' : null;

    try {
      //query database, retrieve snapshots for the current user
      const endpointSnapshots = `http://localhost:3001/snapshot/user/${userid}`;
      const snapshotRequest = await axios.get(endpointSnapshots, {
        validateStatus: (status) => {
          return status < 500;
        },
      });
      const snapshots = snapshotRequest.data.result;

      //get the number of snapshots returned
      const numberOfSnapshots = snapshots.length;

      //count the number of snapshots recorded today
      const countToday = countTodaysSnapshots(snapshots);
      //pass this in to get todays message to display to the user
      const todaysSnapMessage = todaysSnapshotMessage(countToday);

      const currentDateTime = `${formatDatabaseDate(getCurrentDate())} ${getCurrentTime()}`;

      res.render("userhome", {
        groupedDataSorted: snapshots,
        numberOfSnapshots,
        todaysSnapMessage,
        firstName, lastName, currentDateTime, deletedMessage
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
      res.redirect(`/user/snapshot/view/${snapshotId}?success=1`);
    } catch (err) {
      //Server error, status 500 - log out
      console.log(err);
    }
};

exports.getViewSnapshot = async (req, res) => {
  const { userid, firstName, lastName } = req.session;
  const { id } = req.params;

  //check if a snapshot was successfully just added
  const newSnapshotMessage = req.query.success ? 'Snapshot successfully recorded' : null;
  const editSnapshotMessage = req.query.edit ? 'Snapshot updated' : null;

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
          error: false,
          newSnapshotMessage,
          editSnapshotMessage
        });
      } else {
        //pass error message back to the view snapshot page
        res.render('viewsnapshot', {
          snapshot: null,
          firstName,
          lastName,
          error: 'Snapshot does not exist or does not belong to current user',
          newSnapshotMessage,
          editSnapshotMessage
        });
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
        res.redirect("/user/home?deleted=1");
      } else {
        //invalid id or does not belong to user, render error message
        res.render('viewsnapshot', {
          snapshot: null,
          firstName,
          lastName,
          error: response.data.message, 
          newSnapshotMessage: null, 
          editSnapshotMessage: null
        })
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
          snapshot: null,
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
  const { firstName, lastName, userid } = req.session;
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
        res.redirect(`/user/snapshot/view/${id}?edit=1`);
      } else {
        //snapshot doesnt exist or doesnt belong to current logged in user, display error
        res.render("editsnapshot", {
          snapshot: null,
          firstName,
          lastName,
          error: 'Snapshot doesnt exist or doesnt belong to current user'
        });
      }
    } catch (err) {
      //server error, handle
      console.log(err.message);
    }
};

exports.getAnalytics = async (req, res) => {
  //get the userid from the session
  const { userid, firstName, lastName } = req.session;

  try {
    //API endpoint for data retrieval for snapshots by month (month: count)
    const endpointMonthly = `http://localhost:3001/snapshot/analytics/snapshotspermonth/${userid}`;
    const responseMonthly = await axios.get(endpointMonthly, {
      validateStatus: (status) => {
        return status < 500;
      }
    });
    //store the result
    const monthlyData = responseMonthly.data.result;

    //get the maximum count that was returned from the dataset (used for setting max y-axis value on chart)
    const maxYAxisValueMonthly = Math.max(...Object.values(monthlyData));

    //set up empty arrays to hold dates and counts (chart.js requires arrays)
    const dates = [];
    const monthlyCounts = [];

    //loop through the result set and populate the arrays using destructuring
    for (const [date, count] of Object.entries(monthlyData)) {
      dates.push(date);
      monthlyCounts.push(count);
    }

    //API endpoint for getting snapshots by weekday
    const endpointWeekday = `http://localhost:3001/snapshot/analytics/snapshotsperday/${userid}`;
    const responseWeekday = await axios.get(endpointWeekday, {
      validateStatus: (status) => {
        return status < 500;
      }
    });

    //access the data returned
    const weekdayData = responseWeekday.data.result;

    //set up arrays to hold weekdays and counts
    const weekdays = Object.keys(weekdayData);
    const weekdaycounts = Object.values(weekdayData);
    const maxWeekdayValue = Math.max(...weekdaycounts);

    //now get all snapshots, so we can chart emotion levels
    const endpointAllSnapshots = `http://localhost:3001/snapshot/user/${userid}`;
    const requestSnapshots = await axios.get(endpointAllSnapshots, {
      validateStatus: (status) => {
        return status < 500;
      }
    });

    const snapshotData = requestSnapshots.data.result;
    const groupedEmotionsData = {};

    //loop through each snapshot, then each emotion. Check if it exists already, if not add it to the object
    snapshotData.forEach((snapshot) => {
      //loop through each emotion inside each snapshot
      snapshot.emotions.forEach((emotion) => {
        //check if the emotion exists in our grouped object
        if(!groupedEmotionsData[emotion.emotion]) {
          //it doesnt exist, create the emotion with an empty array
          groupedEmotionsData[emotion.emotion] = [];
        }

        //add the rating to the array for the current emotion
        groupedEmotionsData[emotion.emotion].push(emotion.rating);

      })
    });
 

    //loop through our data structure containing each emotion, each emotion has an array of ratings
    Object.keys(groupedEmotionsData).forEach(emotion => {
      //calculate the average for each emotion and store it against the emotion, replacing the array
      groupedEmotionsData[emotion] = average(groupedEmotionsData[emotion]);
    });
    console.log(groupedEmotionsData);
    //get an array of the emotions (keys) for chart js
    const emotionLabels = Object.keys(groupedEmotionsData);
    //get an array of the average ratings (values) for chart js
    const emotionAverages = Object.values(groupedEmotionsData);
    //get the max value
    const maxEmotionValue = Math.max(...emotionAverages);
    
    //now obtain all triggers and their counts for this user
    const endpoint = `http://localhost:3001/triggers/analytics/${userid}`;
    const triggersResponse = await axios.get(endpoint, {
      validateStatus: (status) => {
        return status < 500
      }
    });

    //store the data in a varialbe
    const triggerCounts = triggersResponse.data.result;
   
    //convert to an array of key value pairs (to allow sorting, wanting to show highest to lowest on graph)
    const triggerCountsArray = Object.entries(triggerCounts);
    
    //sort from highest to lowest
    triggerCountsArray.sort((a, b) => b[1] - a[1]);
    //set up empty arrays to hold the triggers and values (for graph js)
    const triggers = [];
    const triggerVals = [];

    //loop through and populate the arrays
    triggerCountsArray.forEach(trigger => {
      triggers.push(trigger[0]);
      triggerVals.push(`${[trigger[1]]}`);
    });

    //get the max value to use for the maximum y axis on the chart
    const maxTriggerCount = Math.max(...triggerVals);


    //render the analytics template with the data 
    res.render('analytics', { dates, monthlyCounts, maxYAxisValueMonthly, weekdays, weekdaycounts, maxWeekdayValue, emotionLabels, emotionAverages, maxEmotionValue, triggers, triggerVals, maxTriggerCount, firstName, lastName });
  
  } catch(err) {
    //server error 500
    console.log(err);
  }
};

exports.getNotFound = (req, res) => {
  //render page not found
  res.status(404).send("<h1>404: Page Not Found</h1>");
};