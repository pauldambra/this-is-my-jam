"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var untracedHttps = require("https");
var AWSXRay = require("aws-xray-sdk");
var https = AWSXRay.captureHTTPs(untracedHttps, false);
var buildSearchRequest = function (bearerToken, sinceId) {
    var authHeader = "Bearer " + bearerToken.access_token;
    var sinceParam = sinceId ? "&since_id=" + sinceId : '';
    // will eventually have since_id parameter to page from last toot processed
    return {
        hostname: 'api.twitter.com',
        port: 443,
        path: "/1.1/search/tweets.json?result_type=recent&q=%23ThisIsMyJam" + sinceParam,
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            Authorization: authHeader
        }
    };
};
exports.searchTwitter = function (bearerToken, sinceId) {
    var options = buildSearchRequest(bearerToken, sinceId);
    return new Promise(function (resolve, reject) {
        var req = https.request(options, function (res) {
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
        });
        req.on('error', function (error) { return reject(error); });
        req.end();
    });
};
