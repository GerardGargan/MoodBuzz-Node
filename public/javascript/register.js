//check all content has loaded first
document.addEventListener("DOMContentLoaded", (event) => {
  //access all elements needed on the page that we need to use
  const passwordInput = document.getElementById("password");
  const passwordVerify = document.getElementById("password-verify");
  const verify_icon = document.getElementById("verify-icon");
  const submitButton = document.getElementById("submit-button");
  const visibilityButton = document.getElementById("visibility");
  let verifyActivated = false;


  //Logic for switching password between visible and invisible
  visibilityButton.addEventListener("click", (event) => {
    //prevent the form from being submitted
    event.preventDefault();
    //check if input type is password, if so switch to text and change icon
    if (passwordInput.type == "password") {
      passwordInput.type = "text";
      visibilityButton.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
      //change input type to password, update icon
      passwordInput.type = "password";
      visibilityButton.innerHTML = '<i class="bi bi-eye"></i>';
    }
  });

  //perform validation checks, display error message and prevent form submission if an error exists
  submitButton.addEventListener("click", (event) => {
    //get all elements needed
    const firstname = document.getElementById("firstname").value;
    const surname = document.getElementById("surname").value;
    const emailaddress = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    //get the div where we will display the error
    const errorDiv = document.getElementById("error");
    //set up error text variable and set errors to false initially, if all validation checks pass error will remain false
    let errorText = ``;
    let error = false;

    //perform validation checks, add any error text to the above variable and if an error exists set error to true
    if (!validateName(firstname) || !validateName(surname)) {
      errorText += "<li>Invalid name, must be 2-50 characters</li>";
      error = true;
    }

    if (!validateEmail(emailaddress)) {
      errorText += "<li>Invalid email</li>";
      error = true;
    }

    if (!validatePassword(password)) {
      errorText +=
        "<li>Invalid Password, must be at least 8 characters long and have a capital letter</li>";
      error = true;
    }

    if (password !== passwordVerify.value) {
      errorText += "<li>Passwords do not match</li>";
      error = true;
    }

    //if an error was present, prevent submission and display the error div and error text
    if (error) {
      event.preventDefault();
      errorDiv.classList.remove("d-none");
      errorDiv.innerHTML = `<h5>Error</h5><ul>${errorText}</ul>`;
    }
  });

  //validate password logic
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

  //validate email logic
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

  //validate name logic
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

  //add a keyup event listener on the password input
  passwordInput.addEventListener("keyup", (event) => {
    //if the user has already typed into the password verify input, check if passwords match.
    //this stops the verification process from running until the user starts typing into the password verification box
    if (verifyActivated) {
      updateVerification();
    }
  });

  //listen for a keyup event on the password verify input
  passwordVerify.addEventListener("keyup", (event) => {
    //set the verifyActivated to true, as user has started to type in the password to the verification input
    verifyActivated = true;
    //check if passwords match and update DOM elements
    updateVerification();
  });

  //function to check if the two password fields match
  function updateVerification() {
    //first check if both input boxes are empty
    if (passwordVerify.value == "" && passwordInput.value == "") {
      //remove any success or red backgrounds and update the icon
      passwordVerify.classList.remove("bg-danger");
      passwordVerify.classList.remove("bg-success");
      verify_icon.innerHTML = '<i class="bi bi-dash"></i>';
    } else if (passwordVerify.value == passwordInput.value) {
      //both passwords match, update icon to thumbs up. Remove red background and add green success background
      verify_icon.innerHTML = '<i class="bi bi-hand-thumbs-up"></i>';
      passwordVerify.classList.remove("bg-danger");
      passwordVerify.classList.add("bg-success");
      //enable the submit button
      submitButton.disabled = false;
    } else {
      //both passwords dont match, update icon to thumbs down. Remove success background and add danger/red background
      verify_icon.innerHTML = '<i class="bi bi-hand-thumbs-down"></i>';
      passwordVerify.classList.remove("bg-success");
      passwordVerify.classList.add("bg-danger");
      //disable the submit button as passwords dont match
      submitButton.disabled = true;
    }
  }
  
});
