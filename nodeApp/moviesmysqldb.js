var mysql      = require('mysql');
var credentials = require('../../credentials');
var Bing = require('node-bing-api')({ accKey: credentials.bingInfo.accKey });
var categories = require('./categories');
var async = require('async');

var connection = mysql.createConnection({
	host     : credentials.mySqlInfo.host,
	user     : credentials.mySqlInfo.user,
	password : credentials.mySqlInfo.password,
	database : credentials.mySqlInfo.database,
	supportBigNumbers: true
});

connection.connect(function(err){
	if(!err) {
		console.log("MySQL database is connected ... \n\n");
	} else {
		console.log("Error connecting database ... \n\n");
	}
});

connection.getTopMovies = function (category, isChallenged, id, Fcallback) {
	var finished = false;
	var clues = {};
	var tmdb_id, rel_date, role, title, year, starring, actor, use, image;
	var arr = [50, 601, 1108, 2058];

	use = arr[category-1];
	var bid;

	async.series([
		function(callback) {
			if (isChallenged) {
				tmdbid = id;
				connection.query('SELECT * FROM `MOVIES` WHERE TMDB_ID = '+tmdbid+' ORDER BY RAND() LIMIT 0,1;', function(err, rows, fields) {
					if (!err) {
						bid = tmdbid;
						rel_date = rows[0].RELEASE_DATE;
			    		title = rows[0].TITLE;
			    		image = rows[0].IMAGE;
			    		year = rel_date.split("/");
			    		// console.log(title);
			    		// console.log(image);
			    		// console.log(rel_date);
			    		clues.clue1 = title;
			    		clues.clue7 = image;
			    		clues.id = tmdbid;
			    		callback();
					} else {
						console.log('Error while performing Query.');
						callback();
					}
				});
			} else {
				use = arr[category-1];
				connection.query('SELECT * FROM `MOVIES` WHERE VOTES > '+use+' ORDER BY RAND() LIMIT 0,1;', function(err, rows, fields) {
					if (!err) {
						tmdb_id = rows[0].TMDB_ID;
						rel_date = rows[0].RELEASE_DATE;
						image = rows[0].IMAGE;
						title = rows[0].TITLE;
						year = rel_date.split("/");
						console.log('#Clue 1: Title:', title);
						bid = tmdb_id;
						clues.id = bid;
						clues.clue1 = title;
			    		clues.clue7 = image;
			    		callback();
					} else {
						console.log('Error while performing Query.');
						callback();
					}
				});
			}
		},
		function(callback) {
			console.log(clues);
			//console.log(bid);
			connection.query('SELECT MG.TMDB_ID, GROUP_CONCAT(DISTINCT GENRE_NAME) AS GENRE, GROUP_CONCAT(DISTINCT CHAR_NAME) AS CHAR_NAME, GROUP_CONCAT(DISTINCT ACTORS.NAME) AS ACTORS, GROUP_CONCAT(DISTINCT DIRECTORS.NAME) AS DIRECTOR, OVERVIEW FROM `MOVIES_GENRES` MG INNER JOIN `ROLES` R ON MG.TMDB_ID = R.TMDB_ID INNER JOIN `OVERVIEW` O ON MG.TMDB_ID = O.TMDB_ID, `DIRECTORS`, `ACTORS` WHERE MG.TMDB_ID = '+bid+' AND DIRECTORS.DID IN (SELECT DID FROM `DIRECTS` WHERE TMDB_ID = '+bid+') AND ACTORS.AID IN (SELECT AID FROM `ROLES` WHERE TMDB_ID = '+bid+');', function(err, rows, fields) {
				if (!err) {
					console.log(rows);
					var genreName = rows[0].GENRE.split("\r,");
					var directorName = rows[0].DIRECTOR.split("\r,");
					starring = rows[0].ACTORS.split("\r,");
					var famousCharacterName = rows[0].CHAR_NAME.split("\r,");
					var overview = rows[0].OVERVIEW;
					console.log('#Clue 2: year/genre: ', year[2], genreName);
					console.log('#Clue 3: Directed by: ', directorName);
					console.log('#Clue 4: Starring: ', starring);
					console.log('#Clue 5: Characters: ', famousCharacterName);
					console.log('#Clue 6: Plot: ', overview);
					//console.log('#Clue 7: Image: ', image);
					clues.clue2 = {
							year: year[2],
							genre: genreName
					};
					clues.clue3 = directorName;
					clues.clue4 = starring;	
					clues.clue5 = famousCharacterName;
					clues.clue6 = overview;
					callback();
				} else {
					console.log('Error while performing Query.');
					callback();
				}
			});
		}
	],
	function(err) {
		Fcallback(clues);
	});
}

