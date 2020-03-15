"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var head = function () {
    return "<head>\n      <meta charset=\"utf-8\">\n      <meta name=\"viewport\" content=\"width=device-width\">\n      <title>JS Bin</title>\n    </head>";
};
var footer = function () {
    return "<footer>\n        <p>Made by <a href=\"twitter.com/pauldambra\">Paul D'Ambra</a> See <a href=\"https://github.com/pauldambra/this-is-my-jam\">the code on Github</a> </p> <a rel=\"license\" href=\"http://creativecommons.org/licenses/by-sa/4.0/\"><img alt=\"Creative Commons Licence\" style=\"border-width:0\" src=\"https://i.creativecommons.org/l/by-sa/4.0/88x31.png\" /></a><br />This work is licensed under a <a rel=\"license\" href=\"http://creativecommons.org/licenses/by-sa/4.0/\">Creative Commons Attribution-ShareAlike 4.0 International License</a>.\n      </footer>";
};
var header = function () {
    return "<header>\n          <h1>\n            This is our Jams\n          </h1>\n      </header>";
};
var cards = function (toots) {
    return "<article class=\"card\">\n                       <p>" + JSON.stringify(toots, function (key, value) {
        return typeof value === 'bigint'
            ? value.toString()
            : value;
    } // return everything else unchanged
    ) + "</p>\n                    </article>\n     \n        <article class=\"card\">\n                       <p>content for card two</p>\n                </article>\n     \n    <article class=\"card\">\n                      <p>content for card three</p>\n                </article>\n     \n    <article class=\"card\">\n                       <p>content for card four</p>\n                </article>  ";
};
var content = function (toots) {
    return "        <div id=\"content\">\n          <div class=\"centered\">\n             <section class=\"cards\"> " + cards(toots) + " </section>\n          </div>\n        </div>";
};
exports.htmlPage = function (toots) {
    return "\n    <!DOCTYPE html>\n    <html>\n    " + head() + "\n      <body>\n        <div id=\"wrapper\">\n          " + header() + "\n          " + content(toots) + "\n          " + footer() + "\n        </div>\n      </body>\n    </html>\n  ";
};
