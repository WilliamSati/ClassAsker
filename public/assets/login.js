
const emailLogin = document.getElementById('emailLogin');
const passwordLogin = document.getElementById('passwordLogin');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const btnGoToMyClasses = document.getElementById('btnGoToMyClasses');
var emailInput = document.getElementById('emailForReset');

var loginErrorMessage = document.querySelector('.loginErrorMessage');
var cannotLogin = document.getElementById('cannotLogin');






document.addEventListener('DOMContentLoaded', function () {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
});

btnEmailSubmit.addEventListener('click', e => {
    var email = emailInput.value;

    auth.sendPasswordResetEmail(email).then(function () {
        // Email sent.
    }).catch(function (error) {
        console.log('could not sent emailreset', error); // An error happened.
    });

});

//testing123
btnLogin.addEventListener('click', e => {
    const email = emailLogin.value;
    const pass = passwordLogin.value;

    //sign in
    auth.signInWithEmailAndPassword(email, pass).then(user => {
        window.location.href = "https://classroom-helper-8cf0c.web.app/myClasses";
    }).catch(error => {
        var instance = M.Modal.getInstance(cannotLogin);
        loginErrorMessage.innerHTML = error.message;
        instance.open();
    });
});

//test
btnLogout.addEventListener('click', e => {
    //sign out
    auth.signOut();
    console.log('logged out');
});

//realtime listener
auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        console.log(firebaseUser);

    } else {
        console.log('not logged in');
    }
    manageTags(firebaseUser);
});


