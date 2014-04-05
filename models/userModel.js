var Mongoose = require('mongoose');
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
    apiKey : {
        type : String,
        required : true
    },
    accessToken : {
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
            callback(user.accessToken);
        }
    });
}
