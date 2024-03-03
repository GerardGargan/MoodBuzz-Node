//Function to get the average of an array of numbers, average is returned to 1 decimal place
function average(numbers) {
  //initialise total and count to 0
  let total = 0;
  let count = 0;
  //loop through each number, add to the total and increment count by 1
  numbers.forEach((number) => {
    total += number;
    count++;
  });
  //return the average to 1 decimal place
  return (total / count).toFixed(1);
}

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

//logic to validate a users name - must be at least 2 chars and max 50. No special characters or numbers
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

//Get the current date YY/MM/DD in this format for the mysql database insertion
function getCurrentDate() {
  let currentDate = new Date();

  let year = currentDate.getFullYear();
  let month = currentDate.getMonth() + 1; //zero indexed
  let date = currentDate.getDate();

  //format the date
  let formattedDate = `${year}/${month}/${date}`;

  return `${formattedDate}`;
}

//Get the current time
function getCurrentTime() {
  let currentDate = new Date();

  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();
  let seconds = currentDate.getSeconds();

  //format the time
  let formattedTime = `${hours}:${minutes}:${seconds}`;
  return formattedTime;
}

//parse the long version of the date returned from the database to the format DD/MM/YYYY
function formatDatabaseDate(date) {
  const databaseDate = new Date(date);
  const year = databaseDate.getFullYear();
  const month = databaseDate.getMonth() + 1; //zero indexed
  const day = databaseDate.getDate();

  return `${day}/${month}/${year}`;
}

//loops through snapshots and checks if they were recorded today. Returns a count for todays snapshots
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

//returns an appropriate message dependant on the number of snapshots recorded today
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

//export helper functions for use
module.exports = {
  average,
  validatePassword,
  validateEmail,
  validateName,
  getCurrentDate,
  getCurrentTime,
  formatDatabaseDate,
  countTodaysSnapshots,
  todaysSnapshotMessage,
};
