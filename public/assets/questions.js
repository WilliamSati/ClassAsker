const btnQuestionSubmit = document.getElementById('btnQuestionSubmit');
const questionInput = document.getElementById('questionInput');
var pageTitle = document.querySelector('.title');
var btnGood = document.getElementById('btnGood');
var btnLost = document.getElementById('btnLost');



var pieChart = new Chart(document.getElementById("pie-chart"), {
    type: 'pie',
    data: {
        labels: ["Students following", "Students lost"],
        datasets: [{
            backgroundColor: ["#4caf50", "#f44336"],
            data: [0, 0]
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            labels: {
                fontColor: 'black'
            }
        }
    }
});

//get data
auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        console.log(firebaseUser);
    } else {
        console.log('not logged in');
    }
    manageQuestionUI(firebaseUser);
    manageTags(firebaseUser);
    manageCreatorMemberTags(firebaseUser);
});

//called when you click on a list item. The questionID is embeded in the html when the list item 
//is created and is what is passed into this function as an argument.
const incrementHits = (questionID) => {
    var currentClass = sessionStorage.getItem("currentClass");

    //retrieve the question that was clicked
    db.collection('classes').doc(currentClass).collection('questions').doc(questionID).get().then(doc => {
        var docData = doc.data();
        var newhits = docData.hits;
        var FieldValue = firebase.firestore.FieldValue;

        if (docData.creator === auth.currentUser.uid) {//don't allow the creator to vote on his own question
            return;
        }


        var hasVoted = false; 
        var voters = docData.upvoters;
        var currentID = auth.currentUser.uid;

        for (var i = 0; i < voters.length; i++) { //go through all the people that upvoted the question and check if they're one of them
            if (currentID === voters[i]) {
                hasVoted = true;//if they are, remember that.
            }
        }

        if (hasVoted) {//if you already voted and you clicked on a question, that means you want to take away your vote.
            newhits -= 1;

            db.collection('classes').doc(currentClass).collection('questions').doc(doc.id).update({
                hits: newhits,
                upvoters: FieldValue.arrayRemove(auth.currentUser.uid)
            }).then(() => {
                //the user interface will refresh when it detects that the questions will have changed.
            }).catch(error => {
                console.log('did not work. If resolving a question, this is expected', error);
            });

        } else {//if you didn't already vote, that means you want to add your vote to the total
            newhits += 1;

            db.collection('classes').doc(currentClass).collection('questions').doc(doc.id).update({
                hits: newhits,
                upvoters: FieldValue.arrayUnion(auth.currentUser.uid)
            }).then(() => {
                //the user interface will refresh when it detects that the questions will have changed.
            }).catch(error => {
                console.log('did not work. If resolving a question, this is expected', error);
            });
        }

    }).catch(error => {
        console.log('Could not get the question document', error);
    });
}
    
// gets called when the post button is pressed to submit a question.
btnQuestionSubmit.addEventListener('click', e => {
    var currentClass = sessionStorage.getItem("currentClass");

    //There might be a possibility that before the callback function catches the fact that the class has been deleted, the user has time to click on
    //the create class button. To prevent this, we are going to make sure that the class you are adding a question to still exists.
    db.collection('classes').doc(currentClass).get().then(theClass => {
        if (!theClass.exists) {
           return goToMyClasses();
        }
    });

        //add a new document with the question asked by the user.
    db.collection('classes').doc(currentClass).collection('questions').add({
        hits: 0,
        question: questionInput.value,
        creator: auth.currentUser.uid,
        upvoters: [] //will hold an array of the people that upvoted the question
        }).then(() => {

        //the user interface will refresh when it detects that the questions will have changed.

            //done!
            console.log("finished creating new cloud object!");

            //reset the text input to be blank
            $('#questionInput').val('');
        }).catch(error => {
            //in case the inner promise fails after adding 
            console.log('Error adding the document', error);
        });
});

