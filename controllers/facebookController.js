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
    console.log("retrieve all comments");
    graph.setAccessToken(token);
    try {
        graph.get(status, function(err, data) {
            if (err) {
                return callback();
            }
            //console.log(data);
            for (var i = 0; i < data.comments.data.length; i++) {
              comments.push(data.comments.data[i]);
            }

            if (data.comments.paging && data.comments.paging.next) {
              return retrieveAllCommentsByStatus(token, data.comments.paging.next, callback);
            } else {
              return callback();
            }
        });
    } catch (e) {
        return callback();
    }
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
    var name = msg.slice(32, msg.length - 27);
    userModel.createNewTable(apiKey, name, res.id);
    // returns the post id
    //console.log(res); // { id: xxxxx}
    //console.log("graph post");
    return callback(res);
  });
}

function deleteObject(token, objectID, callback) {
  graph.setAccessToken(token);

  graph.del("/" + objectID, function(err, res) {
    //console.log(res); // {data:true}/{data:false}
    return callback(res);
  });
}

function addCommentToStatus(token, statusID, msg, callback) {
  graph.setAccessToken(token);

  graph.post("/" + statusID + "/comments", { message:msg }, function(err, res) {
    // returns the post id
    //console.log(res); // { id: xxxxx}
    return callback(res);
  });
}

function updateObject(token, objectID, msg, callback) {
  graph.setAccessToken(token);

  graph.post("/" + objectID, { message:msg }, function(err, res) {
    //returns true/false
    console.log('update object');
    console.log(res);
    return callback(res);
  });
}

function matchesQuery(query, commentObj) {
  var queryObj = JSON.parse(query);
	var message = commentObj["message"];
    for (var i in queryObj) {
        if (message.hasOwnProperty(i)) {
            if (message[i].search(queryObj[i]) !== -1) {
                continue;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    return true;
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
          //console.log(toAscii(comments[i].message));
          try {
              //comments[i].message = comments[i].message.slice(comments[i].message.indexOf('\n'));
              comments[i].message = JSON.parse(toAscii(comments[i].message));
          } catch(e) {
              comments[i].message = {};
          }
        }
        if (args.length !== 0) {
          comments = comments.filter(function (com) {
            return matchesQuery(args, com);
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
    //console.log(statusID);
    var status = "[MongoFB Data]\ncollection name: " + collection;
    //var comment = "-" + args.substring(0,5) + '-\n' + to64(args);
    var comment = to64(args);
    status += "\n[Do not modify or delete!]";
		if (!statusID) {
      /**
      console.log("statusID not found")
			addStatus(apiKey, token, collection, function(res) {
				addCommentToStatus(token, res.id, to64(args), callback);
			});
		} else {
      addCommentToStatus(token, statusID, to64(args), callback);
      **/
        console.log("statusID not found");
        addStatus(apiKey, token, status, function(res) {
            addCommentToStatus(token, res.id, comment, callback);
        });
		} else {
      //var comment = "-" + args.substring(0,5) + '-\n' + to64(args);
      addCommentToStatus(token, statusID, comment, callback);
    }
	});
}

function update(queryObj, callback) {
	console.log("update");
  var collection = queryObj["collection"];
  var apiKey = queryObj["apiKey"];
  var token = queryObj["token"];
  var args = queryObj["args"];

  //split args into find query and replace object
  //db.collection.update({"key":"value"}, {"replaced":"value"});
  //gonna count some braces

  args = JSON.parse(args);
  findArgs = args.find;
  replaceArgs = args.replace;

  var findObj = {
    collection: collection,
    apiKey: apiKey,
    token: token,
    args: findArgs
  };

  var replaceObj = {
    collection: collection,
    apiKey: apiKey,
    token: token,
    args: replaceArgs
  };

  console.log(findArgs, replaceArgs);

  find(findObj, function(comments) {
    //remove all
    console.log(comments);
    if (comments.length == 0) {
      console.log("nothing to update");
      callback({
          documentUpdated: false
      });
      return;
    }
    callback(comments);
    // for (var i = 0; i < comments.length; i++) {

    //   try {
    //           //comments[i].message = comments[i].message.slice(comments[i].message.indexOf('\n'));
    //           comments[i].message = JSON.parse(toAscii(comments[i].message));
    //       } catch(e) {
    //           comments[i].message = {};
    //       }
    //   //function deleteObject(token, objectID, callback) 
    //   // deleteObject(token, comments[i].id, function() {
    //   //   console.log("object deleted");
    //   //     callback({
    //   //         documentUpdated: true
    //   //     });
    //   // });
    // }
  });
}

function save(queryObj, callback) {
	return callback("insert");
}

function remove(queryObj, callback) {
	console.log("remove");
  var collection = queryObj["collection"];
  var apiKey = queryObj["apiKey"];
  var token = queryObj["token"];
  var args = queryObj["args"];
  find(queryObj, function(comments) {
    //remove all
    console.log(comments);
    if (comments.length == 0) {
      console.log("nothing to remove");
      callback({
          documentRemoved: false
      });
      return;
    }
    for (var i = 0; i < comments.length; i++) {
      //function deleteObject(token, objectID, callback) 
      deleteObject(token, comments[i].id, function() {
        console.log("object deleted");
          callback({
              documentRemoved: true
          });
      });
    }
  });
}

function drop(queryObj, callback) {
    var apiKey = queryObj.apiKey;
    var token = queryObj.token;
    var collection = queryObj.collection;
    userModel.removeCollection(apiKey,collection,function(err,statusID) {
        if (err) {
            callback({
                collectionDropped: false
            });
        } else {
            deleteObject(token, statusID, function() {
                callback({
                    collectionDropped: true
                });
            }); 
        }
    });
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
    var args = unescape(req.queryObj.args);
    req.queryObj.args = args.replace(/\{\ *\}|\ */,'');
    //console.log("ARGS" + args);
    if (req.queryObj.args != '') {
        try {
            JSON.parse(args);
        } catch (e) {
            res.json({"error": "malformed query"});
            return;
        }
    }
	req.queryObj["token"] = req.accessToken;
    req.queryObj["apiKey"] = req.query.api_key;
	command_helper(req.queryObj, function(success) {
		res.json(success);
		next();
	});
}
