        
        const passwordInput = document.getElementById('password');
        const visibilityButton = document.getElementById('visibility');

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