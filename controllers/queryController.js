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


function call_it_all(query, req, next, callback) {
	parse(query, function (a) {
		req.queryObj = a;
        next();
	});
}

exports.tester = function(req, res, next) {

	var queryString = req.query.query;
	console.log(queryString);
	call_it_all(queryString, req, next, console.log);
}

// parse("db.1234.find()", console.log);
// parse("db.1234.find(oneArg)", console.log);
// parse("db.1234.find(omg, arguments)", console.log);

// call_it_all("db.1234.find()", 1234, console.log);
// call_it_all("db.1234.find(oneArg)", 1234, console.log);
// call_it_all("db.1234.find(omg, arguments)", 1234, console.log);
