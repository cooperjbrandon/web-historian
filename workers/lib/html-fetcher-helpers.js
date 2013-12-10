var http = require('http-request');
var fs = require('fs');
var path = require('path');
var dir = path.join(__dirname, "../../data/sites/"); // tests will need to override this.
console.log(dir);

exports.readUrls = function(filePath, cb){
  fs.readFile(filePath, function(err, data) {
    if (err) { throw err ;}
    data = data + "";
    var urls = data.split("\n");
    cb(urls);
  });
};

exports.downloadUrls = function(urls){
  for (var i = 0 ; i < urls.length - 1 ; i++){
    exports.fetchSite(urls[i]);
  }
};

exports.fetchSite = function(url){
  console.log('->' + url);
  http.get(url, function (err, res) {
    console.log(dir+url);
    fs.writeFile(dir + url, res.buffer + "",'utf8');
  });
};