var fs = require('fs');
var xlsx = require('xlsx');
var cvcsv = require('csv');
var mergeJSON = require("merge-json");
var colors = require("colors");

exports = module.exports = XLSX_json;

function XLSX_json (config, callback) {
  if(!config.input) {
    console.error("Failed To Create Resource JSON files, Details:\nPlease provide details of input file".red.bold);
    process.exit(1);
  }
  var cv = new CV(config, callback);
}

function CV(config, callback) {
  var wb = this.load_xlsx(config.input)
  var ws = this.ws(config, wb);
  var csv = this.csv(ws)
  this.cvjson(csv, config.outputdir, callback, config.objectLevel, config.numberOfLanguages, config.allowDuplicateValues? true: false)
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

CV.prototype.cvjson = function (csv, outputdir, callback, objectLevel, numberOfLanguages, allowDuplicateValues) {
    var langs = [];
    var nameArray = [];
    var nameHash = {};
    var valueHash = {};
    var valueArray = [];
    var throughError = false;
    var criticalError = false;
    var errorMsg = "Failed To Create Resource JSON files, Details: ";
    try {
    cvcsv().from.string(csv)
      .on('record', function (row, index) {
          row.splice((objectLevel + numberOfLanguages))
          if (index === 0) {
              row.splice(0, objectLevel);
              row.forEach(function (element, ln) {
                    if(element.trim().length > 0){
                      langs.push(element);
                    }
                    else{
                      errorMsg += "\nLanguage name not specified at column "+(objectLevel + ln+1)+"."
                      criticalError = true;
                      throughError = true;
                    }
              }, this);
          }
          else if(!criticalError && row.join("").trim().length > 0) {
              var arryName = row.splice(0, objectLevel);
              var temploopError = false;
              arryName.forEach(function(ee){
                if(temploopError) return;
                if((ee+"").trim().length === 0 ){
                  throughError = true;
                  temploopError = true;
                  errorMsg += "\nAll the object fields should have value at line " + (index + 1)+ ".";
                  return;
                }
              })
              if(nameHash[arryName]){
                throughError = true;
                errorMsg += "\nObject name hierarchy repeated at line " + (index + 1)+ ".";
              }
              else{
                nameHash[arryName] = index + 1;
              }
              nameArray.push(arryName);
              row.forEach(function(ee, langin){
                if((ee+"").trim().length === 0 ){
                  throughError = true;
                  errorMsg += "\n" + langs[langin] + " should have a value at line " + (index + 1)+ ".";
                }
              })
              if(!allowDuplicateValues){
                if(valueHash[row[0]]){
                  throughError = true;
                  errorMsg +=  "\nValue is repeated at line " + (index + 1) + ", Refer line " + valueHash[row[0]] + ".";
                }
                else{
                  valueHash[row[0]] = index + 1;
                }
              }
              valueArray.push(row);
          }
      })
      .on('end', function (count) {
          if(throughError){
            console.log(errorMsg.red.bold);
            return;
          }
          for (var m = 0; m < langs.length; m++) {
              var result = {};
              nameArray.forEach(function (element, index) {
                  var temp = undefined;
                  for(var j=1; j<=element.length; j++){
                    var sobj = {};
                    var itemNum = element.length - j;
                    sobj[element[itemNum]] = temp? temp:valueArray[index][m];
                    if(itemNum == 0){
                      result = mergeJSON.merge(result, sobj);
                    }
                    else{
                      temp = sobj;
                    }
                  }
              });
              var output = outputdir + "/" + langs[m] + ".json";
              if (output !== null) {
                  var stream = fs.createWriteStream(output, { flags: 'w' });
                  stream.write(JSON.stringify(result, null, '\t'));
                  if (m === langs.length - 1) {
                      console.log("Resorce JSON files created successfully.".green.bold)
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
    catch(ex){

    }
}
