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
            if (userProperty) {
                valueInput.value = userProperty;
            }
            if (valueInput.type === "date") {
                valueInput.value = new Date(userProperty).toISOString().substring(0, 10);
            }
        });
    })
    .catch(error => {
        console.error(error)
    });

document.forms.profileEdit.addEventListener('submit', function (event) {
    if (event.target === document.forms.profileEdit) {
        event.preventDefault();
        let profileEditForm = event.target;
        let errorsDiv = profileEditForm.querySelector(".errors__profile-editing");
        errorsDiv.classList.remove("active");
        errorsDiv.childNodes.forEach(node => {
            node.remove()
        });

        let submitButton = profileEditForm.querySelector(".submit__button");
        submitButton.disabled = true;

        let user = new Backendless.User();
        user.objectId = Backendless.UserService.currentUser.objectId;
        user.country = profileEditForm.country.value;
        user.age = parseInt(profileEditForm.age.value);
        user.sex = profileEditForm.sex.value;
        user.username = profileEditForm.username.value;
        user.birthdate = profileEditForm.birthdate.valueAsNumber;

        function userUpdated(user) {
            console.log("User has been updated:", user);
            window.location.href = "/profile";
        }

        function gotError(err) {
            errorsDiv.childNodes.forEach(node => {
                node.remove()
            });
            console.error("Error during updating:", err);
            console.log(user)
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


var fileInput = document.querySelector("input[name='file-to-upload']");

fileInput.addEventListener("input", event => {
    const files = fileInput.files;
    if (files.length > 0) {
        document.querySelector(".upload-file__button").removeAttribute("disabled");
    } else {
        document.querySelector(".upload-file__button").setAttribute("disabled", "");
    }
});
document.querySelector(".upload-file__button").addEventListener("click", event => {
    const files = fileInput.files;
    if (files.length > 0) {
        document.querySelector(".upload-file__button").setAttribute("disabled", "");

        Backendless.Files.upload(files[0], ROOT_USERS_DIRECTORY + "/" + Backendless.UserService.currentUser.email + "/" + "avatar." + files[0].name.split(".")[1], true)
            .then(function (fileReference) {
                fileInput.value = "";
                var file = {
                    fileReference: fileReference.fileURL.replace("%40", "@"),
                }
                let user = Backendless.UserService.currentUser;
                user["avatar"] = file.fileReference;
                Backendless.UserService.update(user)
                    .then(data => {
                        console.log("user was updated by avatar field");
                    });
            })
            .catch(function (error) {
                document.querySelector(".upload-file__button").removeAttribute("disabled");
            });
    } else {
        document.querySelector(".upload-file__button").removeAttribute("disabled");
    }
});