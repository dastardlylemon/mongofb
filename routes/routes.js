var graph = require('fbgraph');
module.exports = function(app) {

    //  var queryController = require('../controllers/queryController');
    var userController = require('../controllers/userController');
    var facebookController = require('../controllers/facebookController');

    app.post('/users', userController.createNewUser);

    //app.get('/query', queryController.parse, userController.retrieveAccessToken, facebookController.doSomething);

    //app.get('/testfacebook', userController.retrieveAccessToken, facebookController.testFacebook);

}
