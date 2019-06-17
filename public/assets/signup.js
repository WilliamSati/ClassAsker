
    const emailSignup = document.getElementById('emailSignup');
    const passwordSignup = document.getElementById('passwordSignup');
    const btnSignup = document.getElementById('btnSignup');
const cannotCreateUser = document.getElementById('cannotCreateUser');
const createdUser = document.getElementById('createdUser');
const bottomInstructions = document.querySelector('.bottomInstructions');
var signupErrorMessage = document.querySelector('.signupErrorMessage');


    btnSignup.addEventListener('click', e => {
        const email = emailSignup.value;
        const pass = passwordSignup.value;

        //creates a user AND signs in.
        auth.createUserWithEmailAndPassword(email, pass).then(newUser => {
            //create a new user in the database.
            db.collection('users').doc(auth.currentUser.uid).set({ id: auth.currentUser.uid });
            var instance = M.Modal.getInstance(createdUser);
            instance.open();

        }).catch(error => {
            var instance = M.Modal.getInstance(cannotCreateUser);
            signupErrorMessage.innerHTML = error.message;
            instance.open();
            return;
        });
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


document.addEventListener('DOMContentLoaded', function () {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
});