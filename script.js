const { Builder, By, Key } = require('selenium-webdriver');
const { readFile, appendFileSync } = require('fs');

const regex = /[0-9]{8}/g;

readFile('/home/ondrejsvoren/Downloads/test.txt', 'utf-8', async (err, data) => {
  if (err) throw err;
  const pmIDs = data.match(regex);

  for (const [index, pmID] of pmIDs.entries()) {
    try {
      await download(pmID);
      console.log(`File with PMID: ${pmID} downloaded successfully - ${index + 1}/${pmIDs.length}.`);
      appendFileSync(
        '/home/ondrejsvoren/Downloads/output.log',
        `File with PMID: ${pmID} downloaded successfully - ${index + 1}/${pmIDs.length}.`);
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
      await driver.sleep(3000);
      await driver.quit();
      resolve();
    } catch (e) {
      appendFileSync('/home/ondrejsvoren/Downloads/output.log',`ERROR: Unable to find article with PMID: ${input}.\n`);
      await driver.quit();
      reject();
    }
  });
}
