const { Builder, By, Key } = require('selenium-webdriver');
const { readFile, appendFileSync } = require('fs');

// Global variables
const REGEXP = /[0-9]{8}/g;
const DEFAULT_TIMEOUT = 3000;
const DEFAULT_INPUT_FILE = 'input.txt';
const DEFAULT_OUTPUT_FILE = 'output.log';

const args = processArgs();
if (args === undefined) {
  return;
}

readFile(args['-i'] || DEFAULT_INPUT_FILE, 'utf-8', async (err, data) => {
  if (err) throw err;
  const pmIDs = data.match(REGEXP);

  for (const [index, pmID] of pmIDs.entries()) {
    try {
      await download(pmID);
      console.log(`File with PMID: ${pmID} downloaded successfully - ${index + 1}/${pmIDs.length}.`);
      appendFileSync(
        args['-o'] || DEFAULT_OUTPUT_FILE,
        `File with PMID: ${pmID} downloaded successfully - ${index + 1}/${pmIDs.length}.\n`);
    } catch (e) {
      console.error(`ERROR: Unable to download file with PMID: ${pmID}.`);
    }
  }
});

async function download(input) {
  let driver = await new Builder().forBrowser('chrome').build();
  return new Promise(async (resolve, reject) => {
    try {
      await driver.get('https://sci-hub.tw/');
      await driver.findElement(By.name('request')).sendKeys(input, Key.ENTER);
      await driver.findElement(By.linkText('⇣ save')).click();
      await driver.sleep(args['-t'] || DEFAULT_TIMEOUT);
      await driver.quit();
      resolve();
    } catch (e) {
      appendFileSync(args['-o'] || DEFAULT_OUTPUT_FILE,`ERROR: Unable to find article with PMID: ${input}.\n`);
      await driver.quit();
      reject();
    }
  });
}

// returns input arguments map
function processArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: $ node script.js -i [inputFilePath] -o [outputFilePath] -t [sleepTimeout]');
    return;
  }

  const inputArgs = args.reduce((acc, arg, i) => {
    switch(arg) {
      case '-i':
        const inputFilePath = args[i + 1];
        return {
          ...acc,
          ['-i']: inputFilePath
        };
      case '-o':
        const outputFilePath = args[i + 1];
        return {
          ...acc,
          ['-o']: outputFilePath
        };
      case '-t':
        const sleepTimeout = args[i + 1];
        return {
          ...acc,
          ['-t']: sleepTimeout
        };
      case '-h':
        console.log('Usage: $ node script.js -i [inputFilePath] -o [outputFilePath] -t [sleepTimeout]');
        return;
      default:
        return acc;
    }
  }, {});

  if (inputArgs !== undefined) {
    return inputArgs;
  }
}