connection.getActors = function(category, isChallenged, id, Fcallback) {
	var clues = {};
	var tmdb_id, rel_date, role, title, year, starring, actor, use;
	var bid, search;
	var use = categories[category-1].name;

	clues.clue2 = {
		year: "",
		genre: ""
	};
	
	async.series([
		function(callback) {
			if (isChallenged) {
				tmdbid = id;
				connection.query('SELECT * FROM `MOVIES` WHERE TMDB_ID = '+tmdbid+' ORDER BY RAND() LIMIT 0,1;', function(err, rows, fields) {
					if (!err) {
						bid = tmdbid;
						rel_date = rows[0].RELEASE_DATE;
			    		title = rows[0].TITLE;
			    		image = rows[0].IMAGE;
			    		year = rel_date.split("/");
			    		// console.log(title);
			    		// console.log(image);
			    		// console.log(rel_date);
			    		clues.clue1 = title;
			    		clues.clue2.year = year[2];
			    		clues.clue7 = image;
			    		clues.id = tmdbid;
			    		callback();
					} else {
						console.log('Error while performing Query.');
						callback();
					}
				});
			} else {
				connection.query('SELECT DISTINCT R.TMDB_ID, R.CHAR_NAME, M.TITLE, M.IMAGE, M.RELEASE_DATE FROM `ROLES` R INNER JOIN `MOVIES` M ON R.TMDB_ID = M.TMDB_ID WHERE AID = (SELECT AID FROM `ACTORS` WHERE NAME LIKE "%'+use+'%") ORDER BY RAND() LIMIT 0,1;', function(err, rows, fields) {
					if (!err) {
						tmdb_id = rows[0].TMDB_ID;
						role = rows[0].CHAR_NAME;
						image = rows[0].IMAGE;
						console.log('#Clue 5: Role:', role);
						bid = parseInt (tmdb_id);
						title = rows[0].TITLE;
						rel_date = rows[0].RELEASE_DATE;
						year = rel_date.split("/");
						console.log('#Clue 1: Title:', title);
						clues.id = bid;
						clues.clue1 = title;
						clues.clue2.year = year[2];
						clues.clue7 = image;
			    		callback();
					} else {
						console.log('Error while performing Query.');
						callback();
					}
				});
			}
		},
		function(callback) {
			connection.query('SELECT MG.TMDB_ID, GROUP_CONCAT(DISTINCT GENRE_NAME) AS GENRE, GROUP_CONCAT(DISTINCT CHAR_NAME) AS CHAR_NAME, GROUP_CONCAT(DISTINCT ACTORS.NAME) AS ACTORS, GROUP_CONCAT(DISTINCT DIRECTORS.NAME) AS DIRECTOR, OVERVIEW FROM `MOVIES_GENRES` MG INNER JOIN `ROLES` R ON MG.TMDB_ID = R.TMDB_ID INNER JOIN `OVERVIEW` O ON MG.TMDB_ID = O.TMDB_ID, `DIRECTORS`, `ACTORS` WHERE MG.TMDB_ID = '+bid+' AND DIRECTORS.DID IN (SELECT DID FROM `DIRECTS` WHERE TMDB_ID = '+bid+') AND ACTORS.AID IN (SELECT AID FROM `ROLES` WHERE TMDB_ID = '+bid+');', function(err, rows, fields) {
				if (!err) {
					var genreName = rows[0].GENRE.split("\r,");
					var directorName = rows[0].DIRECTOR.split("\r,");
					var famousCharacterName = rows[0].CHAR_NAME.split("\r,");
					starring = rows[0].ACTORS.split("\r,");
					var overview = rows[0].OVERVIEW;
					console.log('#Clue 2: year/genre: ', year[2], genreName);
					console.log('#Clue 3: Directed by: ', directorName);
					console.log('#Clue 4: Starring: ', starring);
					console.log('#Clue 6: Plot: ', overview);
					//console.log('#Clue 7: Image: ', image);
					
					clues.clue2.genre = genreName;
					clues.clue3 = directorName;
					clues.clue4 = starring;	
					clues.clue5 = famousCharacterName;
					clues.clue6 = overview;
					callback();
				} else {
					console.log('Error while performing Query.');
					callback();
				}
			});
		}
	],
	function(err) {
		Fcallback(clues);
	});	
}

