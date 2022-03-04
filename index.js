var http = require('http');
var fs = require('fs');
const csv = require('csv-parser');

var server = http.createServer(function(req, res) {
  fs.createReadStream('test.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log(row['ACCOUNTNAME']);
    console.log(row['CITY']);
    console.log(row['CLICKTAG']);
  })
  .on('end', (e) => {
    console.log('CSV file successfully processed');
  });
});
server.listen(8000, function(req, res) {
  console.log('server listening to localhost 8000');
});