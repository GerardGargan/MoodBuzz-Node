document.addEventListener('DOMContentLoaded', (event) => {

    const passwordInput = document.getElementById('password');
    const passwordVerify = document.getElementById('password-verify');
    const verify_icon = document.getElementById('verify-icon');
    const submitButton = document.getElementById('submit-button');
    const visibilityButton = document.getElementById('visibility');
    let verifyActivated = false;
    
    passwordInput.addEventListener('keyup', (event) => {
        if (verifyActivated) {
            updateVerification();
        }
    });
    
    passwordVerify.addEventListener('keyup', (event) => {
        verifyActivated = true;
        updateVerification();
    });
    
    function updateVerification() {
        if (passwordVerify.value == '' && passwordInput.value == '') {
            passwordVerify.classList.remove('bg-danger');
            passwordVerify.classList.remove('bg-success');
            verify_icon.innerHTML = '<i class="bi bi-dash"></i>';
        } else if (passwordVerify.value == passwordInput.value) {
            verify_icon.innerHTML = '<i class="bi bi-hand-thumbs-up"></i>';
            passwordVerify.classList.remove('bg-danger');
            passwordVerify.classList.add('bg-success');
            submitButton.disabled = false;
        } else {
            verify_icon.innerHTML = '<i class="bi bi-hand-thumbs-down"></i>';
            passwordVerify.classList.remove('bg-success');
            passwordVerify.classList.add('bg-danger');
            submitButton.disabled = true;
        }
    }
    
    //Logic for switching password between visible and invisible
    visibilityButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (passwordInput.type == 'password') {
            passwordInput.type = 'text';
            visibilityButton.innerHTML = "<i class=\"bi bi-eye-slash\"></i>";
        } else {
            passwordInput.type = 'password';
            visibilityButton.innerHTML = "<i class=\"bi bi-eye\"></i>";
        }
    });
    
    //perform validation checks, display error message and prevent form submission if an error exists
    submitButton.addEventListener('click', (event) => {
        //get all elements needed
        const firstname = document.getElementById('firstname').value;
        const surname = document.getElementById('surname').value;
        const emailaddress = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        //get the div where we will display the error
        const errorDiv = document.getElementById('error');
        //set up error text variable and set errors to false
        let errorText = ``;
        let error = false;
    
        //perform validation checks, add any error text to the above variable and if an error exists set the error var to true
        if(!validateName(firstname) || !validateName(surname)){
            errorText += '<li>Invalid name, must be 2-50 characters</li>';
            error = true;
        }
    
        if(!validateEmail(emailaddress)) {
            errorText += '<li>Invalid email</li>';
            error = true;
        }
    
        if(!validatePassword(password)) {
            errorText += '<li>Invalid Password, must be at least 8 characters long and have a capital letter</li>'
            error = true;
        }
    
        if(password !== passwordVerify.value) {
            errorText += '<li>Passwords do not match</li>';
            error = true;
        }
    
        //if an error was present, prevent submission and display the error div and error text
        if(error) {
            event.preventDefault();
            errorDiv.classList.remove('d-none');
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
});


