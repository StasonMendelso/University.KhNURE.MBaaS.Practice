document.forms.login.addEventListener("submit", function (event) {
    event.preventDefault();
    let loginForm = event.target;
    let errorsDiv = loginForm.querySelector(".errors__login");
    errorsDiv.classList.remove("active");
    errorsDiv.childNodes.forEach(node=> {node.remove()});

    let submitButton = loginForm.querySelector(".submit__button");
    submitButton.disabled = true;

    function userLoggedIn( user )
    {
        console.log( "user has logged in" );
        onNavItemClick("/profile");
        console.log("resrshheader");
        refreshHeader();
    }

    function gotError( err ) // see more on error handling
    {
        let spanElement = document.createElement("span");
        spanElement.innerText = err;
        errorsDiv.appendChild(spanElement);
        errorsDiv.classList.add("active");
        submitButton.disabled = false;
    }

    Backendless.UserService.login( loginForm.email.value, loginForm.password.value, true)
        .then( userLoggedIn )
        .catch( gotError );
})