const webdriver = require('selenium-webdriver');

const fs = require('fs');
const request = require('request');

const debug = require('debug');
const log = debug('accessibility:log');
const async = require('async');


module.exports = {

    runAccessibilityAudit: function (wd, driver) {
        var finalObject = {};
        const d = wd.promise.defer();
        async.waterfall([
            function (callback) {
                request('https://raw.githubusercontent.com/GoogleChrome/' +
                    'accessibility-developer-tools/stable/dist/js/axs_testing.js', function (error, response, accessibilityScript) {
                    log('error:', error); // Print the error if one occurred
                    log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    // console.log('body:', accessibilityScript); // Print the HTML for the Google homepage.
                    callback(null, accessibilityScript);
                });
            },
            function (script, callback) {
                doDriverStuff(driver, script, function (acc_results) {
                    results = acc_results;
                    finalObject.results = acc_results;
                    log('done with acc results', acc_results);
                    callback(null, acc_results);
                });
            },
            function (acc_results, callback) {
                driver.executeScript('return $.active;').then(function () {
                    log('jQuery already present');
                    callback(null, acc_results);
                }, function errCallback(err) {
                    request('http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js', function (err, response, body) {
                        driver.executeScript(body).then(function () {
                            callback(null, acc_results);
                        });
                    });
                });
            },
            function (results, callback) {
                if (results.errors.length == 0) {
                    log('No errors');
                    callback(null, results);
                } else {
                    log('marking errors');
                    decorate(driver, results.errors, 'red', function () {
                        callback(null, results);
                    });
                }
            },
            function (results, callback) {
                if (results.warnings.length == 0) {
                    log('No warnings');
                    callback(null);
                } else {
                    log('marking warnings');
                    decorate(driver, results.warnings, 'yellow', function () {
                        callback(null, results);
                    });
                }
            },
            function (results, callback) {
                driver.takeScreenshot().then(function (screenImg) {
                    finalObject.screenshot = screenImg;
                    log('Successfully took screenshot');
                    callback(null, finalObject);
                }, function (err) {
                    callback(err, null);
                });
            },
        ], function (err, result) {
            if (err) {
                log('Error', err);
                d.reject(err);
            } else {
                d.fulfill(finalObject);
            }
        });
        return d;
    }

};

function decorate(driver, errorsOrWarnings, color, cb) {
    var i = 0;
    log('Total ', errorsOrWarnings.length);
    async.whilst(
        function () {
            return i < errorsOrWarnings.length;
        }, function (callback) {
            var elements = errorsOrWarnings[i].elements;
            var j = 0;
            while (j < elements.length) {
                var element = elements[j];
                var locator = "$(\"" + element + "\").css(\"border\",\"5px solid " + color + "\");";
                log('decorating ', locator);
                driver.executeScript(locator);
                j++;
            }
            if (j == elements.length) {
                i++;
                callback(null, i);
            }
        }, function (err, i) {
            cb();
        }
    );
}
var runAuditScript = 'var results = axs.Audit.run();' +
    'return axs.Audit.createReport(results);';

function doDriverStuff(driver, accessibilityScript, cb) {

    driver.executeScript(accessibilityScript);
    driver.executeScript(runAuditScript).then(function (accessibilityErrors) {
        log(accessibilityErrors);
        log("------------------------------------")

        var index = 0;
        var result;
        // var keysToScan = [/Error:/gi, /Warning:/gi];
        var keysToScan = [/Warning:/gi, /Error:/gi];
        var warnings = [], errors = [];


        //looks beautiful, doesn't it?
        keysToScan.forEach(function (key) {
            while ((result = key.exec(accessibilityErrors))) {
                index = result.index;
                var warning = {};
                var error = {};
                var endingIndex = accessibilityErrors.indexOf('\n\n', index);
                var groupedResult = accessibilityErrors.substring(index, endingIndex);
                var name = groupedResult.substring(0, groupedResult.indexOf('\n'));
                var element_start = groupedResult.indexOf('\n') + 1;
                var element;
                if (groupedResult.indexOf("See") > 0) {
                    element = groupedResult.substring(element_start, groupedResult.indexOf("See"));
                    link = groupedResult.substring(groupedResult.indexOf("See"));
                } else {
                    element = groupedResult.substring(element_start);
                }
                var locators = element.trim().split("\n");

                if (key.toString().indexOf('Warning') > 0) {
                    warning.name = name;
                    warning.link = link;
                    warning.elements = locators;
                    warnings.push(warning);
                } else {
                    error.name = name;
                    error.link = link;
                    error.elements = locators;
                    errors.push(error);
                }
            }
        });
        cb({errors: errors, warnings: warnings})
    });
}