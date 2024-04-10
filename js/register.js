document.forms.register.addEventListener('submit', function(event) {
    if (event.target === document.forms.register) {
        event.preventDefault();
        let registerForm = event.target;
        let errorsDiv = registerForm.querySelector(".errors__registration");
        errorsDiv.classList.remove("active");
        errorsDiv.childNodes.forEach(node=> {node.remove()});

        let submitButton = registerForm.querySelector(".submit__button");
        submitButton.disabled = true;

        let user = new Backendless.User();
        user.email = registerForm.email.value;
        user.password = registerForm.password.value;
        user.country = registerForm.country.value;
        user.age = parseInt(registerForm.age.value);
        user.sex = registerForm.sex.value;
        user.username = registerForm.username.value;

        function userRegistered(user) {
            console.log("User has been registered:", user);
            registerForm.querySelector(".successful__registration").classList.add("active");
        }

        function gotError(err) {
            console.error("Error during registration:", err);
            let spanElement = document.createElement("span");
            spanElement.innerText = err;
            errorsDiv.appendChild(spanElement);
            errorsDiv.classList.add("active");
            submitButton.disabled = false;
        }

        Backendless.UserService.register(user)
            .then(userRegistered)
            .catch(gotError);
    }
});