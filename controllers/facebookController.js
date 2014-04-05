var graph = require('fbgraph');

// exports.testFacebook = function(req, res, next) {
//     var statusId = req.query.status_id;
//     getAllCommentsByStatus(req.accessToken, statusId, function(comments) {
//         console.log(comments);
//     });
// };

//exports.getAllCommentsByStatus = function(token, statusID, callback) {
exports.getAllCommentsByStatus = function(token, statusID, callback) {
  var comments = [];
  graph.setAccessToken(token);

  var retrieveAllCommentsByStatus = function(token, status, callback) {
    graph.get(status, function(err, data) {
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

exports.addStatus = function(token, msg, callback) {
  graph.setAccessToken(token);
  console.log("addstatus");

  graph.post("/me/feed", { message: msg }, function(err, res) {
    // returns the post id
    console.log(res); // { id: xxxxx}
    console.log("graph post");
    return callback(res);
  });
}

exports.deleteObject = function(token, objectID, callback) {
  graph.setAccessToken(token);

  graph.del("/" + objectID, function(err, res) {
    console.log(res); // {data:true}/{data:false}
    return callback(res);
  });
}

exports.addCommentToStatus = function(token, statusID, msg, callback) {
  graph.setAccessToken(token);

  graph.post("/" + statusID + "/comments", { message:msg }, function(err, res) {
    // returns the post id
    console.log(res); // { id: xxxxx}
    return callback(res);
  });
}

exports.updateObject = function(token, objectID, msg, callback) {
  graph.setAccessToken(token);

  graph.post("/" + objectID, { message:msg }, function(err, res) {
    //returns true/false
    console.log(res);
    return callback(res);
  });
}

function find(queryObj, callback) {
	/*
	var collection = queryObj["collection"];
	var token = queryObj["token"];
	var args = queryObj["args"];
	return getStatusID(collection, function(id) {
		var matchesQuery = function(query, commentObj) {
			var message = commentObj["message"];
			return (message.search(query) !== -1);
		}

		return getAllCommentsByStatus(token, id, function (comments) {
			if (args.length !== 0) {
				comments.filter(function (com) {
					return matchesQuery(args[0], com);
				});
			}
			return callback(comments);
		});
	});
	*/
	return callback("find");
}

function insert(queryObj, callback) {
	console.log("insert");
	var collection = queryObj["collection"];
	var token = queryObj["token"];
	var args = queryObj["args"];
/*
	return getAllStatuses(function(statuses) {
		//if collection in statuses, use that status, else create new status
		statuses.filter(function (status) {
			return (collection === status);
		}
		if (statuses.length !== 0) {
			return getStatusID(statuses[0], ...);
		}
		return createStatus(collection, ...);
	});
		*/
	addStatus(token, collection, callback);
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
	console.log("cmdhelp");
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
	return send_error(callback);
}

exports.queryHelper = function(req, res, next) {
	req.queryObj["token"] = req.accessToken;
	command_helper(req.queryObj, console.log);
}
