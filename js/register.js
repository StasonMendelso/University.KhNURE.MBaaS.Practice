document.forms.register.addEventListener('submit', function (event) {
    if (event.target === document.forms.register) {
        event.preventDefault();
        let registerForm = event.target;
        let errorsDiv = registerForm.querySelector(".errors__registration");
        errorsDiv.classList.remove("active");
        errorsDiv.childNodes.forEach(node => {
            node.remove()
        });

        let submitButton = registerForm.querySelector(".submit__button");
        submitButton.disabled = true;

        let user = new Backendless.User();
        user.email = registerForm.email.value;
        user.password = registerForm.password.value;
        user.country = registerForm.country.value;
        user.age = parseInt(registerForm.age.value);
        user.sex = registerForm.sex.value;
        user.username = registerForm.username.value;
        user.birthdate = new Date(new Date(registerForm.birthdate.value).toUTCString().slice(0, -4)); //convert to UTC

        function userRegistered(user) {
            console.log("User has been registered:", user);
            registerForm.querySelector(".successful__registration").classList.add("active");
            Backendless.Files.createDirectory(`/web/users/${user.email}`)
                .then(() => {
                    console.log("personal directory for user was created");
                    Backendless.Files.createDirectory(`/web/users/${user.email}/shared-with-me`)
                        .then(() => {
                            console.log("shared-with-me directory for user was created");

                        })
                        .catch(err => {
                            console.log(`error with creating shared-with-me directory for user ${err}`);
                        });
                })
                .catch(err => {
                    console.log(`error with creating personal directory for user ${err}`);
                });
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