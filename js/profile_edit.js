Backendless.UserService.getCurrentUser(true)
    .then(user => {
        if (!user) {
            onNavItemClick("/login");
            return;
        }
        Backendless.UserService.currentUser = user;
        let profileWrapper = document.querySelector(".profile__wrapper");
        let informationRowValueInput = profileWrapper.querySelectorAll(".information-row__value");
        informationRowValueInput.forEach(valueInput => {
            let userProperty = user[valueInput.dataset['fieldName']];
            console.log(userProperty)
            if (userProperty ) {
                valueInput.value = userProperty;
            }
        });
    })
    .catch(error => {
        console.error(error)
    });

document.forms.profileEdit.addEventListener('submit', function(event) {
    if (event.target === document.forms.profileEdit) {
        event.preventDefault();
        let profileEditForm = event.target;
        let errorsDiv = profileEditForm.querySelector(".errors__profile-editing");
        errorsDiv.classList.remove("active");
        errorsDiv.childNodes.forEach(node=> {node.remove()});

        let submitButton = profileEditForm.querySelector(".submit__button");
        submitButton.disabled = true;

        let user = new Backendless.User();
        user.objectId = Backendless.UserService.currentUser.objectId;
        user.country = profileEditForm.country.value;
        user.age = parseInt(profileEditForm.age.value);
        user.sex = profileEditForm.sex.value;
        user.username = profileEditForm.username.value;

        function userUpdated(user) {
            console.log("User has been updated:", user);
            window.location.href = "/profile";
        }

        function gotError(err) {
            errorsDiv.childNodes.forEach(node=> {node.remove()});
            console.error("Error during updating:", err);
            let spanElement = document.createElement("span");
            spanElement.innerText = err;
            errorsDiv.appendChild(spanElement);
            errorsDiv.classList.add("active");
            submitButton.disabled = false;
        }

        Backendless.UserService.update(user)
            .then(userUpdated)
            .catch(gotError);
    }
});