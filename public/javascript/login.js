//event will only fire when all html content is loaded to prevent issues
document.addEventListener("DOMContentLoaded", (event) => {
  //access form elements
  const passwordInput = document.getElementById("password");
  const visibilityButton = document.getElementById("visibility");

  //Logic for switching password between visible and invisible
  //add event listener on the button waiting for a click event
  visibilityButton.addEventListener("click", (event) => {
    //prevent the form from submitting
    event.preventDefault();
    //if the input type is passwoord, swap it to text and update the icon
    if (passwordInput.type == "password") {
      passwordInput.type = "text";
      visibilityButton.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
      //if the input type is text, swap it to password and update the icon
      passwordInput.type = "password";
      visibilityButton.innerHTML = '<i class="bi bi-eye"></i>';
    }
  });
});
