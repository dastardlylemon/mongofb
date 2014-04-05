var userModel = require('../models/userModel.js');

exports.retrieveAccessToken = function(req, res, next) {
    var apiKey = req.apiKey;
    userModel.getAccessToken(apiKey, function(accessToken) {
        req.accessToken = accessToken;
        next();
    });
}
