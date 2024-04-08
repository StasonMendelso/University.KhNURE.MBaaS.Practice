let loginForm = document.forms.login;

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    function userLoggedIn( user )
    {
        console.log( "user has logged in" );
    }

    function gotError( err ) // see more on error handling
    {
        console.log( "error message - " + err.message );
        console.log( "error code - " + err.statusCode );
    }

    Backendless.UserService.login( loginForm.email.value, loginForm.password.value, true)
        .then( userLoggedIn )
        .catch( gotError );
})