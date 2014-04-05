var userModel = require('../models/userModel.js');

exports.getAccessToken = function(apiKey, callback) {
    userModel.getAccessToken(apiKey, callback);
}
