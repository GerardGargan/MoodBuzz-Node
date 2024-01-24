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