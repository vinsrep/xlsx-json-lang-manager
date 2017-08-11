var fs = require('fs');
var xlsx = require('xlsx');
var cvcsv = require('csv');
var mergeJSON = require("merge-json") ;

exports = module.exports = XLSX_json;

function XLSX_json (config, callback) {
  if(!config.input) {
    console.error("You miss a input file");
    process.exit(1);
  }
  var cv = new CV(config, callback);
}

function CV(config, callback) {
  var wb = this.load_xlsx(config.input)
  var ws = this.ws(config, wb);
  var csv = this.csv(ws)
  this.cvjson(csv, config.outputdir, callback)
}

CV.prototype.load_xlsx = function(input) {
  return xlsx.readFile(input);
}

CV.prototype.ws = function(config, wb) {
  var target_sheet = config.sheet;
  if (target_sheet == null)
    target_sheet = wb.SheetNames[0];
  ws = wb.Sheets[target_sheet];
  
  return ws;
}

CV.prototype.csv = function(ws) {
  return csv_file = xlsx.utils.make_csv(ws)
}

CV.prototype.cvjson = function (csv, outputdir, callback) {
    var langs = [];
    var objectLevel = 0;
    var nameArray = [];
    var valueArray = [];
    var result = {};
    cvcsv().from.string(csv)
      .on('record', function (row, index) {
          if (index === 0) {
              row.forEach(function (element) {
                  if (element.indexOf('Object') === 0) {
                      objectLevel++;
                  }
                  else {
                      langs.push(element);
                  }
              }, this);
          }
          else {
              nameArray.push(row.splice(0, objectLevel));
              valueArray.push(row);
          }
      })
      .on('end', function (count) {
          for (var m = 0; m < langs.length; m++) {
              var tempNameArray = [];
              nameArray.forEach(function (element) {
                  tempNameArray.push(element.slice())
              })
              var elementsArray = [];
              tempNameArray.forEach(function (element, index) {
                  var obj = {};
                  obj[element[element.length - 1]] = valueArray[index][m];
                  element.pop();
                  elementsArray.push(obj);

                   var temp = undefined;
                  while (element.length) {
                      var obj = {};
                      obj[element[element.length - 1]] = temp? temp:elementsArray[index];
                      if (element.length == 1) {
                          result = mergeJSON.merge(result, obj);
                      }
                      else {
                          temp = obj;
                      }
                      element.pop();
                  }
                    
              })
              // tempNameArray.forEach(function (element, index) {
              //     var temp = undefined;
              //     while (element.length) {
              //         var obj = {};
              //         obj[element[element.length - 1]] = temp? temp:elementsArray[index];
              //         if (element.length == 1) {
              //             result = mergeJSON.merge(result, obj);
              //         }
              //         else {
              //             temp = obj;
              //         }
              //         element.pop();
              //     }
              // });
              var output = outputdir + "/" + langs[m] + ".json";
              if (output !== null) {
                  var stream = fs.createWriteStream(output, { flags: 'w' });
                  stream.write(JSON.stringify(result, null, '\t'));
                  if (m == langs.length - 1) {
                      callback(null, result);
                  }
              } else {
                  callback(null, result);
              }
          }

      })
      .on('error', function (error) {
          console.error(error.message);
      });
}
