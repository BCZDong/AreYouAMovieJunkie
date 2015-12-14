var QUESTION_COUNT = 10;
var questionIndex = 1;
var questionHeading;
var category, difficulty, score;
var clues;
var answer;
var modalBody;
var isDifficultyShowing = true;
var timer;
var quizContainer;
var clueCount;
var autoFinishFlag = false;
var ids = [];
var isChallenged;
var isGivenUp = false;

$(document).ready(function() {
    console.log("Document ready");

    //load leaderboard table
    $(".modal").on("show.bs.modal", onModalShown);

    //attach category selection call back
    $(".modal-body").each(function() {
        $(this).find(".difficulty-button").click(onDifficultySelectClick);
        $(this).find(".back-to-category-button").click(onBackToCategoryClick);
    });
});

//Called when difficulty is selected
var onDifficultySelectClick = function() {
    //var button = $(this).parent().siblings(".back-to-category-button");
    modalBody = $(this).parents(".modal-body");
    quizContainer = modalBody.children(".quiz-container");
    difficulty = $(this).data("difficulty");
    category = modalBody.data("category");

    console.log("Category: " + category + "\tDifficulty: " + difficulty);

    //hide difficulty selection buttons and image
    $(this).parent().siblings().children(".difficulty-button").hide();
    $(this).hide();
    quizContainer.children(".quiz-image").hide();

    isDifficultyShowing = false;
    
    getQuestions();
};

var onBackToCategoryClick = function() {
    clearTimeout(timer);
    if (!isDifficultyShowing) {
        clearTimeout(timer);
        autoFinishFlag = false;
        isGivenUp = false;
        ids = [];
        clueCount = 0;
        questionIndex = 1;
        isDifficultyShowing = true;
        modalBody.find(".difficulty-button").show();
        quizContainer.children().not(".quiz-image").remove();
        quizContainer.children(".quiz-image").show();
        modalBody.find(".question-score-text").html(100);
        modalBody.find(".game-score-text").html(0);

        quizContainer = {};
        isChallenged = false;
        modalBody = {};
var isGivenUp = false;
    }
}

//Called when quiz category is selected
// var onCategorySelectClick = function() {
//     category = $(this).data("category");
//     console.log(category);

//     //remove categories and show difficulty selection
//     $(".quiz-container").empty();
//     loadDifficultySelectionView();
// };

//AJAX method to retrieve question
var getQuestions = function() {
    console.log("Getting questions via AJAX");

    var id = '';
    if (isChallenged) {
        id = ids[questionIndex-1];
    }

    var request = $.ajax({
        url: "quiz/getQuestion",
        method: "POST",
        data: {
            category: category,
            isChallenged: isChallenged,
            id: id
        },
        dataType: "json" //response type
    });
     
    request.done(function(res) {
        if (($.inArray(res.id, ids) != -1) && !isChallenged) {
            getQuestions();
        } else {
            updateClues(res);
            setStartingScore();
            timer = setTimeout(decrementScore, 2000);
        }
    });
     
    request.fail(function(jqXHR, textStatus) {
        console.log("Error getting question");
    });
};

var setStartingScore = function () {
    var startingScore = difficulty == "0" ? 80 : 
                        difficulty == "1" ? 90 : 100;
    modalBody.find(".question-score-text").html(startingScore);
}