connection.getGenres = function(category, isChallenged, id, Fcallback) {
	var clues = {};
	var tmdb_id, rel_date, role, title, year, starring, actor, use;
	var bid, search;
	var use = categories[category-1].name;

	clues.clue2 = {
		year: "",
		genre: ""
	};
	
	async.series([
		function(callback) {
			if (isChallenged) {
				tmdbid = id;
				connection.query('SELECT * FROM `MOVIES` WHERE TMDB_ID = '+tmdbid+' ORDER BY RAND() LIMIT 0,1;', function(err, rows, fields) {
					if (!err) {
						bid = tmdbid;
						rel_date = rows[0].RELEASE_DATE;
			    		title = rows[0].TITLE;
			    		image = rows[0].IMAGE;
			    		year = rel_date.split("/");
			    		// console.log(title);
			    		// console.log(image);
			    		// console.log(rel_date);
			    		clues.clue1 = title;
			    		clues.clue2.year = year[2];
			    		clues.clue7 = image;
			    		clues.id = tmdbid;
			    		callback();
					} else {
						console.log('Error while performing Query.');
						callback();
					}
				});
			} else {
				connection.query('SELECT * FROM `MOVIES` WHERE TMDB_ID IN (SELECT TMDB_ID FROM `MOVIES_GENRES` WHERE GENRE_NAME LIKE "%'+use+'%") ORDER BY RAND() LIMIT 0,1;', function(err, rows, fields) {
					if (!err) {
						tmdb_id = rows[0].TMDB_ID;
						image = rows[0].IMAGE;
						rel_date = rows[0].RELEASE_DATE;
						title = rows[0].TITLE;
						year = rel_date.split("/");
						console.log('#Clue 1: Title:', title);
						bid = parseInt (tmdb_id);
						clues.id = bid;
						clues.clue1 = title;
			    		clues.clue7 = image;
			    		callback();
					} else {
						console.log('Error while performing Query.');
						callback();
					}
				});
			}
		},
		function(callback) {
			connection.query('SELECT MG.TMDB_ID, GROUP_CONCAT(DISTINCT GENRE_NAME) AS GENRE, GROUP_CONCAT(DISTINCT CHAR_NAME) AS CHAR_NAME, GROUP_CONCAT(DISTINCT ACTORS.NAME) AS ACTORS, GROUP_CONCAT(DISTINCT DIRECTORS.NAME) AS DIRECTOR, OVERVIEW FROM `MOVIES_GENRES` MG INNER JOIN `ROLES` R ON MG.TMDB_ID = R.TMDB_ID INNER JOIN `OVERVIEW` O ON MG.TMDB_ID = O.TMDB_ID, `DIRECTORS`, `ACTORS` WHERE MG.TMDB_ID = '+bid+' AND DIRECTORS.DID IN (SELECT DID FROM `DIRECTS` WHERE TMDB_ID = '+bid+') AND ACTORS.AID IN (SELECT AID FROM `ROLES` WHERE TMDB_ID = '+bid+');', function(err, rows, fields) {
				if (!err) {
					var genreName = rows[0].GENRE.split("\r,");
					var directorName = rows[0].DIRECTOR.split("\r,");
					var famousCharacterName = rows[0].CHAR_NAME.split("\r,");
					starring = rows[0].ACTORS.split("\r,");
					var overview = rows[0].OVERVIEW;
					console.log('#Clue 2: year/genre: ', year[2], genreName);
					console.log('#Clue 3: Directed by: ', directorName);
					console.log('#Clue 4: Starring: ', starring);
					console.log('#Clue 6: Plot: ', overview);
					//console.log('#Clue 7: Image: ', image);
					
					clues.clue2.genre = genreName;
					clues.clue3 = directorName;
					clues.clue4 = starring;	
					clues.clue5 = famousCharacterName;
					clues.clue6 = overview;
					callback();
				} else {
					console.log('Error while performing Query.');
					callback();
				}
			});
		}
	],
	function(err) {
		Fcallback(clues);
	});	
}

