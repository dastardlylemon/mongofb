var userModel = require('../models/userModel.js');

exports.createNewUser = function(req, res, next) {
    var fbId = req.body.fbId;
    var accessToken = req.body.accessToken;
    userModel.createNewUser(fbId, accessToken, function(user){
        res.jsonp(user);  
    });
}

exports.retrieveAccessToken = function(req, res, next) {
    var apiKey = req.apiKey;
    userModel.getAccessToken(apiKey, function(accessToken) {
        req.accessToken = accessToken;
        next();
    });
}