//Called to load a quesiton elements
var updateClues = function(res) {
    isGivenUp = false;
    clues = res;
    answer = clues.clue1;

    if (category < 39) {
        ids.push(clues.id);    
    } else {
        ids.push(answer);
    }
    
    console.log("Answer: " + answer);

    var heading = "<h3 class=question-heading >Question " +
                    questionIndex + " of 10" +
                    "</h3>";
    quizContainer.append(
        heading +
        "<table class=clue-table></table>");
    var clueTable = quizContainer.children(".clue-table");
    var clue1 = getConvertedTitle(clues.clue1);

    if (category < 5 || (category > 30 && category < 39)) {
        clueCount = 7;
        var img = "<img class=clue-image src=" + clues.clue7 + "></img>";

        clueTable.append(
            "<tr id=clue1><td class=clue-header><b>Clue 1:</b></td><td class=clue-content>" + clue1 + "</td></tr>"
        )
        .append(
            "<tr id=clue2><td class=clue-header><b>Clue 2:</b></td><td>" + clues.clue2.year + "/" + clues.clue2.genre + "</td></tr>"
        )
        .append(
            "<tr id=clue3><td class=clue-header><b>Clue 3:</b></td><td>" + "Directed by: " + clues.clue3 + "</td></tr>"
        )
        .append(
            "<tr id=clue4><td class=clue-header><b>Clue 4:</b></td><td>" + "Starring: " + clues.clue4 + "</td></tr>"
        )
        .append(
            "<tr id=clue5><td class=clue-header><b>Clue 5:</b></td><td>" + "Characters: " + clues.clue5 + "</td></tr>"
        )
        .append(
            "<tr id=clue6><td class=clue-header><b>Clue 6:</b></td><td>" + "Plot: " + clues.clue6 + "</td></tr>"
        )
        .append(
            "<tr id=clue7><td class=clue-header><b>Clue 7:</b></td><td>" + img + "</td></tr>"
        );

        //hide questions based on difficulty
        if (difficulty != "0") {
            clueCount = 4;
            $("#clue7").hide();
            $("#clue6").hide();
            $("#clue5").hide();
            if (difficulty == "2") {
                clueCount = 1;
                $("#clue4").hide();
                $("#clue3").hide();
                $("#clue2").hide();
            }
        }
    } else if (category < 31) {
        clueCount = 7;
        var img = "<img class=clue-image src=" + clues.clue7 + "></img>";

        clueTable.append(
            "<tr id=clue1><td class=clue-header><b>Clue 1:</b></td><td class=clue-content>" + clue1 + "</td></tr>"
        )
        .append(
            "<tr id=clue2><td class=clue-header><b>Clue 2:</b></td><td>" + clues.clue2.year + "/" + clues.clue2.genre + "</td></tr>"
        )
        .append(
            "<tr id=clue3><td class=clue-header><b>Clue 3:</b></td><td>" + "Directed by: " + clues.clue3 + "</td></tr>"
        )
        .append(
            "<tr id=clue4><td class=clue-header><b>Clue 4:</b></td><td>" + "Starring: " + clues.clue4 + "</td></tr>"
        )
        .append(
            "<tr id=clue5><td class=clue-header><b>Clue 5:</b></td><td>" + "Characters: " + clues.clue5 + "</td></tr>"
        )
        .append(
            "<tr id=clue6><td class=clue-header><b>Clue 6:</b></td><td>" + "Plot: " + clues.clue6 + "</td></tr>"
        )
        .append(
            "<tr id=clue7><td class=clue-header><b>Clue 7:</b></td><td>" + img + "</td></tr>"
        );

        //hide questions based on difficulty
        if (difficulty != "0") {
            clueCount = 4;
            $("#clue7").hide();
            $("#clue6").hide();
            $("#clue5").hide();
            if (difficulty == "2") {
                clueCount = 1;
                $("#clue4").hide();
                $("#clue3").hide();
                $("#clue2").hide();
            }
        }
    } else if (category == 39) {
        clueCount = 7;
        var img = "<img class=clue-image src=" + clues.clue7 + "></img>";

        clueTable.append(
            "<tr id=clue1><td class=clue-header><b>Clue 1:</b></td><td class=clue-content>" + clue1 + "</td></tr>"
        )
        .append(
            "<tr id=clue2><td class=clue-header><b>Clue 2:</b></td><td>" + "Role: " + clues.clue2 + "</td></tr>"
        )
        .append(
            "<tr id=clue3><td class=clue-header><b>Clue 3:</b></td><td>" + "Nominee: " + clues.clue3 + "</td></tr>"
        )
        .append(
            "<tr id=clue4><td class=clue-header><b>Clue 4:</b></td><td>" + "Category: " + clues.clue4 + "</td></tr>"
        )
        .append(
            "<tr id=clue5><td class=clue-header><b>Clue 5:</b></td><td>" + "Year of nomination: " + clues.clue5 + "</td></tr>"
        )
        .append(
            "<tr id=clue6><td class=clue-header><b>Clue 6:</b></td><td>" + "Won: " + clues.clue6 + "</td></tr>"
        )
        .append(
            "<tr id=clue7><td class=clue-header><b>Clue 7:</b></td><td>" + img + "</td></tr>"
        );

        //hide questions based on difficulty
        if (difficulty != "0") {
            clueCount = 4;
            $("#clue7").hide();
            $("#clue6").hide();
            $("#clue5").hide();
            $("#clue4").hide();
            if (difficulty == "2") {
                clueCount = 1;
                $("#clue3").hide();
                $("#clue2").hide();
            }
        }
    } else if (category == 40) {
        clueCount = 6;
        var img = "<img class=clue-image src=" + clues.clue6 + "></img>";

        clueTable.append(
            "<tr id=clue1><td class=clue-header><b>Clue 1:</b></td><td class=clue-content>" + clue1 + "</td></tr>"
        )
        .append(
            "<tr id=clue2><td class=clue-header><b>Clue 2:</b></td><td>" + "Hint: " + clues.clue2 + "</td></tr>"
        )
        .append(
            "<tr id=clue3><td class=clue-header><b>Clue 3:</b></td><td>" + "Category: " + clues.clue3 + "</td></tr>"
        )
        .append(
            "<tr id=clue4><td class=clue-header><b>Clue 4:</b></td><td>" + "Year of Nomination: " + clues.clue4 + "</td></tr>"
        )
        .append(
            "<tr id=clue5><td class=clue-header><b>Clue 5:</b></td><td>" + "Won: " + clues.clue5 + "</td></tr>"
        )
        .append(
            "<tr id=clue6><td class=clue-header><b>Clue 6:</b></td><td>" + img + "</td></tr>"
        );

        //hide questions based on difficulty
        if (difficulty != "0") {
            clueCount = 3;
            $("#clue6").hide();
            $("#clue5").hide();
            $("#clue4").hide();
            if (difficulty == "2") {
                clueCount = 1;
                $("#clue3").hide();
                $("#clue2").hide();
            }
        }
    }

    quizContainer.append(
        "<div class=buttons>\
            <div class=form-group>\
                <input type=text class=form-control id=guess-txt placeholder='Enter Guess'>\
            </div>\
            <div class=answer-status></div>\
            <button type=submit class='btn btn-success guess-button'>Guess</button>\
            <button class='btn reveal-button'>Reveal Another Clue</button>\
            <button class='btn giveup-button'>Give up!</button>\
        </div>\
    ");

    //attach button functions
    $(".guess-button").click(onGuessButtonClick);
    $(".giveup-button").click(onGiveupButtonClick);
    $(".reveal-button").click(onRevealButtonClick);
};

