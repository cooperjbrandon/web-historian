var path = require('path');
var halp = require('./http-helpers');
module.exports.datadir = path.join(__dirname, "../data/sites.txt"); // tests will need to override this.
var router = {
  "GET" : {
    "" : halp.indexSiteListOr404,
    ".css" : halp.getFromFile,
    ".html" : halp.getFromFile,
    ".js" : halp.getFromFile
  },
  "POST" : {
    "" : halp.handlePost
  }
};

module.exports.handleRequest = function (req, res) {
  var ext = path.extname(req.url);
  var route = router[req.method][ext] || halp.getFromDB;
  route(req,res);
};