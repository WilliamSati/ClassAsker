var questionList = document.querySelector('.questions');
var classList = document.querySelector('.classes');

const loggedOutTags = document.querySelectorAll('.loggedOutTag');
const loggedInTags = document.querySelectorAll('.loggedInTag');

const manageTags = (firebaseUser) => {
    if (firebaseUser) {
        loggedInTags.forEach(item => item.style.display = 'block');
        loggedOutTags.forEach(item => item.style.display = 'none');
    } else {
        loggedInTags.forEach(item => item.style.display = 'none');
        loggedOutTags.forEach(item => item.style.display = 'block');
    }
}

const manageQuestionUI = (firebaseUser) => {
    var currentClass = sessionStorage.getItem("currentClass");

    if (firebaseUser && currentClass) {
        db.collection('classes').doc(currentClass).collection('questions').orderBy('hits', 'desc').get().then((snapshot) => {
            setupQuestions(snapshot.docs);//note that snapshot does not include the trackerDoc.
        }).catch(error => {
            console.log('failed to get the currentClass', error);
        });
    } else {
        questionList.innerHTML = '';
    }
}

const manageClassesUI = (firebaseUser) => {
    if (firebaseUser) {
        db.collection('users').doc(auth.currentUser.uid).collection('joinedClasses').get().then((snapshot) => {
            setupClasses(snapshot.docs);
        })
    } else {
        classList.innerHTML = '';
    }
}


