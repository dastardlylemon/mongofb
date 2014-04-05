var Mongoose = require('mongoose');
var uuid = require('node-uuid');
var graph = require('fbgraph');

var db = Mongoose.connection;
db.on('error',console.error);
db.once('open', function() {
    // Create your schemas and models here.
    // wtf is this danduan?
    // shouldn't the rest of the code be in here?
});

var mongoUri = process.env.MONGOHQ_URL || 'mongodb://localhost/mydb';
Mongoose.connect(mongoUri);

var userModelSchema = new Mongo.Schema({
    fbId : {
        type : String,
        required : true,
        unique: true
    },
    apiKey : {
        type : String,
        required : true,
        unique: true
    },
    accessToken : {
        type : String,
        required : true
    },
    expiresAt : {
        type : Number,
        required : true
    },
    machineId : {
        type : String,
        required : true
    }
});

var users = Mongoose.model('users', userModelSchema); 

// Searches through user collection and finds user with
// given apiKey. Calls the callback function with
// access token as argument.
exports.getAccessToken = function(apiKey, callback) {
    users.findOne({apiKey:apiKey}, function(err, user) {
        if (err) {
            console.log(err);
            return;
        } else {
            // Checks to see if stored access token is still valid
            if (Date.now()/1000 > user.expiresAt) {
                // Requests new access token
                graph.extendAccessToken({
                    "access_token": user.accessToken,
                    "client_id": process.env.FB_CLIENT_ID,
                    "client_secret": process.env.FB_CLIENT_SECRET 
                }, function(err, res) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    user.accessToken = res.access_token;
                    user.expiresAt = Date.now()/1000 + res.expires_in;     
                    // Updates user with new access token
                    user.save(function(err, user){
                        if (err) {
                            console.log(err);
                            return;
                        } else {
                            callback(user.accessToken);
                        }
                    })
                });
            } else {
                callback(user.accessToken);
            }
        }
    });
};

exports.createNewUser = function(fbId, accessToken, callback) {
    graph.setAccessToken(access_token); 
    graph.extendAccessToken({
        "access_token": accessToken,
        "client_id": process.env.FB_CLIENT_ID,
        "client_secret": process.env.FB_CLIENT_SECRET 
    }, function(err, res){
        var longAccessToken = res.access_token;
        var expiresAt = Date.now()/1000 + res.expires_in;
        var user = new users({
            fbId : fbId,
            apiKey : uuid.v1(),
            accessToken : longAccessToken,
            expiresAt : expiresAt,
            machineId : res.machine_id
        });
        user.save(function(err, user) {
            if (err) {
                console.log(err);
                return;
            } else {
                callback(user);
            }
        });
    });
};
