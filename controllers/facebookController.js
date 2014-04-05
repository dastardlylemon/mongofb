var graph = require('fbgraph');

exports.testFacebook = function(req, res, next) {
    var statusId = req.query.status_id;
    getAllCommentsByStatus(req.accessToken, statusId, function(comments) {
        console.log(comments);
    });
};

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
          retrieveAllCommentsByStatus(token, data.comments.paging.next, callback);
        } else {
          callback();
        }
    });
  }

  retrieveAllCommentsByStatus(token, statusID, function() {
    callback(comments);
  });
}

exports.addStatus = function(token, msg, callback) {
  graph.setAccessToken(token);

  graph.post("/me/feed", { message: msg }, function(err, res) {
    // returns the post id
    console.log(res); // { id: xxxxx}
    callback(res);
  });
}

exports.deleteObject = function(token, objectID, callback) {
  graph.setAccessToken(token);

  graph.del("/" + objectID, function(err, res) {
    console.log(res); // {data:true}/{data:false}
    callback(res);
  });
}

exports.addCommentToStatus = function(token, statusID, msg, callback) {
  graph.setAccessToken(token);

  graph.post("/" + statusID + "/comments", { message:msg }, function(err, res) {
    // returns the post id
    console.log(res); // { id: xxxxx}
    callback(res);
  });
}

exports.updateObject = function(token, objectID, msg, callback) {
  graph.setAccessToken(token);

  graph.post("/" + objectID, { message:msg }, function(err, res) {
    //returns true/false
    console.log(res);
    callback(res);
  });
}
