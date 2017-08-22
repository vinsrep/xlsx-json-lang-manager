xlsxj = require("./index");
  xlsxj({
    input: "sample/sample.csv", 
    outputdir: "sample",
    objectLevel: 3,
    numberOfLanguages: 3,
    allowDuplicateValues: true
  }, function(err, result) {
    if(err) {
      console.error(err);
    }else {
      //console.log("Resource JSON files created successfully.");
    }
  });