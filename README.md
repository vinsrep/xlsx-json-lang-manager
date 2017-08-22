# xlsx-json-lang-manager

Easy way to manage language files in one place using xslx/csv.

````
Sample xlsx file in 'sample\sample.xslx'
````
## Install

```
  npm install xlsx-json-lang-manager
```

## Usage

```javascript
  xlsxj = require("xlsx-json-lang-manager");
  xlsxj({
    input: "sample.xlsx", 
    outputdir: "./output",
    objectLevel: 3,
    numberOfLanguages: 3,
    allowDuplicateValues: true
  }, function(err, result) {
    if(err) {
      console.error(err);
    }else {
      console.log(result);
    }
  });
```


## License

MIT [@Vinmj](https://github.com/Vinmj/xlsx-json-lang-manager)


