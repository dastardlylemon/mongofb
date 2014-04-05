var fbc = require('./facebookController.js');

function getAllStatuses(callback) {
	return callback("getAllStatuses");
}

function send_error(callback) {
	return callback("ERROR");
}

function parse(query, callback) {
	var splitRe = /\./;
	var paramList = query.split(splitRe);
	if (paramList[0] !== "db") {
		return send_error(callback);
	} else if (paramList.length === 1) {
		return getAllStatuses(callback);
	}
	var collection = paramList[1];
	var parenRe = /\((.*)\)/;
	var commandArgs = paramList[2].split(parenRe);
	commandArgs.pop();
	if (commandArgs.length !== 2) {
		return send_error(callback);
	}
	var command = commandArgs[0];
	var args = commandArgs[1].split(/,/);
	if (args.length === 1 && args[0] === "") {
		args = [];
	}
	var queryObj = {
		"collection": collection,
		"command": command,
		"args": args
	};
	return callback(queryObj);
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

		return fbc.getAllCommentsByStatus(token, id, function (comments) {
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
	fbc.addStatus(token, collection, callback);
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

function call_it_all(query, token, callback) {
	return parse(query, function (a) {
		a["token"] = token;
		console.log("callit");
		return command_helper(a, callback);
	});
}

exports.tester = function(req, res, next) {
	call_it_all("db.1234.insert()", "CAAG9AUNEIScBAISJjGY1OBDFl1Jn4gRvKNC7XDa56j877WdFZAU3YvWDy5qZCmjrjGHglZBA5ZAT9pydRVXCAoxcDYucAPWVTe5oCDTdg9TZAypnboDeuaXOjlCYsF8o4pCO0n9dc2iG9752TVwnWKUD3u1rK0R3faB4ZBj8T2KnUDWUhiASzmtykvHByv1okZD", console.log);
	req.queryObj = {};
	res.jsonp("end of test");
}

// parse("db.1234.find()", console.log);
// parse("db.1234.find(oneArg)", console.log);
// parse("db.1234.find(omg, arguments)", console.log);

// call_it_all("db.1234.find()", 1234, console.log);
// call_it_all("db.1234.find(oneArg)", 1234, console.log);
// call_it_all("db.1234.find(omg, arguments)", 1234, console.log);