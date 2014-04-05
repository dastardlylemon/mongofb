var userModel = require('../models/userModel.js');

exports.createNewUser = function(req, res, next) {
    var fbId = req.body.fbId;
    var accessToken = req.body.accessToken;
    userModel.createNewUser(fbId, accessToken, function(user){
        // if error, user object is Null
        if (user == null) {
            res.jsonp({
                exists : true
            });
        } else if(user == undefined) {
            res.jsonp({
                error : "An error occured"
            });
        } else {
            var userDetails = {}
            userDetails.apiKey = user.apiKey;
            if (user.exists) {
                userDetails.exists = true;
            }
            res.jsonp(userDetails);
        }
    });
}

exports.retrieveAccessToken = function(req, res, next) {
    var apiKey = req.query.api_key;
    userModel.getAccessToken(apiKey, function(accessToken) {
        req.accessToken = accessToken;
        next();
    });
}
