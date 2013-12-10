var path = require('path');
var halp = require('./http-helpers');
module.exports.datadir = path.join(__dirname, "../data/sites.txt"); // tests will need to override this.




module.exports.handleRequest = function (req, res) {
  if (req.method === 'POST') {
    url = "";
    req.on('data',function(data, err){
      if (err) { throw err; }
      url += data;
    });
    req.on('end', function(){
      halp.writeData(url);
      res.writeHead(302, halp.headers);
      res.end();
    });
  } else if (req.method === 'GET') {
    var ext = path.extname(req.url);
    var folder = "";
    if (req.url === '/') {
      folder = './public/';
      req.url = 'index.html';
    }else if ( ext === '.html' || ext === '.css' || ext === '.js' || ext === '.jpg'){
      folder = './public/';
    } else{
      folder = "../data/sites/";
    }
    halp.serveStaticAssets(res, path.join(__dirname, folder),  req.url);
  }
};
