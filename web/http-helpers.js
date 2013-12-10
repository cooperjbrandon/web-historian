var path = require('path');
var fs = require('fs');
var qs = require('querystring');
var rq = require('./request-handler');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host : 'localhost',
  user : 'root'
});

connection.connect();


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
  fs.readFile(folder + asset, 'utf8', function(err, data) {
    html += data;
    if (err){
      res.writeHead(404, headers);
    } else{
      res.writeHead(200, headers);
    }
    res.end(html);
  });
};

exports.writeData = function(data){
  url = qs.parse(data).url;
  connection.query('insert into archive.runList (url) values ('+ connection.escape(url)+ ')');
  // fs.appendFile(rq.datadir, url + '\n');
};

// As you go through, keep thinking about what helper functions you can put here!
exports.checkReadWrite = function(res, folder, asset) {
  var html = '';
  var url = qs.parse(asset).url;
  connection.query('select * from archive.runList WHERE url = ' + connection.escape(url), function(err,rows){
    if (err){
        exports.writeData(asset);
        res.writeHead(302, headers);
        exports.serveStaticAssets(res, path.join(__dirname, "./public/"), "index.html");
    } else {
        console.log(rows[0].ID);
        connection.query('select * from archive.webHistory WHERE runID = ' + rows[0].ID + ' ORDER BY created DESC LIMIT 1', function(err, data) {
          if (err){
            console.log(err);
          } else {
            console.log(data);
            res.writeHead(200, headers);
            res.end(data[0].data);
          }
        });
      }
  });
  // fs.readFile(folder + qs.parse(asset).url, 'utf8', function(err, data) {
  //   html += data;
  //   if (err){
  //     exports.writeData(asset);
  //     res.writeHead(302, headers);
  //     exports.serveStaticAssets(res, path.join(__dirname, "./public/"), "index.html");
  //   } else{
  //     res.writeHead(200, headers);
  //     res.end(html);
    // }
  // });
};

exports.getNewSites = function(res){
  fs.readFile(path.join(__dirname,"../data/") + "sites.txt", function(err, data) {
    if (err) { throw err ;}
    data = data + "";
    var urls = data.split("\n");
    res.writeHead(200, headers);
    res.end(JSON.stringify(urls));
  });
};