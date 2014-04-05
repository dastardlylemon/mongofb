var graph = require('fbgraph');

exports.getAllCommentsByStatus = function(token, statusID, callback) {
  var comments = [];
  graph.setAccessToken(token);

  function retrieveAllCommentsByStatus = function(token, status, callback) {
    graph.get("" + status, function(err, data) {
        console.log(data);
        for (var i = 0; i < data.comments.data; i++) {
          comments.push(data.comments.data[i]);
        }

        if (data.comments.paging.next) {
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

exports.addCommentToStatus = function(token, statusID, msg, callback) {
  graph.setAccessToken(token);
}