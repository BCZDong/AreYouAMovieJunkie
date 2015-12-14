var fid, fName;
var friends;

function statusChangeCallback(response) {
  //console.log('statusChangeCallback');
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    getFId();
    getFriends();
  } 

  // else if (response.status === 'not_authorized') {
  //   // The person is logged into Facebook, but not your app.
  //   document.getElementById('status').innerHTML = 'Please log ' +
  //     'into this app.';
  // } else {
  //   // The person is not logged into Facebook, so we're not sure if
  //   // they are logged into this app or not.
  //   document.getElementById('status').innerHTML = 'Please log ' +
  //     'into Facebook.';
  // }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

window.fbAsyncInit = function() {
  FB.init({
    appId      : '906829369424687',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.5' // use version 2.2
  });

  // Now that we've initialized the JavaScript SDK, we call 
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.

  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function getFId() {
  FB.api('/me', function(response) {
    console.log('Successful Facebook login for: ' + response.name);
    fid = response.id;
    fName = response.name;
    loadLoggedInView();
  });
}

var logout = function () {
  FB.logout(function(response) {
      // Person is now logged out
      console.log("Logged out of Facebook");
      loadLoggedOutView();
  });
}

function getFriends() {
  // FB.api('/me?fields=id,name,email', function(response) {
  //   console.log(response);
  // });

  FB.api(
  "/me/friends",
  function (response) {
    if (response && !response.error) {
      //console.log(response.data[0]);
      friends = response.data;
      syncUserWithDB();
    }
  });
}

var syncUserWithDB = function () {
  console.log("Syncing user with database");

    var request = $.ajax({
        url: "quiz/loginUser",
        method: "POST",
        data: {
            fid: fid,
            name: fName,
            friends: friends
        },
        dataType: "json" //response type
    });
     
    request.done(function(res) {
        console.log(res.msg);
        loadChallengesView(res.challenge);
    });
     
    request.fail(function(jqXHR, textStatus) {
        console.log("Error syncing user with database");
    });
}

var loadChallengesView = function(challenge) {
  //console.log(challenge);
  if (!$.isEmptyObject(challenge)) {
      var mod = $(".modal-body[data-category='" + challenge.category + "']");
      var val = mod.find("h2").text();
      var level = challenge.difficulty;
      var str = level == 0 ? "Easy" :
                level == 1 ? "Challenging" : "Genius";
      $(".challenge-div").html(challenge.name + " has challenged you to play the " + 
                                "'" + val + "' " + "quiz on " +
                                str + " difficulty");

      var btn = mod.find(".accept-challenge-button");
      btn.data("challenged", true);
      btn.data("difficulty", level);
      //console.log(challenge.tmdbIds);
      btn.data("ids", challenge.tmdbIds);
  }
}

var loadLoggedInView = function() {
  $(".status-div").html("Logged in as " + fName);
  $("#fb-login-button").hide();
  $("#fb-logout-button").show().click(logout);
}

var loadLoggedOutView = function() {
  $(".status-div").html(" ");
  $(".challenge-div").html(" ")
  $("#fb-login-button").show();
  $("#fb-logout-button").hide().unbind();
}