const classInput = document.getElementById('classInput');
const joinClassInput = document.getElementById('joinClassInput');
const documentDoesNotExist = document.getElementById('classDoesNotExitPopUp');
const bottomInstructions = document.querySelector('.bottomInstructions');

//realtime listener
auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        console.log(firebaseUser);

    } else {
        console.log('not logged in');
    }
    manageTags(firebaseUser);
    manageClassesUI(firebaseUser);
});

//enable the pop up once when the content is loaded.
document.addEventListener('DOMContentLoaded', function () {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    var elemsToolTips = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(elemsToolTips);
});

//create a class
btnClassSubmit.addEventListener('click', e => {
    const classInputed = classInput.value;

    db.collection('classes').get().then(snapshot => {
        existingClasses = snapshot.docs;


        var classExists = false;
        for (var i = 0; i < existingClasses.length; i++) {
            var classData = existingClasses[i].data();
            if (classData.name === classInputed) {
                classExists = true;//continue to join the class
            }
        }
        if (classExists) {
            console.log('the class ', classInputed, 'already exists');
            var instance = M.Modal.getInstance(documentAlreadyExists);
            instance.open();
            return;
        }

        db.collection('classes').doc(classInputed).set({
            name: classInputed,
            creator: auth.currentUser.uid
        }).then(() => {
            joinClass(classInputed, true);
        });
    });
});

btnJoinClassSubmit.addEventListener('click', e => {
    const classInputed = joinClassInput.value;
    joinClass(classInputed, false);
});

const joinClass = (classInputed, isOwner) => {

    db.collection('classes').get().then(snapshot => {
        var existingClasses = snapshot.docs;


        var classExists = false;
        for (var i = 0; i < existingClasses.length; i++) {
            var classData = existingClasses[i].data();
            if (classData.name === classInputed) {
                classExists = true;//continue to join the class
            }
        }

        if (!classExists) {
            console.log('the class ', classInputed, ' does not exist');
            var instance = M.Modal.getInstance(documentDoesNotExist);
            instance.open();
            return;
        }

        db.collection('users').doc(auth.currentUser.uid).collection('joinedClasses').doc(classInputed).set({
            name: classInputed,
            owner: isOwner
        }).then(() => {
            manageClassesUI(1);//done adding the class to the user's list of joined classes.
        }).catch(error => {
            console.log(error);
        });
    });
}

const goToClass = (classID) => {

    db.collection('classes').doc(classID).get().then(doc => {
        if (!doc.exists) {
            var instance = M.Modal.getInstance(classNoLongerExists);
            instance.open();
        } else{
            sessionStorage.setItem("currentClass", classID);
            window.location.href = "https://classroom-helper-8cf0c.web.app/questions";
        }
    });
}

//data is the user's classes that they have joined.
const setupClasses = (data) => {
    let html = '';
    var title = `<li class="collection-header"><h4>My Classes</h4></li>`;

    html += title;
    
    for (var i = 0; i < data.length; i++) {
        var doc = data[i];
        const classData = doc.data();
        //if it's not the tracker, get the hits on the question to know the number to display
        var newhtml = ``;

        if (classData.owner == true) {
            //setup the Class list items
            newhtml = `
                <li class="collection-item row">
					<div class="col s8 black-text">
						<h5>${classData.name}</h5>
					</div>
                    <span class="col s2">
						<a href="#" class="btn red" onclick="deleteClass('${classData.name}')">Delete</a>
					</span>
					<span class="col s2">
						<a href="#" class="btn" onclick="goToClass('${classData.name}')">Go to Class</a>
					</span>
				</li>
            `;
        } else {
            //setup the Class list items
            newhtml = `
                <li class="collection-item row">
					<div class="col s8 black-text">
						<h5>${classData.name}</h5>
					</div>
                    <span class="col s2">
						<a href="#" class="btn" onclick="removeClass('${classData.name}')">Remove</a>
					</span>
					<span class="col s2">
						<a href="#" class="btn" onclick="goToClass('${classData.name}')">Go to Class</a>
					</span>
				</li>
            `;
        }
        //add the newly crafted list item to the view template
        html += newhtml;
    }

    if (data.length === 0) {
        bottomInstructions.innerHTML = `You don't have any classes yet. To create your own class, click the red + button at the top. To join an existing class, click the blue merge button`;
    } else {
        bottomInstructions.innerHTML = ``;
    };

    classList.innerHTML = html;
}

const deleteClass = (docID) => {
    db.collection('classes').doc(docID).get().then(doc => {

        var classData = doc.data();

        if (classData.creator == auth.currentUser.uid) {
            removeClass(classData.name);
        } else {
            console.log('you cant delete this class since you didnt create it');
            return;
        }
    }).then(() => {

        db.collection('classes').doc(docID).collection('questions').get().then(questionsArray => {
            //check if there are any questions
            //if there aren't don't continue.
            if (questionsArray == null) {
                return;
            }

            //start by deleting all of the questions in the class
            questionsArray.forEach(question => {
                db.collection('classes').doc(docID).collection("questions").doc(question.id).delete().then(deletedDoc => {
                    //restart the loop
                }).catch(error => {
                    console.log('failed to delete question with id', question.id, 'here is the official error:', error);
                });
            });

            //then delete the class
            db.collection('classes').doc(docID).delete().then(deletedDoc => {
                //we are done deleting, now update the UI
                manageClassesUI(1);
            }).catch(error => {
                console.log('failed to delete class with id', docID, 'here is the official error:', error);
            });


            //now you are done and no data is leaked (I think)
        });
    });
}
const removeClass = (classID) => {
    db.collection('users').doc(auth.currentUser.uid).collection('joinedClasses').doc(classID).delete().then(() => {
        console.log('deleted user class', classID);//done
        manageClassesUI(1);
    }).catch(error => {
        console.log('could not remove document from user list', error);
    });
}
