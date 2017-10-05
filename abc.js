var api = require("project-oxford-ocr-api");
var fs = require('fs');

api.API_KEY = '3b083744118a45adb8307e55c54b8004';
 
api.fromImageUrl({ url : "https://assets.entrepreneur.com/article/1440698865_graphic-quote-estee-lauder.jpg"}, (error,response,result) =>
{
   // console.log(result);
    console.log(result.getAllText());
    console.log(result.getTextByFlowDirection());
});