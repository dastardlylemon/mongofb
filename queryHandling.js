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
	if (args.length === 1 && args[0] === "") {
		args = [];
	}
	var result = {
		"command": command,
		"args": args
	};
	return callback(result);
}

function find(query, callback) {
	return callback("find");
}

function insert(query, callback) {
	return callback("insert");
}

function update(query, callback) {
	return callback("insert");
}

function save(query, callback) {
	return callback("insert");
}

function remove(query, callback) {
	return callback("insert");
}

function drop(query, callback) {
	return callback("insert");
}

function call_command_with_args(commandArgs, callback) {
	command = commandArgs["command"];
	args = commandArgs["args"];
	switch (command) {
		case "find": //get all comments
			return find(args, callback);
		case "insert":
			return insert(args, callback);
		case "update":
			return update(args, callback);
		case "save":
			return save(args, callback);
		case "remove":
			return remove(args, callback);
		case "drop":
			return drop(args, callback);
	}
	return send_error(callback);
}

parse("db.1234.find()", console.log);
parse("db.1234.find(oneArg)", console.log);
parse("db.1234.find(omg, arguments)", console.log);
