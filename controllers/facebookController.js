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

exports.addStatus = function(token, msg, callback) {
  graph.setAccessToken(token);

  graph.post("me/feed", msg, function(err, res) {
    // returns the post id
    console.log(res); // { id: xxxxx}
    callback(res);
  });
}