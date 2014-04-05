function test_callback(first) {
	console.log(first);
	return;
}

function find(query, callback) {
	return callback("find");
}

function getAllStatuses(callback) {
	return callback("getAllStatuses");
}

function send_error(callback) {
	return callback("Incorrectly formatted request");
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
	switch (command) {
		case "find": //get all comments
			break;
		case "insert":
			break;
		case "update":
			break;
		case "save":
			break;
		case "remove":
			break;
		case "drop":
			break;
		default:
			return "Incorrectly formatted request";
	}
	callback(command);
	return callback(args);
}

parse("db.1234.find()", console.log);
parse("db.1234.find(omg, arguments)", console.log);
