var feedbackForm = document.forms['feedback'];
var submitButton = feedbackForm.querySelector(".submit__button");

feedbackForm.addEventListener('submit', event=>{
    event.preventDefault();
    let feedbackType = feedbackForm['feedback-type'].value;
    let feedbackText = feedbackForm['feedback-text'].value;
    if (feedbackText === ''){
        alert("Вкажіть повідомлення!");
        return;
    }
    submitButton.setAttribute("disabled", true);
    var bodyParts = new Backendless.Bodyparts();
    bodyParts.textmessage = feedbackText;
    Backendless.Messaging.sendEmail( feedbackType,
        bodyParts,
        [ "stanislav.hlova@nure.ua" ])
        .then( function( response ) {
            alert("Повідомлення було надіслано!")
        })
        .catch( function( error ) {
            submitButton.removeAttribute("disabled");
            alert(`Повідомлення не було надіслано: ${error}`);
        })
});