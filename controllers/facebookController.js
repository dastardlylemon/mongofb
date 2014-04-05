var graph = require('fbgraph');

exports.getAllStatuses = function(token) {
  graph.setAccessToken(token).get("me/?fields=statuses", function(err, data) {
      console.log(data);
  });
}

exports.getAllCommentsByStatus = function(token, statusID) {
  graph.setAccessToken(token).get("me/?fields=statuses", function(err, data) {
      console.log(data);
  });
}