var onGuessButtonClick = function() {
    var guess = isGivenUp ? answer: modalBody.find("#guess-txt").val();
    var questionScoreDiv = modalBody.find(".question-score-text");
    var questionScore = Number(questionScoreDiv.text());
    var gameScoreDiv = modalBody.find(".game-score-text");
    var gameScore = Number(gameScoreDiv.text()) + questionScore;
    
    if (guess == answer) {
        console.log("Correct answer: " + guess);
        gameScoreDiv.html(gameScore);
        clearTimeout(timer);
        quizContainer.children().not(".quiz-image").remove();
        if (questionIndex == QUESTION_COUNT) {
            loadQuizCompletedView();
            sendScore(gameScore);
        } else {
            questionIndex++;
            getQuestions();
        }
    } else {
        console.log("Incorrect answer: " + guess);
        modalBody.find(".answer-status").html("Incorrect answer. Please try again");
        if (questionScore > 40) {
            questionScoreDiv.html(questionScore-10);
        }
    }
}

var sendScore = function(score) {
    console.log("Submitting user score via AJAX");

    var request = $.ajax({
        url: "quiz/updateScore",
        method: "POST",
        data: {
            category: category,
            score: score,
            fid: fid
        },
        dataType: "json" //response type
    });
     
    request.done(function(res) {
        console.log(res);
    });
     
    request.fail(function(jqXHR, textStatus) {
        console.log("Error updating user score");
    });
}

var decrementScore = function() {
    var gameScoreContainer = modalBody.children(".gamescore-container");
    var gameScoreDiv = gameScoreContainer.children(".question-score").children("div");
    var score = gameScoreDiv.text();
    
    if (score > 30) {
        gameScoreDiv.html(score-1);
        timer = setTimeout(decrementScore, 2000);
    }
}

var getConvertedTitle = function(clue) {
    var ret = "";
    var start = true;
    for (i = 0; i < clue.length; i++) {
        if (clue.charAt(i) == " ") {
            ret = ret + "  ";
            start = true;
        } else {
            if (start) {
                ret = ret + clue.charAt(i);
            } else {
                ret = ret + "_"
            }
            start = false;
        }
    }
    return ret;
}

var onRevealButtonClick = function() {
    //console.log("reveal");
    var questionScoreDiv = modalBody.find(".question-score-text");
    var questionScore = Number(questionScoreDiv.text());

    if (category < 39) {
        if (clueCount != 7) {
            clueCount++;
            $("#clue" + clueCount).show();
            if (!isGivenUp && questionScore > 40) {
                questionScoreDiv.html(questionScore-10);
            }
        }
    } else if (category == 39) {
        if (clueCount != 7) {
            clueCount++;
            $("#clue" + clueCount).show();
            if (!isGivenUp && questionScore > 40) {
                questionScoreDiv.html(questionScore-10);
            }
        }
    } else if (category == 40) {
        if (clueCount != 6) {
            clueCount++;
            $("#clue" + clueCount).show();
            if (!isGivenUp && questionScore > 40) {
                questionScoreDiv.html(questionScore-10);
            }
        }
    }
}

