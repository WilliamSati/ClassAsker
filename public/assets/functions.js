var questionList = document.querySelector('.questions');
var classList = document.querySelector('.classes');

const loggedOutTags = document.querySelectorAll('.loggedOutTag');
const loggedInTags = document.querySelectorAll('.loggedInTag');
const memberTags = document.querySelectorAll('.memberTag');
const creatorTags = document.querySelectorAll('.creatorTag');

const manageTags = (firebaseUser) => {
    if (firebaseUser) {
        loggedInTags.forEach(item => item.style.display = 'block');
        loggedOutTags.forEach(item => item.style.display = 'none');
    } else {
        loggedInTags.forEach(item => item.style.display = 'none');
        loggedOutTags.forEach(item => item.style.display = 'block');
    }
}

const manageCreatorMember = () => {
    var currentClass = sessionStorage.getItem("currentClass");
    if (auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).collection('joinedClasses').doc(currentClass).get().then(thisClass => {
            if (thisClass.data().owner) {
                creatorTags.forEach(item => item.style.display = 'block');
                memberTags.forEach(item => item.style.display = 'none');
            } else {
                creatorTags.forEach(item => item.style.display = 'none');
                memberTags.forEach(item => item.style.display = 'block');
            }
                
        });
    } else {
        ;//do nothing
    }
}


const manageQuestionUI = (firebaseUser) => {
    var currentClass = sessionStorage.getItem("currentClass");

    if (firebaseUser && currentClass) {
        db.collection('classes').doc(currentClass).collection('questions').orderBy('hits', 'desc').get().then((snapshot) => {
            setupQuestions(snapshot.docs);//note that snapshot does not include the trackerDoc.
            setGoodLostButtons();
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


