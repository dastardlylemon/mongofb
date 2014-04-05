var userModel = require('../models/userModel.js');

exports.createNewUser = function(req, res, next) {
    var fbId = req.body.fbId;
    var accessToken = req.body.accessToken;
    userModel.createNewUser(fbId, accessToken, function(user){
        // if error, user object is Null
        if (user == null) {
            console.log("WOW");
            res.jsonp({
                exists : "User already exists"
            });
        } else if (user == undefined) {
            res.jsonp({
                error : "An error occured"
            });
        } else {
            res.jsonp({
                apiKey : user.apiKey
            });
        }
    });
}

exports.retrieveAccessToken = function(req, res, next) {
    var apiKey = req.apiKey;
    userModel.getAccessToken(apiKey, function(accessToken) {
        req.accessToken = accessToken;
        next();
    });
}
