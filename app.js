var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

// var Mongoose = require('mongoose');
// var mongoUri = process.env.MONGOHQ_URL ||
//   'mongodb://localhost/mongofb';
// var db = Mongoose.createConnection(mongoUri);

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(express.logger('dev'));
// support for JSON-encoded bodies and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(allowCrossDomain);
app.use(app.router);
app.use(express.limit('50mb'));

// development only
//if ('development' == app.get('env')) {
//  app.use(express.errorHandler());
//}

require('./routes/routes')(app);
app.use(express.static(path.join(__dirname, 'public')));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
