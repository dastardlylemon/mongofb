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

var tableModelSchema = new Mongoose.Schema({
    tableName : {
        type : String,
        required : true,
        unique : true
    },
    statusID : {
        type : String,
        required : true

    }
})

var userModelSchema = new Mongoose.Schema({
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
    tables : [tableModelSchema]

});


var users = Mongoose.model('users', userModelSchema); 

// Searches through user collection and finds user with
// given apiKey. Calls the callback function with
// access token as argument.
exports.getAccessToken = function(api, callback) {
    users.findOne({apiKey:api}, function(err, user) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log(user);
            console.log(err);
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
                    user.expiresAt = Date.now()/1000 + parseInt(res.expires);
                    console.log(res);
                    // Updates user with new access token
                    user.save(function(err, user){
                        if (err) {
                            console.log(err);
                            callback(undefined)
                            return;
                        } else {
                            console.log("User access token updated");
                            console.log(user);
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
    graph.setAccessToken(accessToken); 
    graph.extendAccessToken({
        "access_token": accessToken,
        "client_id": process.env.FB_CLIENT_ID,
        "client_secret": process.env.FB_CLIENT_SECRET 
    }, function(err, res){
        var expiresAt = Date.now()/1000 + parseInt(res.expires);
        var user = new users({
            fbId : fbId,
            apiKey : uuid.v1(),
            accessToken : res.access_token,
            expiresAt : expiresAt
        });
        user.save(function(err, res) {
            if (err) {
                if (err.code == 11000) {
                    users.findOne({fbId:fbId}, function(err,user) {
                        callback({
                            fbId : user.fbId,
                            apiKey : user.apiKey,
                            exists : true
                        });
                    });
                } else {
                    callback(undefined);
                }
            } else {
                callback({
                    fbId : res.fbId,
                    apiKey : res.apiKey
                });
            }
        });
    });
};

// Table methods

var tables = Mongoose.model('tables', tableModelSchema);

exports.createNewTable = function(apiKey, tableName, statusID, callback) {
    users.findOne({apiKey:apiKey}, function(err,user) {
        if (err) {
            // TODO: Catch error
        }
        var table = new tables({
            tableName : tableName,
            statusID : statusID 
        });    
        user.tables.push(table);
        user.save(function(err, res) {
            if (err) {
                // Catch error
            }
            if (callback) {
                callback();
            }
        });
    });
};

exports.retrieveStatusId = function(apiKey, collectionName, callback) {
    users.findOne({apiKey:apiKey}, function(err, user) {
        if (err) {
            // TODO: catch error
        }
        for (var i = 0; i<user.tables.length; i++) {
            if (user.tables[i].tableName == collectionName) {
                callback(user.tables[i].statusID); 
            }
        }
        callback(null);
    }); 
};
