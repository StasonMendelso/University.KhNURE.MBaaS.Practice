let registerForm = document.forms.register;

registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let user = new Backendless.User();
    user.email = registerForm.email.value;
    user.password = registerForm.password.value;
    user.country = registerForm.country.value;
    user.age = parseInt(registerForm.age.value);
    user.sex = registerForm.sex.value;
    user.username = registerForm.username.value;

    console.log(user);

    function userRegistered( user )
    {
        console.log( "user has been registered" );
    }

    function gotError( err ) // see more on error handling
    {
        console.log( "error message - " + err.message );
        console.log( "error code - " + err.statusCode );
    }

    Backendless.UserService.register( user ).then( userRegistered ).catch( gotError );
})