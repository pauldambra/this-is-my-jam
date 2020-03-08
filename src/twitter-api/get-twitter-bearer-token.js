"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var untracedHttps = require("https");
var AWSXRay = require("aws-xray-sdk");
var https = AWSXRay.captureHTTPs(untracedHttps, false);
var buildRequest = function (twitterAccess) {
    var k = encodeURIComponent(twitterAccess.key);
    var sk = encodeURIComponent(twitterAccess.secretKey);
    var encodedToken = Buffer.from(k + ":" + sk).toString('base64');
    var authHeader = "Basic " + encodedToken;
    var data = 'grant_type=client_credentials';
    var options = {
        hostname: 'api.twitter.com',
        port: 443,
        path: '/oauth2/token?grant_type=client_credentials',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Length': data.length,
            Authorization: authHeader
        }
    };
    return [data, options];
};
var processResponse = function (resolve, reject) { return function (res) {
    res.setEncoding('utf8');
    var rawData = '';
    res.on('data', function (chunk) { return (rawData += chunk); });
    res.on('end', function () {
        try {
            var parsedData = JSON.parse(rawData);
            resolve(parsedData);
        }
        catch (e) {
            reject(e);
        }
    });
}; };
exports.getBearerToken = function (twitterAccess) {
    var _a = buildRequest(twitterAccess), data = _a[0], options = _a[1];
    return new Promise(function (resolve, reject) {
        var req = https.request(options, processResponse(resolve, reject));
        req.on('error', function (error) { return reject(error); });
        req.write(data);
        req.end();
    });
};
