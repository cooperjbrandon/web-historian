var path = require('path');
var halp = require('./http-helpers');
module.exports.datadir = path.join(__dirname, "../data/sites.txt"); // tests will need to override this.




module.exports.handleRequest = function (req, res) {
  if (req.method === 'POST') {
    halp.getData(req);
  } else if (req.method === 'GET') {
    //file lookup
    console.log('hi');
  }
};

