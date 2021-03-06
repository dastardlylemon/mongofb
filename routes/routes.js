var graph = require('fbgraph');

module.exports = function(app) {

    var queryController = require('../controllers/queryController');
    var userController = require('../controllers/userController');
    var facebookController = require('../controllers/facebookController');

    app.post('/users', userController.createNewUser);

    //app.get('/query', queryController.parse, userController.retrieveAccessToken, facebookController.doSomething);

    app.get('/testquery', queryController.tester, userController.retrieveAccessToken, facebookController.queryHelper);

    app.get('/api/v1', queryController.tester, userController.retrieveAccessToken, facebookController.queryHelper);

    //app.get('/testfacebook', userController.retrieveAccessToken, facebookController.testFacebook);

}
