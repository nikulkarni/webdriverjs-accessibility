webdriverjs-accessibility
=======================

webdriverjs-accessibility is a node.js library that helps  run accessibility audits using [webdriverjs][1] and [GoogleChrome accessibility-developer-tools][2]. 

webdriverjs-accessibility relies on [GoogleChrome accessibility-developer-tools][2] to run the audit. Once the audit run is complete, the library returns an object which contains accessibility results. The tool also takes a screenshot of webpage under tests and marks errors and warnings. 
Currently errors are bordered with red and warnings with yellow. The screenshot object is also returned as part of the returning object. See more details below. 

This project is decoupled from Webdriver project in the sense that user would need to pass along a WebDriver object.


## How to use

Include the library in your project

```bash
npm install webdriverjs-accessibility --save-dev
```

```javascript
   const accessibility = require('webdriverjs-accessibility');
   const webdriver = require('selenium-webdriver');
   const fs = require('fs');
   const driver = new webdriver.Builder()
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
                           console.log('Successfully took screen shot');
                       }
                   });
               });
           });
       });
```

### Logging
For more logging just set environment variable `DEBUG=accessibility*` before running the tests

### API
runAccessibilityAudit(webdriver, driver)

`@argument webdriver` Please check [here](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html)
`
@argument driver` Please check [here](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_ThenableWebDriver.html)

`@returns {Promise} resolves to an Object {results: {error: errors, warning: warnings}, screenshot:byte[]}`

### Example
Please check the example [here](example/accessibilityTest.js)

### Sample Accessibility Object (`result.results`)

```javascript
{ errors: 
   [ { name: 'Error: AX_TEXT_01 (Controls and media elements should have labels) failed on the following element:',
       link: 'See https://github.com/GoogleChrome/accessibility-developer-tools/wiki/Audit-Rules#-ax_text_01--controls-and-media-elements-should-have-labels for more information.',
       elements: [Array] } ],
  warnings: 
   [ { name: 'Warning: AX_FOCUS_01 (These elements are focusable but either invisible or obscured by another element) failed on the following element:',
       link: 'See https://github.com/GoogleChrome/accessibility-developer-tools/wiki/Audit-Rules#-ax_focus_01--these-elements-are-focusable-but-either-invisible-or-obscured-by-another-element for more information.',
       elements: [Array] },
     { name: 'Warning: AX_TEXT_02 (Images should have an alt attribute) failed on the following elements (1 - 3 of 3):',
       link: 'See https://github.com/GoogleChrome/accessibility-developer-tools/wiki/Audit-Rules#-ax_text_02--images-should-have-an-alt-attribute-unless-they-have-an-aria-role-of-presentation for more information.',
       elements: [Array] } ] 
}

```

### Sample Screenshot with errors and warnings (`result.screenshot`)
![Screen shot](accessibility.png?raw=true)


## Contributing:

Fork the project and submit pull request if you like to add a feature/fix bugs etc. 
Disclaimer: I am no accessibility expert. I am open for suggestions.

## Issues

Please provide necessary details to reproduce the issue and open them as appropriate

## Credits

Excellent API by [GoogleChrome accessibility-developer-tools][2] 

## Contact

Twitter: [@nileshdk](https://twitter.com/nileshdk)

Email: nilesh.cric@gmail.com

[1]: https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs "webdriverjs"
[2]: https://github.com/GoogleChrome/accessibility-developer-tools "GoogleChrome accessibility-developer-tools"