//query for leaderboard information
connection.getLeaderboard = function(quiz_id, userfid, friendlistfid, callback) {
	var ret = {
		msg: "Internal server error",
		global: [	{ name: "", score: "" },
					{ name: "", score: "" },
					{ name: "", score: "" },
					{ name: "", score: "" },
					{ name: "", score: "" }],
		friends: [	{ name: "", score: "" },
					{ name: "", score: "" },
					{ name: "", score: "" },
					{ name: "", score: "" },
					{ name: "", score: "" }]
	}
	//console.log(quiz_id);
	async.series([
		function(callback) {
			connection.query('SELECT NAME, SCORE FROM `PLAYS` INNER JOIN `USERS` ON PLAYS.FID = USERS.FID WHERE QUIZ_ID = '+quiz_id+' ORDER BY SCORE DESC LIMIT 5;', function(err, rows, fields) {
			    if (!err) {
				    for (i = 0; i < rows.length; i++) {
			             ret.global[i] = { name: rows[i].NAME, score: rows[i].SCORE};
			             //console.log('this is global leaderboard: ' +rows[i].NAME, rows[i].SCORE);
			             if (i == 4) {
			             	break;
			             }
					}
					callback();      
			    } else {
			    	console.log('Error performing query on Plays table for leaderboard (global) information');
			    	callback();
			    }	
			});
		},
		function(callback) {
			connection.query('(SELECT NAME, SCORE FROM `PLAYS` INNER JOIN `USERS` ON PLAYS.FID = USERS.FID WHERE QUIZ_ID = '+quiz_id+' AND PLAYS.FID IN ('+friendlistfid+')) UNION (SELECT NAME, SCORE FROM `PLAYS` INNER JOIN `USERS` ON PLAYS.FID = USERS.FID WHERE QUIZ_ID = '+quiz_id+' AND PLAYS.FID = '+userfid+' ) ORDER BY SCORE DESC LIMIT 5;', function(err, rows, fields){
		        if(!err) {
				 	for (i = 0; i < rows.length; i++) {
			             ret.friends[i] = { name: rows[i].NAME, score: rows[i].SCORE};
			             //console.log('this is global leaderboard: ' +rows[i].NAME, rows[i].SCORE);
			             if (i == 4) {
			             	break;
			             }
					}

					ret.msg = "successfully retrieved leaderboard"
					callback();  
			    } else {
					console.log('Error performing query on Plays table for leaderboard (friend) information');
					callback();
				}
		    });
		}],
		function(err) {
			callback(ret);
		}
	);
}

