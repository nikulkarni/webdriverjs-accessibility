/**
 * Created by nikulkarni on 8/20/17.
 */
var accessibility = require('../');
const webdriver = require('selenium-webdriver');
const fs = require('fs');
var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();
driver.get('http://www.netflix.com')
    .then(function () {
        accessibility.runAccessibilityAudit(webdriver, driver).then(function (results) {
            console.log(results.results);
            driver.takeScreenshot().then(function (screenImg) {
                fs.writeFile('screenshot.png', screenImg, {
                    'encoding': 'base64'
                }, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Successfully took screenshot');
                    }
                });
            });
        });
    });
