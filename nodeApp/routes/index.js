var express = require('express');
var router = express.Router();
var categories = require('../categories');
var mySqlDB = require('../moviesmysqldb');
var mongoDB = require('../moviesmongodb');
var async = require('async');
var credentials = require('../../../credentials');
var Bing = require('node-bing-api')({ accKey: credentials.bingInfo.accKey });
var Qs = require('qs');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { 
		title: 'Are You a Movie Junkie?', 
		categories: categories
	});
});

/* POST login user and get challenges. */
router.post('/quiz/loginUser', function(req, res, next) {
	var data = Qs.parse(req.body);
	var fid = data.fid;
	var name = data.name;
	var friends = data.friends;
	// console.log(fid);
	// console.log(name);
	// console.log(friends.length);
	mySqlDB.getUserData(fid, name, function(ret) {
		res.send(ret);
	});
});

/* POST challenge. */
router.post('/quiz/challenge', function(req, res, next) {
	var data = Qs.parse(req.body);
	var user_fid = data.user;
	var friend_fid = data.friend;
	var quiz_id = data.quiz;
	var ids = data.ids;
	var level = data.level;

	//console.log(ids);

	mySqlDB.createChallenge(user_fid, friend_fid, quiz_id, ids, level, function(ret) {
		res.send(ret);
	});
});

/* POST update user score. */
router.post('/quiz/updateScore', function(req, res, next) {
	var data = Qs.parse(req.body);
	var fbid = data.fid;
	var quizid = data.category;
	var score = data.score;

	mySqlDB.submitScore(fbid, quizid, score, function(ret) {
		res.send(ret);
	});
});

/* POST getting leaderboard information. */
router.post('/quiz/getLeaderboard', function(req, res, next) {
	var data = Qs.parse(req.body);
	var fid = data.fid;
	var quiz_id = data.category;
	var friendlistfid = data.friends;

	mySqlDB.getLeaderboard(quiz_id, fid, friendlistfid, function(ret) {
		res.send(ret);
	});
});

/* POST quiz question. */
router.post('/quiz/getQuestion', function(req, res, next) {
	var data = Qs.parse(req.body);
	var category = data.category;
	var isChallenged = data.isChallenged == 'true' ? true : false;
	var id = data.id;
	
	if (category < 5) {
		mySqlDB.getTopMovies(category, isChallenged, id, function(ret) {
			res.send(ret);
		});
	} else if (category < 31) {
		mySqlDB.getActors(category, isChallenged, id, function(ret) {
			res.send(ret);
		});
	} else if (category < 39) {
		mySqlDB.getGenres(category, isChallenged, id, function(ret) {
			//console.log(ret);
			res.send(ret);
		});
	} else if (category == 39) {
		mongoDB.getOscarsRoles(function(ret) {
			res.send(ret);
		});
	} else if (category == 40) {
		mongoDB.getOscarsMovies(function(ret) {
			res.send(ret);
		});
	}
});

module.exports = router;
