"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var untracedHttps = require("https");
var AWSXRay = require("aws-xray-sdk");
var https = AWSXRay.captureHTTPs(untracedHttps, false);
var buildRequest = function (tootUser, tootID) {
    return {
        hostname: 'publish.twitter.com',
        port: 443,
        path: "/oembed?url=https%3A%2F%2Ftwitter.com%2F" + tootUser + "%2Fstatus%2F" + tootID + "&dnt=true",
        method: 'GET',
        headers: {}
    };
};
exports.oEmbedHTML = function (tootUser, tootId) {
    var options = buildRequest(tootUser, tootId);
    console.log(options, 'options for oembed');
    return new Promise(function (resolve, reject) {
        var req = https.request(options, function (res) {
            res.setEncoding('utf8');
            var rawData = '';
            res.on('data', function (chunk) { return (rawData += chunk); });
            res.on('end', function () {
                try {
                    console.log(rawData, 'before parseing oembed');
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