//enable the pop up once when the content is loaded.
document.addEventListener('DOMContentLoaded', function () {
    var currentClass = sessionStorage.getItem("currentClass");

    //initialize the modals and the tool tips
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
    var elemsToolTips = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(elemsToolTips);

    //realtime listener, is called whenever any part of the questions collection has changed
    var currentClassQuestions = db.collection('classes').doc(currentClass).collection('questions');
    currentClassQuestions.onSnapshot(docSnapshot => {
        console.log(`Received doc snapshot: ${docSnapshot}`);
        manageQuestionUI(1);
    }, err => {
        console.log(`Encountered error: ${err}`);
    });

    //this realtime listener is called whenever the class document has been changed, 
    var classDoc = db.collection('classes').doc(currentClass);

    //initialize the pie chart 
    classDoc.get().then(theClass => {
        if (theClass.data().creator === auth.currentUser.uid) {
            var newFollowing = theClass.data().following;
            var newMembers = theClass.data().members;
            var newLost = newMembers - newFollowing;

            pieChart.data.datasets[0].data[0] = newFollowing;
            pieChart.data.datasets[0].data[1] = newLost;
        }
    });

    //whenever the class information is changed, call this function
    classDoc.onSnapshot(snapshot => {
        console.log('class has been changed');
       
        classDoc.get().then(theClass => {
            //if the class has been deleted, go back to the myClasses section
            if (!theClass.exists) { 
                goToMyClasses();
            }
            //if the user is the professor,display the pie chart.
            if (theClass.data().creator === auth.currentUser.uid) {
                var newFollowing = theClass.data().following;
                var newMembers = theClass.data().members;
                var newLost = newMembers - newFollowing;

                pieChart.data.datasets[0].data[0] = newFollowing;
                pieChart.data.datasets[0].data[1] = newLost;

                pieChart.update();
            }
        });
    });

//the state of the user was saved regarding whether he understood or didn't understand the class. 
    //now let's update the buttons to reflect the user's saved state.
    setGoodLostButtons();

});

const setGoodLostButtons = () => {
    var currentClass = sessionStorage.getItem("currentClass");

    if (auth.currentUser == null) {
        //doNothing
        console.log('the user was null');
    } else {
        db.collection('users').doc(auth.currentUser.uid).collection('joinedClasses').doc(currentClass).get().then(userCurrentClass => {

            if (userCurrentClass.data().following) {
                //update the button styles to reflect the fact that you're following along
                btnGood.classList.remove('grey', 'z-depth-0'); //if they don't exist then the function WON'T throw an error
                btnLost.classList.remove('red', 'darken-2')
                btnLost.classList.add('grey', 'z-depth-0'); //will not add a class twice if it already exists
            } else {
                //update the button styles to reflect the fact that you're lost
                btnGood.classList.add('grey', 'z-depth-0'); //will not add a class twice if it already exists
                btnLost.classList.add('red', 'darken-2');
                btnLost.classList.remove('grey', 'z-depth-0'); //if they don't exist then the function WON'T throw an error
            }
        });
    }
}

const goToMyClasses = () => {
    alert("Sorry, the class Creator has just deleted the class");
    window.location.href = "https://classroom-helper-8cf0c.web.app/myClasses";
}

//sets up every question in a class in the User interface. questionsArray is an array of every question in the class.
const setupQuestions = (questionsArray) => {
    var currentClass = sessionStorage.getItem("currentClass");
    pageTitle.innerHTML = `<h3>${currentClass}</h3>`;//set the black class name to the current class, ex CalcIII

    let html = '';
    var title = `<li class="collection-header"><h4>Questions</h4></li>`;

    html += title;

    db.collection('classes').doc(currentClass).get().then(thisClass => {
        var classData = thisClass.data();
        var classCreator = classData.creator;


        //for every question in the class, add an item to the unordered list in the html file.
        for (var i = 0; i < questionsArray.length; i++) {
            var doc = questionsArray[i];

            const questionData = doc.data();

            //if it's not the tracker, get the hits on the question to know the number to display
            var newhtml = ``;
            //setup the question list item

            //if the user is the creator of the class
            if (classCreator == auth.currentUser.uid) {
                //if the user is the creator of the question and the creator of the class
                if (questionData.creator === auth.currentUser.uid) {
                    newhtml = `
                        <li class="collection-item row">
					        <div class="col s9">
						        <a href="#" class="collection-item row" onclick="incrementHits('${doc.id}')">

							        <span class="col s8 black-text">
                                        ${questionData.question}	
                                    </span>

							        <span class="col s1 right">
								        <span class="blue-text valign-wrapper">
									         ${questionData.hits}
										        <i class="material-icons">
											        arrow_upward
										        </i>
								        </span>
							        </span>

						        </a>
					        </div>
					        <div class="col s2">
						        <button class="btn right" onclick="resolveQuestion('${doc.id}')">Resolve</button>
					        </div>
                            <div class="col s1" >
                                <i class="material-icons red-text tooltipped" onclick="resolveQuestion('${doc.id}')" data-position="top" data-tooltip="flag as inapropriate and remove">
                                  flag
				            	</i>
				             </div>
					    </li>
                 `;
                    //if the user is NOT the creator of the question but is still the creator of the class:
                } else {
                    newhtml = `
                        <li class="collection-item row">
					        <div class="col s11">
						        <a href="#" class="collection-item row" onclick="incrementHits('${doc.id}')">

							        <span class="col s10 black-text">
                                        ${questionData.question}	
                                    </span>

							        <span class="col s1 right">
								        <span class="blue-text valign-wrapper">
									         ${questionData.hits}
										        <i class="material-icons">
											        arrow_upward
										        </i>
								        </span>
							        </span>

						        </a>
					        </div>
                            <div class="col s1" >
                                <i class="material-icons red-text tooltipped" onclick="resolveQuestion('${doc.id}')" data-position="top" data-tooltip="flag as inappropriate and remove">
                                  flag
				            	</i>
				             </div>
					    </li>
                    `;
                }

            //if the user is not the creator of the class:
            } else { 

                //if the user is the creator of the question but not the creator of a class
                if (questionData.creator === auth.currentUser.uid) {
                    newhtml = `
                        <li class="collection-item row">
					        <div class="col s10">
						        <a href="#" class="collection-item row" onclick="incrementHits('${doc.id}')">

							        <span class="col s9 black-text">
                                        ${questionData.question}	
                                    </span>

							        <span class="col s1 right">
								        <span class="blue-text valign-wrapper">
									         ${questionData.hits}
										        <i class="material-icons">
											        arrow_upward
										        </i>
								        </span>
							        </span>

						        </a>
					        </div>
					        <div class="col s2">
						        <button class="btn right" onclick="resolveQuestion('${doc.id}')">Resolve</button>
					        </div>
					    </li>
                 `;
                //if the user is not the creator of the class or the question:
                } else {
                    newhtml = `
                    <li class="collection-item row">
					    <div class="col s12">
						    <a href="#" class="collection-item row" onclick="incrementHits('${doc.id}')">

							    <span class="col s11 black-text">
                                    ${questionData.question}	
                                </span>

							    <span class="col s1 right">
								    <span class="blue-text valign-wrapper">
									     ${questionData.hits}
										    <i class="material-icons">
											    arrow_upward
										    </i>
								    </span>
							    </span>
						    </a>
					    </div>
			        </li>
                    `;
                }
            }

            //add the newly crafted list item to the view template
            html += newhtml;
        };

        questionList.innerHTML = html; //questionList is created in functions.js

        //activate the new tool tipped elements
        var elemsToolTips = document.querySelectorAll('.tooltipped');
        M.Tooltip.init(elemsToolTips);

    });
}

