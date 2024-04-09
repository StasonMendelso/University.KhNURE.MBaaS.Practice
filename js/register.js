document.forms.register.addEventListener('submit', function(event) {
    // Check if the event target is the registerForm
    if (event.target === document.forms.register) {
        // Prevent the default form submission behavior
        event.preventDefault();

        let registerForm = event.target;

        let user = new Backendless.User();
        user.email = registerForm.email.value;
        user.password = registerForm.password.value;
        user.country = registerForm.country.value;
        user.age = parseInt(registerForm.age.value);
        user.sex = registerForm.sex.value;
        user.username = registerForm.username.value;

        console.log(user);

        // Define callback functions
        function userRegistered(user) {
            console.log("User has been registered:", user);
        }

        function gotError(err) {
            console.error("Error during registration:", err);
        }

        // Perform user registration
        Backendless.UserService.register(user)
            .then(userRegistered)
            .catch(gotError);
    }
});