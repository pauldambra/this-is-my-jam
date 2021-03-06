"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var templates = require("./templates");
var AWSXRay = require("aws-xray-sdk");
var untracedAWSSDK = require("aws-sdk");
var last_stored_toot_1 = require("../poll-for-jams/last-stored-toot");
var get_twitter_oembed_1 = require("./get-twitter-oembed");
var AWS = AWSXRay.captureAWS(untracedAWSSDK);
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
var s3 = new AWS.S3({ apiVersion: '2006-03-01' });
var cloudfront = new AWS.CloudFront({ apiVersion: '2019-03-26' });
var updateHtmlFile = function (sortedToots, fileName) { return __awaiter(void 0, void 0, void 0, function () {
    var mostRecent, tootHTML, decodedHTML, indexHTML, uploadParams, invalidationParams, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mostRecent = sortedToots[0];
                return [4 /*yield*/, get_twitter_oembed_1.oEmbedHTML(mostRecent.user, mostRecent.id)];
            case 1:
                tootHTML = _a.sent();
                decodedHTML = tootHTML.html.replace(/\\"/g, '"').replace(/\n/g, '');
                console.log({ from: tootHTML.html, to: decodedHTML }, 'change in embed html');
                indexHTML = templates.htmlPage(decodedHTML);
                _a.label = 2;
            case 2:
                _a.trys.push([2, 5, , 6]);
                uploadParams = {
                    Bucket: process.env.WEB_BUCKET,
                    Key: fileName,
                    ContentType: 'binary',
                    Body: Buffer.from(indexHTML, 'binary')
                };
                return [4 /*yield*/, s3.putObject(uploadParams).promise()];
            case 3:
                _a.sent();
                invalidationParams = {
                    DistributionId: process.env.CLOUDFRONT_DISTRIBUTION,
                    InvalidationBatch: {
                        CallerReference: "index-invalidation-" + new Date().toISOString(),
                        Paths: {
                            Quantity: 1,
                            Items: [
                                "/" + fileName
                            ]
                        }
                    }
                };
                return [4 /*yield*/, cloudfront.createInvalidation(invalidationParams).promise()];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                e_1 = _a.sent();
                throw new Error("could not write to s3 bucket (" + process.env.WEB_BUCKET + "): " + JSON.stringify(e_1));
            case 6: return [2 /*return*/];
        }
    });
}); };
module.exports.generate = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var Items, byDate, byUser, _i, _a, _b, key, value;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!process.env.TOOT_TABLE_NAME || !process.env.WEB_BUCKET || !process.env.CLOUDFRONT_DISTRIBUTION) {
                    console.log("must provide env variables:\n    toot table: " + process.env.TOOT_TABLE_NAME + "\n    web bucket: " + process.env.WEB_BUCKET + "\n    cloudfront distribution: " + process.env.CLOUDFRONT_DISTRIBUTION);
                    return [2 /*return*/, {
                            statusCode: 400
                        }];
                }
                return [4 /*yield*/, docClient.scan({
                        TableName: process.env.TOOT_TABLE_NAME
                    }).promise()];
            case 1:
                Items = (_c.sent()).Items;
                byDate = last_stored_toot_1.sortToots(Items);
                return [4 /*yield*/, updateHtmlFile(byDate, 'index.html')];
            case 2:
                _c.sent();
                byUser = byDate.reduce(function (acc, curr) {
                    if (!acc[curr.user]) {
                        acc[curr.user] = [];
                    }
                    acc[curr.user].push(curr);
                    return acc;
                }, {});
                _i = 0, _a = Object.entries(byUser);
                _c.label = 3;
            case 3:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                _b = _a[_i], key = _b[0], value = _b[1];
                console.log(key + ": " + value);
                if (!(value instanceof Array && value.length > 0)) return [3 /*break*/, 5];
                return [4 /*yield*/, updateHtmlFile(value, key + ".html")];
            case 4:
                _c.sent();
                _c.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6: return [2 /*return*/, {
                    statusCode: 200
                }];
        }
    });
}); };
