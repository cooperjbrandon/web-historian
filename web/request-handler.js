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
      console.log('url');
      halp.checkReadWrite(res, path.join(__dirname, "../data/sites/"), url);
    });
  } else if (req.method === 'GET') {
    var ext = path.extname(req.url);
    console.log(req.url);
    var folder = "";
    if (req.url === '/') {
      folder = './public/';
      req.url = 'index.html';
    }else if ( ext === '.html' || ext === '.css' || ext === '.js' || ext === '.jpg'){
      folder = './public/';
    } else if (ext === ""){
      if (req.url === "/newsites"){
        halp.getNewSites(res);
      } else {
        res.writeHead(404, halp.headers);
        res.end();
      }
      return;
    }else {
      folder = "../data/sites/";
    }
    halp.serveStaticAssets(res, path.join(__dirname, folder),  req.url);
  }
};
