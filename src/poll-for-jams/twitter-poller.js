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
var get_twitter_bearer_token_1 = require("../twitter-api/get-twitter-bearer-token");
var search_twitter_1 = require("../twitter-api/search-twitter");
var last_stored_toot_1 = require("./last-stored-toot");
var AWSXRay = require("aws-xray-sdk");
var untracedAWSSDK = require("aws-sdk");
var AWS = AWSXRay.captureAWS(untracedAWSSDK);
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
var noKeyAvailable = { key: 'no-key', secretKey: 'no-key' };
var getTwitterAccessKey = function () { return process.env.TWITTER_ACCESS ? JSON.parse(process.env.TWITTER_ACCESS) : noKeyAvailable; };
var bearerToken;
var twitterAccess;
exports.handle = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, lastTootTableName, lastTootId, sinceId, searchResults, toSave, writes, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                twitterAccess = twitterAccess || getTwitterAccessKey();
                _a = bearerToken;
                if (_a) return [3 /*break*/, 2];
                return [4 /*yield*/, get_twitter_bearer_token_1.getBearerToken(twitterAccess)];
            case 1:
                _a = (_b.sent());
                _b.label = 2;
            case 2:
                bearerToken = _a;
                if (!process.env.LAST_TOOT_TABLE_NAME || !process.env.LAST_TOOT_ID || !process.env.TOOT_TABLE_NAME) {
                    console.log("must receive necessary environment variables. \n    last toot table name: " + process.env.LAST_TOOT_TABLE_NAME + " and\n    toot id: " + process.env.LAST_TOOT_ID + " and\n    toot table: " + process.env.TOOT_TABLE_NAME);
                    return [2 /*return*/];
                }
                lastTootTableName = process.env.LAST_TOOT_TABLE_NAME;
                lastTootId = process.env.LAST_TOOT_ID;
                return [4 /*yield*/, last_stored_toot_1.getLastTootStored(lastTootTableName, docClient, lastTootId)];
            case 3:
                sinceId = _b.sent();
                return [4 /*yield*/, search_twitter_1.searchTwitter(bearerToken, sinceId)];
            case 4:
                searchResults = _b.sent();
                console.log("loaded " + searchResults.statuses.length + " toots");
                _b.label = 5;
            case 5:
                _b.trys.push([5, 8, , 9]);
                toSave = searchResults.statuses
                    .filter(function (s) { return s.entities.urls.length > 0; })
                    .filter(function (s) { return s.entities.hashtags.some(function (ht) { return ht.text.toLowerCase() === 'thisismyjam'; }); })
                    .map(function (s) {
                    console.log(s.user, 'user');
                    return {
                        id: s.id_str,
                        user: s.user.screen_name,
                        timestamp: new Date(s.created_at).toISOString(),
                        toot: JSON.stringify(s)
                    };
                });
                writes = toSave
                    .map(function (ts) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, docClient.put({
                                TableName: process.env.TOOT_TABLE_NAME,
                                Item: ts
                            }).promise()];
                    });
                }); });
                return [4 /*yield*/, Promise.all(writes)];
            case 6:
                _b.sent();
                return [4 /*yield*/, last_stored_toot_1.setLastTootStored(process.env.LAST_TOOT_TABLE_NAME, docClient, process.env.LAST_TOOT_ID, toSave)];
            case 7:
                _b.sent();
                return [3 /*break*/, 9];
            case 8:
                e_1 = _b.sent();
                console.error(e_1);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); };
