// The exported functions in this module makes a call to Microsoft Cognitive Service Computer Vision API and return caption
// description if found. Note: you can do more advanced functionalities like checking
// the confidence score of the caption. For more info checkout the API documentation:
// https://www.microsoft.com/cognitive-services/en-us/Computer-Vision-API/documentation/AnalyzeImage

const request = require('request').defaults({ encoding: null });

//const VISION_URL = "https://api.projectoxford.ai/vision/v1.0/analyze/?visualFeatures=Ocr&form=BCSIMG&subscription-key=" + process.env.MICROSOFT_VISION_API_KEY;
const VISION_URL = "https://api.projectoxford.ai/vision/v1/ocr?language=unk&detectOrientation =true&subscription-key="+ process.env.MICROSOFT_VISION_API_KEY;

/** 
 *  Gets the caption of the image from an image stream
 * @param {stream} stream The stream to an image.
 * @return (Promise) Promise with caption string if succeeded, error otherwise
 */
exports.getCaptionFromStream = stream => {
    return new Promise(
        (resolve, reject) => {
            const requestData = {
                url: VISION_URL,
                encoding: 'binary',
                headers: { 'content-type': 'application/octet-stream' }
            };

            stream.pipe(request.post(requestData, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                else if (response.statusCode != 200) {
                    reject(body);
                }
                else { 
                    var sentence = " ";
                    var res = JSON.parse(body);
                    for(var i=0;i<res.regions[0].lines.length;i++){
                        for(var j=0;j<res.regions[0].lines[i].words.length;j++){
                            sentence += res.regions[0].lines[i].words[j].text + " ";
                        }
                    }
                    console.log(sentence);
                    resolve(extractWords(JSON.parse(body)));
                    
                }
            }));
        }
    );
}

/** 
 * Gets the caption of the image from an image URL
 * @param {string} url The URL to an image.
 * @return (Promise) Promise with caption string if succeeded, error otherwise
 */
exports.getCaptionFromUrl = url => {
    return new Promise(
        (resolve, reject) => {
            const requestData = {
                url: VISION_URL,
                json: { "url": url }
            };

            request.post(requestData, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                else if (response.statusCode != 200) {
                    reject(body);
                }
                else {
                    resolve(extractWords(body));
                }
            });
        }
    );
}

/**
 * Extracts the caption description from the response of the Vision API
 * @param {Object} body Response of the Vision API
 * @return {string} Description if caption found, null otherwise.
 */
const extractWords = res => {
    if (res && res.regions[0]) {
         var sentence = " ";
                    for(var i=0;i<res.regions[0].lines.length;i++){
                        for(var j=0;j<res.regions[0].lines[i].words.length;j++){
                            sentence += res.regions[0].lines[i].words[j].text + " ";
                        }
                    }
                    console.log(sentence);
        
        return sentence;
    }

    return null;
}