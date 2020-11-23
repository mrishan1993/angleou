witController = require('../controllers/witController');

const witRoute = {
  witProcess: {
    method: 'GET',
    path: '/hello',
    handler: witController.witProcessController,
  },
};

module.exports = witRoute;
