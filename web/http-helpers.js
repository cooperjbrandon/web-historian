var path = require('path');
var fs = require('fs');
var qs = require('querystring');
var rq = require('./request-handler');
var mysql = require('mysql');
var webRoot = path.join(__dirname, './public/');
exports.conn = mysql.createConnection({
  host : 'localhost',
  user : 'root'
});

exports.conn.connect();

var contentType = {
  ".css" : "text/css",
  ".html" : "text/html",
  ".js" : "text/javascript"
};

exports.headers = headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "text/html"
};
exports.serveStaticAssets = function(res, folder, asset) {
  //Write some code here that helps serve up your static files!
  //(Static files are things like html (yours or arhived from others...), css, or anything that doesn't change often.)
  var html = '';
  var ext = path.extname(asset);
  fs.readFile(folder + asset, 'utf8', function(err, data) {
    html += data;
    var head = contentType[ext] || headers;
    if (err){
      res.writeHead(404, head);
    } else{
      res.writeHead(200, head);
    }
    res.end(html);
  });
};

exports.writeData = function(url){
  exports.conn.query('insert into archive.runList (url) values ('+ exports.conn.escape(url)+ ')');
  // fs.appendFile(rq.datadir, url + '\n');
};

// As you go through, keep thinking about what helper functions you can put here!
exports.findSite = function(url, res, responseCodes) {
  var html = '';
  exports.conn.query('select * from archive.runList WHERE url = ' + exports.conn.escape(url), function(err,rows){
    if (err || !rows[0]){
      console.log(rows);
      //if errror querieng then for post case we'll write Data
      if (responseCodes[1] === 302) { exports.writeData(url); }
      res.writeHead(responseCodes[1], headers);
      exports.serveStaticAssets(res, webRoot, "index.html");
    } else {
      exports.conn.query('select * from archive.webHistory WHERE runID = ' + rows[0].ID + ' ORDER BY created DESC LIMIT 1', function(err, data) {
        if (err || !data[0]){
          res.writeHead(responseCodes[1], headers);
          res.end('this page is in the archive queue');
        } else {
          res.writeHead(responseCodes[0], headers);
          res.end(data[0].data);
        }
      });
    }
  });
};

exports.getFromDB = function(req, res) {
  exports.findSite(req.url.slice(1), res, [200, 404]);
};


exports.getNewSites = function(res){
  exports.conn.query('select * from archive.runList ORDER BY ID DESC LIMIT 10', function(err, data){
    res.writeHead(200, headers);
    res.end(JSON.stringify(data));
  });
};

exports.handlePost = function(req,res){
  url = "";
  req.on('data',function(data, err){
    if (err) { throw err; }
    url += data;
  });
  req.on('end', function(){
    url = qs.parse(url).url;
    if (!url) {
      res.writeHead(404,headers);
      res.end();
      return;
    }
    exports.findSite(url, res, [200, 302] );
  });
};
exports.getFromFile = function(req,res){
  exports.serveStaticAssets(res,webRoot,req.url);
};

exports.indexSiteListOr404 = function (req,res){
  if (req.url === '/') {
    exports.serveStaticAssets(res,webRoot,'index.html');
  } else if (req.url === '/newsites'){
    exports.getNewSites(res);
  } else {
    res.writeHead(404, headers);
    res.end("page not found");
  }
};


