

document.addEventListener('DOMContentLoaded', function () {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
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
