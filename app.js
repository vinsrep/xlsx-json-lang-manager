xlsxj = require("./index");
  xlsxj({
    input: "sample/sample.xlsx", 
    outputdir: "sample"
  }, function(err, result) {
    if(err) {
      console.error(err);
    }else {
      console.log("Success");
    }
  });