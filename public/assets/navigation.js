const logoutLink = document.getElementById('logoutLink');
const logoutPopUp = document.getElementById('logoutPopUp');

logoutLink.addEventListener('click', e => {
    e.preventDefault();
    console.log('testing the logoutLink')
    auth.signOut();
    var instance = M.Modal.getInstance(logoutPopUp);

    if (window.location.href === "https://classroom-helper-8cf0c.web.app/login") {
        instance.open();
    } else {
        window.location.href = "https://classroom-helper-8cf0c.web.app/login";
    }

});

document.addEventListener('DOMContentLoaded', function () {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
});