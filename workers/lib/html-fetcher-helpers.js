var http = require('http');
var conn = require('../../web/http-helpers').conn;

exports.readUrls = function(cb){
  conn.query('select * from archive.runList', function(err, rows) {
    console.log(err + "readurls");
    if (err) throw err;
    cb(rows);
  });
};

exports.downloadUrls = function(rows){
  for (var i = 0 ; i < rows.length ; i++){
    exports.fetchSite(rows[i]);
  }
};

exports.fetchSite = function(row){
  var data = "";
  http.get({hostname:row.url}, function(res) {
    res.on("data", function(chunk) {
      data += chunk;
    });
    res.on("end",function(){
      conn.query('insert into archive.webHistory (runID, data) values (' + row.ID + ',' + conn.escape(data) +')',function(err){
        if (err) throw err;
      });
    });
  console.log("Got response: " + res.statusCode);
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
};