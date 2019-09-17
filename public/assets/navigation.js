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
    changeSizes();
});

window.addEventListener("resize", changeSizes);

var navbar = document.getElementsByClassName('nav-wrapper');
var logoImage = document.getElementById('logoImage');

function changeSizes() {
  logoImage.style.height = navbar[0].clientHeight + "px";
}
