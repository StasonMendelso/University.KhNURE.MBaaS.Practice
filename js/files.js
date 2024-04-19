if(!Backendless.UserService.currentUser){
    document.addEventListener("globalScriptLoaded", (event)=>{
        loadFiles(`/${Backendless.UserService.currentUser.email}`);
    })
}else{
    loadFiles(`/${Backendless.UserService.currentUser.email}`);
}

function loadFiles(path) {
    document.querySelector(".files__current__path span").innerText = path;
    Backendless.Files.listing(ROOT_DIRECTORY + path)
        .then(render)
        .catch(function (error) {
            console.log(error);
        });
}



function isRootDirectory() {
    return document.querySelector(".files__current__path span").innerText === "/"+Backendless.UserService.currentUser.email;
}

function render(filesAndDirectoryArray){

    document.querySelectorAll(".file__row, .directory__row").forEach(element=>element.remove());
    if(isRootDirectory()){
        document.querySelector(".back-directory__row").classList.remove('enabled');
    }else{
        document.querySelector(".back-directory__row").classList.add('enabled');
    }
    filesAndDirectoryArray.sort((a,b)=> {
        if (a.size && b.size){
            return 0;
        }
        if (a.size){
            return -1;
        }
        return 1;
    });

    console.log(filesAndDirectoryArray);

    let directoryRowHtml = '<div class = "files__row directory__row">\
                            <span class = "file__name directory__name">directory</span>\
                            <div class = "file__actions">\
                                <span class = "file__delete-button file__action">Видалити</span>\
                            </div>\
                        </div>';
    let fileRowHtml = '<div class = "files__row file__row">\
                            <span class = "file__name">file.extension</span>\
                            <div class = "file__actions">\
                                <span class = "file__download-button file__action">Завантажити</span>\
                                <span class = "file__delete-button file__action">Видалити</span>\
                            </div>\
                        </div>';
    filesAndDirectoryArray.forEach(element =>{
        let divElement = document.createElement("div");

        document.querySelector(".back-directory__row").insertAdjacentElement("afterend",divElement);
       if (!element.size){
           divElement.innerHTML = directoryRowHtml;
           divElement = divElement.firstChild;
           divElement.querySelector(".directory__name").innerText = element.name;
       }else{
           divElement.innerHTML = fileRowHtml;
           divElement = divElement.firstChild;
           divElement.querySelector(".file__name").innerText = element.name;
       }

    });

    document.querySelector(".files__rows").addEventListener("dblclick",(event)=>{
        event.stopImmediatePropagation();
        if (event.target.closest(".directory__name")){
            console.log("clicked");
            let currentPath = document.querySelector(".files__current__path span").innerText;
            if (event.target.innerText === ". . ."){
                let lastSlashIndex = currentPath.lastIndexOf('/');

                let upperPath = lastSlashIndex !== -1 ? currentPath.substring(0, lastSlashIndex) : url;
                loadFiles(upperPath);
                return;
            }

            loadFiles(currentPath + "/" + event.target.innerText);
        }
    })
}