var onGiveupButtonClick = function() {
    console.log("give up");
    isGivenUp = true;
    clearTimeout(timer);
    $("#clue1").children(".clue-content").html(answer);

    modalBody.find(".question-score-text").text(0);
    
    $(".giveup-button").html("Next Question").click(onGuessButtonClick);
}

// var onNextQuestionButtonClick = function() {
//     quizContainer.children().not(".quiz-image").remove();
//     questionIndex++;
//     getQuestions();
// }

var onModalShown = function() {
    //console.log("Loading leaderboard");
    currentModal = $(this);
    category = currentModal.find(".modal-body").data("category");
    getLeaderboard();

    //challenge logic
    var challengeButton = currentModal.find(".accept-challenge-button");
    isChallenged = challengeButton.data("challenged");
    //console.log(isChallenged);
    
    ids = challengeButton.data("ids");
    //console.log(ids);

    if (isChallenged) {
        ids = challengeButton.data("ids");
        challengeButton.click(onDifficultySelectClick);
    } else {
        challengeButton.parent().hide();
    }
}

var getLeaderboard = function() {
    console.log("Getting leaderboard via AJAX");

    var friendIds = [];
    //TODO remove
    if (friends != null) {
        for (i = 0; i < friends.length; i++) {
            friendIds.push(friends[i].id);
        }
    }

    var request = $.ajax({
        url: "quiz/getLeaderboard",
        method: "POST",
        data: {
            category: category,
            fid: fid,
            friends: friendIds
        },
        dataType: "json" //response type
    });
     
    request.done(function(res) {
        console.log(res.msg);
        updateLeaderboard(res);
    });
     
    request.fail(function(jqXHR, textStatus) {
        console.log("Error getting leaderboard");
    });
}

var updateLeaderboard = function(res) {
    var globalTable = currentModal.find(".global-highscore").children(".leaderboard-table")
                      .children().children();
    var friendTable = currentModal.find(".friend-highscore").children(".leaderboard-table")
                      .children().children();

    globalTable.each(function(index) {
        if (index != 0) {
            $(this).children(".score-cell").html(res.global[index-1].score);
            $(this).children(".name-cell").html(res.global[index-1].name);
        } 
    });
    
    friendTable.each(function(index) {
        if (index != 0) {
            $(this).children(".score-cell").html(res.friends[index-1].score);
            $(this).children(".name-cell").html(res.friends[index-1].name);
        } 
    });
}

var loadQuizCompletedView = function() {
    var list = "";

    for (i = 0; i < friends.length; i++) {
        list = list + "<li class=friend-list-item data-fid=" + friends[i].id + "><a>" + friends[i].name + "</a></li>"
    }

    quizContainer.append(
        "<h2>Hope you had fun with the quiz!</h2>\
        <div class='dropdown challenge-container'>\
            <button class='btn btn-success challenge-button' id=dLabel type=button data-toggle=dropdown aria-haspopup=true aria-expanded=false>\
            Challenge a friend\
                <span class=caret></span>\
            </button>\
            <ul class='dropdown-menu friends-drop-down' aria-labelledby=dLabel>"
                + list +   
            "</ul>\
        </div>"
    );

    if (category < 39) {
        $(".friend-list-item").click(onFriendChallengeClick);
    } else {
        $(".challenge-container").remove();
    }
}

var onFriendChallengeClick = function() {
    sendChallenge($(this).data("fid"));
}

var sendChallenge = function(friendId) {
    //console.log(friendId)
    console.log("Sending challenge via AJAX");

    var data = {
        user: fid,
        friend: friendId,
        quiz: category,
        level: difficulty,
        ids: ids
    }

    var request = $.ajax({
        url: "quiz/challenge",
        method: "POST",
        data: data,
        dataType: "json" //response type
    });
     
    request.done(function(res) {
        console.log(res.msg);
        quizContainer.append("<div>Challenge sent!</div>");
    });
     
    request.fail(function(jqXHR, textStatus) {
        console.log("Error sending challenge");
    });

}

var autoFinish = function() {
    modalBody.find("#guess-txt").val(answer);
    onGuessButtonClick();
    
    if (!autoFinishFlag) {
        setTimeout(autoFinish, 1500);
    }
    
    if (questionIndex == QUESTION_COUNT) {
        autoFinishFlag = true;
    }
}