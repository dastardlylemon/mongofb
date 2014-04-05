var queryController = require('../controllers/queryController');
var userController = require('../controllers/userController');
var facebookController = require('../controllers/facebookController');

exports.query = function(req,res) {
    var query = req.params.query;
    var apiKey = req.params.key;
    userController.getAccessToken(apiKey, function(accessToken) {
        facebookController.doSomething(accessToken, function(){});
    });
}
