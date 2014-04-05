var graph = require('fbgraph');
var userModel = require('../models/userModel');

// exports.testFacebook = function(req, res, next) {
//     var statusId = req.query.status_id;
//     getAllCommentsByStatus(req.accessToken, statusId, function(comments) {
//         console.log(comments);
//     });
// };

//exports.getAllCommentsByStatus = function(token, statusID, callback) {
function getAllCommentsByStatus(token, statusID, callback) {
  var comments = [];

  var retrieveAllCommentsByStatus = function(token, status, callback) {
    graph.setAccessToken(token);
    graph.get(status, function(err, data) {
        console.log(data);
        for (var i = 0; i < data.comments.data.length; i++) {
          comments.push(data.comments.data[i]);
        }

        if (data.comments.paging && data.comments.paging.next) {
          return retrieveAllCommentsByStatus(token, data.comments.paging.next, callback);
        } else {
          return callback();
        }
    });
  }

  return retrieveAllCommentsByStatus(token, statusID, function() {
    return callback(comments);
  });
}

function retrieveStatusId(apiKey, collectionName, callback) {
    userModel.retrieveStatusId(apiKey, collectionName, function(statusID) {
        if (statusID != null) {
            // if statusID is not null, then it is cached
            callback(statusID);
        } else {
            callback(null);
        }
    });
}

function addStatus(apiKey, token, msg, callback) {
  graph.setAccessToken(token);
  console.log("addstatus");

  graph.post("/me/feed", { message: msg }, function(err, res) {
    // Async because we don't need to wait for this action to complete
    // If you want sync, just pass in a fourth argument as callback
    var name = msg.message.slice(7, comments[i].message.length - 28);
    userModel.createNewTable(apiKey, msg, res.id);
    // returns the post id
    console.log(res); // { id: xxxxx}
    console.log("graph post");
    return callback(res);
  });
}

function deleteObject(token, objectID, callback) {
  graph.setAccessToken(token);

  graph.del("/" + objectID, function(err, res) {
    console.log(res); // {data:true}/{data:false}
    return callback(res);
  });
}

function addCommentToStatus(token, statusID, msg, callback) {
  graph.setAccessToken(token);

  graph.post("/" + statusID + "/comments", { message:msg }, function(err, res) {
    // returns the post id
    console.log(res); // { id: xxxxx}
    return callback(res);
  });
}

function updateObject(token, objectID, msg, callback) {
  graph.setAccessToken(token);

  graph.post("/" + objectID, { message:msg }, function(err, res) {
    //returns true/false
    console.log(res);
    return callback(res);
  });
}

function matchesQuery(query, commentObj) {
	var message = commentObj["message"];
	return (message.search(query) !== -1);
}

function find(queryObj, callback) {
	var collection = queryObj["collection"];
	var token = queryObj["token"];
	var args = queryObj["args"];
	var apiKey = queryObj["apiKey"];
	retrieveStatusId(apiKey, collection, function(statusID) {
		if (!statusID) {
			callback("ERROR: COLLECTION DOESN'T EXIST");
		} else {
      getAllCommentsByStatus(token, statusID, function (comments) {
        for (var i = 0; i < comments.length; i++) {
          comments[i].message = comments[i].message.slice(7);
          comments[i].message = toAscii(comments[i].message);
        }
        if (args.length !== 0) {
          comments.filter(function (com) {
            return matchesQuery(args[0], com);
          });
        }
        callback(comments);
      });
    }
	});
}

function to64(string) {
  return new Buffer(string).toString('base64');
}

function toAscii(string) {
  return new Buffer(string, 'base64').toString('ascii');
}

function insert(queryObj, callback) {
	console.log("insert");
	var collection = queryObj["collection"];
	var apiKey = queryObj["apiKey"];
	var token = queryObj["token"];
	var args = queryObj["args"];
	retrieveStatusId(apiKey, collection, function(statusID) {
    console.log(statusID);
    var status = "[MongoFB Data]\ncollection name: " + collection;
    var comment = args[0].substring(0,5) + '\n' + to64(args[0]);
    status += "\n[Do not modify or delete!]";
		if (!statusID) {
      console.log("statusID not found");
			addStatus(apiKey, token, status, function(res) {
        addCommentToStatus(token, res.id, comment, callback);
			});
		} else {
      var comment = args[0].substring(0,5) + '\n' + to64(args[0]);
      addCommentToStatus(token, statusID, comment, callback);
    }
	});
}

function update(queryObj, callback) {
	return callback("insert");
}

function save(queryObj, callback) {
	return callback("insert");
}

function remove(queryObj, callback) {
	return callback("insert");
}

function drop(queryObj, callback) {
	return callback("insert");
}

function command_helper(queryObj, callback) {
	command = queryObj["command"];
	switch (command) {
		case "find": //get all comments
			return find(queryObj, callback);
		case "insert":
			return insert(queryObj, callback);
		case "update":
			return update(queryObj, callback);
		case "save":
			return save(queryObj, callback);
		case "remove":
			return remove(queryObj, callback);
		case "drop":
			return drop(queryObj, callback);
	}
	//return send_error(callback);
}

exports.queryHelper = function(req, res, next) {
	req.queryObj["token"] = req.accessToken;
  req.queryObj["apiKey"] = req.query.api_key;
	command_helper(req.queryObj, function(success) {
		res.json(success);
		//next();
	});
}
