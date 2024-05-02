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

getAvatar();
function getAvatar(){
    let key = "Backendless_D6BB7AB9-473E-1462-FF54-292662C3A500";
    let userTokenLs = JSON.parse(localStorage.getItem(key))[`user-token`];
    let user = new Backendless.User();
    user['user-token'] = userTokenLs;
    Backendless.UserService.currentUser = user;
    Backendless.UserService.getCurrentUser(true)
        .then(user =>{
            console.log(user);
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
