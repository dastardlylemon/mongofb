var graph = require('fbgraph');
var query = require('../controllers/queryHandling');


module.exports = function(app) {

    //  var queryController = require('../controllers/queryController');
    var userController = require('../controllers/userController');
    var facebookController = require('../controllers/facebookController');

    app.post('/users', userController.createNewUser);

    app.get('/query', queryController.parse, userController.retrieveAccessToken, facebookController.doSomething);

    app.get('/testquery', query.tester, userController.retrieveAccessToken, facebookController.queryHelper);

    //app.get('/testfacebook', userController.retrieveAccessToken, facebookController.testFacebook);

}
