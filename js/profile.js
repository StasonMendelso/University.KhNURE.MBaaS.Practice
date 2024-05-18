Backendless.UserService.getCurrentUser(true)
    .then(user => {
        if (!user) {
            onNavItemClick("/login");
            return;
        }
        Backendless.UserService.currentUser = user;
        let profileWrapper = document.querySelector(".profile__wrapper");
        let informationRowValueSpans = profileWrapper.querySelectorAll(".information-row__value");
        informationRowValueSpans.forEach(element => {
            let userProperty = user[element.dataset['fieldName']];
            if (userProperty && element.tagName.toLowerCase() === "span") {
                element.innerText = userProperty;
                if (element.dataset['fieldName'] === 'birthdate') {
                    element.innerText = new Date(userProperty).toDateString();
                }
            }
            if (userProperty && element.tagName.toLowerCase() === "input") {
                if (element.type === "checkbox") {
                    element.checked = userProperty;
                } else {
                    element.value = userProperty;
                }
            }
        });
    })
    .catch(error => {
        console.error(error)
    });

getAvatar();

function getAvatar() {
    let key = "Backendless_D6BB7AB9-473E-1462-FF54-292662C3A500";
    let userTokenLs = JSON.parse(localStorage.getItem(key))[`user-token`];
    let user = new Backendless.User();
    user['user-token'] = userTokenLs;
    Backendless.UserService.currentUser = user;
    Backendless.UserService.getCurrentUser(true)
        .then(user => {
            var headers = new Headers();
            headers.append('user-token', user['user-token']);

            var options = {
                method: 'GET',
                headers: headers
            };
            let url = user['avatar'].replace('%40', '@');
            fetch(url, options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.blob();
                })
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    const img = document.getElementById('avatar');
                    img.src = blobUrl;
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });
        });

}

document.querySelector("input[data-field-name='track_geolocation']").addEventListener("change", event => {
    let user = Backendless.UserService.currentUser;
    user['track_geolocation'] = event.target.checked;
    Backendless.UserService.update(user)
        .then(data => console.log("user has updated track_geolocation = " + event.target.checked))
        .catch(console.log);
});