connection.getUserData = function (fbid, name, callback) {
	var loginbutton = 1;
	var acceptbutton = 1;
	var questions = [];
	var ret = {
		msg: "Internal Server Error",
		challenge: {}
	};

	connection.query('SELECT * FROM `USERS` WHERE FID = '+fbid+'', function(err, rows, fields) {
		if(!err) {
			if (rows[0] == null) {
				connection.query('INSERT INTO `USERS` (FID,NAME) VALUES ('+fbid+',"'+name+'")', function(err, rows, fields) {
					if(!err) {
						console.log("Successfull insertion of user name: " + name + "\tfid: " + fbid);
						ret.msg = "User created in database";
						callback(ret);
					}
					else {
						console.log("Error insetion insertion of user name: " + name + "\tfid: " + fbid);
						callback(ret);
					}
				});
			}
			else {
				console.log("User already exists with user name: " + name + "\tfid: " + fbid);
		        connection.query('SELECT *  FROM `CHALLENGE` WHERE FRIEND = '+fbid+'', function(err, rows1, fields) {
					if(!err) {
						if(rows1[0] != null) {
							//console.log(rows1);
							var user = rows1[0].USER;
							connection.query('SELECT NAME FROM `USERS` WHERE FID = '+user+'', function(err, rows, fields) {
								if(!err) {
									if (rows[0] == null) {
										ret.msg = "No one has challenged user";
										callback(ret);
									} else {
										var userName = rows[0].NAME;
										var quiz_id = rows1[0].QUIZ_ID;
										var level = rows1[0].LEVEL;
										for(var i in rows1) {
											questions[i] = rows1[i].TMDB_ID;
											//console.log(questions[i]);
										}
										//console.log(userName + ' has challeneged you! Do you accept?');
										ret.challenge.name = userName;
										ret.challenge.category = quiz_id;
										ret.challenge.difficulty = level;
										ret.challenge.tmdbIds = questions;
										ret.msg = "successfully retrieved challenge data";
										// console.log(questions);
										// console.log(quiz_id);
										// console.log(level);
										callback(ret);
									}
								} else {
									console.log("Error performing query on user id: " + user);
									callback(ret);
								}
							});
						} else {
							console.log("No challenges found for user name: " + name + "\tfid: " + fbid);
							ret.msg = "No challenges";
							callback(ret);
						}
					} else {
						console.log("Error performing query on challenge on name: " + name + "\tfid: " + fbid);
						callback(ret);
					}
				});
			}		
		} else {
			console.log("TEST");
			console.log("Error performing query on user name: " + name + "\tfid: " + fbid);
			callback("Error with database");
		}
	});
}

connection.createChallenge = function(user_fbid, friend_fbid, quiz_id, tmdb_id, level, callback) {
	var ret = {
		msg: "Internal server error"
	};

	connection.query(	'INSERT INTO `CHALLENGE` (USER, FRIEND, QUIZ_ID, TMDB_ID, LEVEL) VALUES \
						('+user_fbid+', '+friend_fbid+', '+quiz_id+', '+tmdb_id[0]+', '+level+'),\
						('+user_fbid+', '+friend_fbid+', '+quiz_id+', '+tmdb_id[1]+', '+level+'),\
						('+user_fbid+', '+friend_fbid+', '+quiz_id+', '+tmdb_id[2]+', '+level+'),\
						('+user_fbid+', '+friend_fbid+', '+quiz_id+', '+tmdb_id[3]+', '+level+'),\
						('+user_fbid+', '+friend_fbid+', '+quiz_id+', '+tmdb_id[4]+', '+level+'),\
						('+user_fbid+', '+friend_fbid+', '+quiz_id+', '+tmdb_id[5]+', '+level+'),\
						('+user_fbid+', '+friend_fbid+', '+quiz_id+', '+tmdb_id[6]+', '+level+'),\
						('+user_fbid+', '+friend_fbid+', '+quiz_id+', '+tmdb_id[7]+', '+level+'),\
						('+user_fbid+', '+friend_fbid+', '+quiz_id+', '+tmdb_id[8]+', '+level+'),\
						('+user_fbid+', '+friend_fbid+', '+quiz_id+', '+tmdb_id[9]+', '+level+')'
		, function(err, rows, fields) {
			if(!err) {
				console.log('Successfull insertion into challenge table');
				ret.msg = "Challenge successfully created";
				callback(ret);
			}
			else {
				console.log("Error insertion into challenge table");
				callback(ret);
			}	
	});	
}

connection.submitScore = function(fbid, quizid, score, callback) {
	var ret = {
		msg: "Internal server error"
	};

	connection.query('INSERT INTO `PLAYS` (QUIZ_ID,SCORE,FID) VALUES ("'+quizid+'","'+score+'","'+fbid+'")', function(err, rows, fields) {
		console.log(err);
		if(!err) {
			console.log('successful insertion of user score');
			ret.msg = "successfully submitted user score";
			callback(ret);
		} else {
			console.log('Error inserting score into Plays table');
			callback(ret);
		}
	});
}

module.exports = connection;