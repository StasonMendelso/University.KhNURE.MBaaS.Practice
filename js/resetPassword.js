document.forms['reset-password'].addEventListener("submit", function (event) {
    event.preventDefault();
    let resetPasswordForm = event.target;
    let errorsDiv = resetPasswordForm.querySelector(".errors__reset-password");
    errorsDiv.classList.remove("active");
    errorsDiv.childNodes.forEach(node => {
        node.remove()
    });

    let submitButton = resetPasswordForm.querySelector(".submit__button");
    submitButton.disabled = true;

    function passwordRecoverySent() {
        console.log("an email with a link to restore password has been sent to the user");
        document.querySelector(".successful__reset-password").classList.add("active");
    }

    function gotError(err) {
        setError(err.message);
        submitButton.disabled = false;
    }
    function setError(errorText) {
        let spanElement = document.createElement("span");
        spanElement.innerText = errorText;
        errorsDiv.appendChild(spanElement);
        errorsDiv.classList.add("active");
    }
    let queryBuilder = Backendless.DataQueryBuilder.create()
        .setWhereClause(`email = '${resetPasswordForm.email.value}'`);

    Backendless.Data.of(Backendless.User).find(queryBuilder)
        .then(function (users) {
            if (users.length > 0) {
                let user = users[0];
                if(user.userStatus === "EMAIL_CONFIRMATION_PENDING"){
                    setError('Спочатку підтвердіть електронну адресу.');
                    submitButton.disabled = false;
                    return;
                }
                if(user.userStatus === "DISABLED"){
                    setError('Ваш аккаунт заблокавано.');
                    submitButton.disabled = false;
                    return;
                }
                Backendless.UserService.restorePassword(resetPasswordForm.email.value)
                    .then(passwordRecoverySent)
                    .catch(gotError);
            } else {
                setError('Користувача не знайдено');
                submitButton.disabled = false;
            }
        })
        .catch(gotError);


})