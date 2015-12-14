var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var credentials = require('../../credentials');
var categories = require('./categories');
var async = require('async');
var Bing = require('node-bing-api')({ accKey: credentials.bingInfo.accKey });

var N = 0;
var url = credentials.mongoDBInfo.url;

var getOscarsRoles = function(callback) {
    MongoClient.connect(url, function(err, db) {
      console.log("MongoDB connected\n");
      
      //choose=1
      oscarsRoles(db, function(ret) {
        //console.log("TEST");
        callback(ret);
        db.close();
      });
  });
}

var getOscarsMovies = function(callback) {
    MongoClient.connect(url, function(err, db) {
      console.log("MongoDB connected\n");

      //choose=2
      oscarsMovies(db, function(ret) {
        callback(ret);
        db.close();
      });
  });
}

var oscarsRoles = function(db, Fcallback) {
  var cursor =db.collection('oscars').find({category: {$in: ['Actress -- Leading Role', 'Actor -- Leading Role', 'Actress -- Supporting Role', 'Actor -- Supporting Role']}});
  var results = {};
  var search;

  async.series([
    function(callback) {
      cursor.count(function(err, N) {
        var random = Math.floor(Math.random()*N);
        var yes = db.collection('oscars').find({category: {$in: ['Actress -- Leading Role', 'Actor -- Leading Role', 'Actress -- Supporting Role', 'Actor -- Supporting Role']}}).limit(1).skip(random);
    
        yes.each(function(err, doc) {
          if (doc != null) {

            var name = doc.hint;
            var moviename = name.split('{');
            var charname = moviename[1].split('}');
            // console.log("Clue 1: Title:", moviename[0]);
            // console.log("CLue 2: Role:", charname[0]);
            // console.log("Clue 3: Name:", doc.nominee);
            // console.log("Clue 4: Category:", doc.category);
            // console.log("Clue 5: Year of Nomination:", doc.year);
            // console.log("Clue 6: Won: ", doc.Won);
            
            results.clue1 = moviename[0].substring(0, moviename[0].length-1);
            results.clue2 = charname[0]; //.substring(1, charname[0].length-1);
            results.clue3 = doc.nominee;
            results.clue4 = doc.category;
            results.clue5 = doc.year;
            results.clue6 = doc.Won;

            search = results.clue1.concat(" movie scene");

            callback();
            return false;
          } else if (doc == null) {
            callback();
            return false;
          }
        });
      });
    },
    function (callback) {
      Bing.images(search, { top: 10 }, function(error, res, body) {
        try {
          var link = body.d.results[0].MediaUrl;
          console.log('#Clue 7: Movie Scenes: ',link);
          results.clue7 = link;
          callback();
        } catch(err) {
          callback();
        }
      });
    }
  ],
  function(err) {
    Fcallback(results);
  });
};

var oscarsMovies = function(db, Fcallback) {
  var cursor =db.collection('oscars').find({category: {$in: ['Best Picture', 'Directing', 'Animated Feature Film']}});
  var results = {};
  var search;

  async.series([
    function(callback) {
      cursor.count(function(err, N) {
        var random = Math.floor(Math.random()*N);
        var yes = db.collection('oscars').find({category: {$in: ['Best Picture', 'Directing', 'Animated Feature Film']}}).limit(1).skip(random);
        
        yes.each(function(err, doc) {
          if (doc != null) {
            
            // console.log("Clue 1: Title:", doc.nominee);
            // console.log("Clue 2: Hint:", doc.hint);
            // console.log("Clue 3: Category:", doc.category);
            // console.log("Clue 4: Year of Nomination:", doc.year);
            // console.log("Clue 5: Won:",doc.Won);

            results.clue1 = doc.nominee;
            results.clue2 = doc.hint; //.substring(1, charname[0].length-1);
            results.clue3 = doc.category;
            results.clue4 = doc.year;
            results.clue5 = doc.Won;

            search = results.clue1.concat(" movie scene");

            callback();
            return false;
          } else if (doc == null) {
            callback();
            return false;
          }
        });
      });
    },
    function (callback) {
      Bing.images(search, { top: 10 }, function(error, res, body) {
        try {
          var link = body.d.results[0].MediaUrl;
          console.log('#Clue 7: Movie Scenes: ',link);
          results.clue6 = link;
          callback();
        } catch(err) {
          callback();
        }
      });
    }
  ],
  function(err) {
    Fcallback(results);
  });
};

module.exports.getOscarsRoles = getOscarsRoles;
module.exports.getOscarsMovies = getOscarsMovies;