//If a user created a question, they will see a button that says resolve that will allow them to call this function
const resolveQuestion = (questionID) => {
    var currentClass = sessionStorage.getItem("currentClass");

    db.collection('classes').doc(currentClass).collection('questions').doc(questionID).delete().then(() => {
        //the user interface will refresh when it detects that the questions will have changed.
    });
}

//triggered if the user wants to indicate that they are following along. The user could already be following or not
btnGood.addEventListener('click', function () {
    var currentClass = sessionStorage.getItem("currentClass");

    //update the user's following status to true;
    db.collection('users').doc(auth.currentUser.uid).collection('joinedClasses').doc(currentClass).get().then(userCurrentClass => {
        if (userCurrentClass.data().following) {
            return;//there is nothing else to do if they are already following along
        } else {
            const increment = firebase.firestore.FieldValue.increment(1);

            //update the user's following status
            //update the user's following status
            db.collection('users').doc(auth.currentUser.uid).collection('joinedClasses').doc(currentClass).update({
                following: true
            });

            //update the total number of followers on the class document
            db.collection('classes').doc(currentClass).update({
                following: increment
            });
        }
    });

    //update the button styles
    btnGood.classList.remove('grey', 'z-depth-0'); //if they don't exist then the function WON'T throw an error
    btnLost.classList.remove('red', 'darken-2')
    btnLost.classList.add('grey', 'z-depth-0'); //will not add a class twice if it already exists

});

btnLost.addEventListener('click', function () {
    var currentClass = sessionStorage.getItem("currentClass");

    //update the user's following status to true;
    db.collection('users').doc(auth.currentUser.uid).collection('joinedClasses').doc(currentClass).get().then(userCurrentClass => {
        if (!userCurrentClass.data().following) {
            return;//there is nothing else to do if they are already not following
        } else {
            const decrement = firebase.firestore.FieldValue.increment(-1);

            //update the user's following status
            db.collection('users').doc(auth.currentUser.uid).collection('joinedClasses').doc(currentClass).update({
                following: false
            });

            //update the total number of followers on the class document
            db.collection('classes').doc(currentClass).update({
                following: decrement
            });
        }
    });

    //update the button styles
    btnGood.classList.add('grey', 'z-depth-0'); //will not add a class twice if it already exists
    btnLost.classList.add('red', 'darken-2');
    btnLost.classList.remove('grey', 'z-depth-0'); //if they don't exist then the function WON'T throw an error
});
