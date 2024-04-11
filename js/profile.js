Backendless.UserService.getCurrentUser(true)
    .then(user => {
        if (!user) {
            onNavItemClick("/login");
            return;
        }
        Backendless.UserService.currentUser = user;
        let profileWrapper = document.querySelector(".profile__wrapper");
        let informationRowValueSpans = profileWrapper.querySelectorAll(".information-row__value");
        informationRowValueSpans.forEach(valueSpan => {
            let userProperty = user[valueSpan.dataset['fieldName']];
            if (userProperty) {
                valueSpan.innerText = userProperty;
            }
        });
    })
    .catch(error => {
        console.error(error)
    });
