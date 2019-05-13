// Daily Deal

// Supported node versions include: v7.6.x, v8.x, v9.x, v10.15.x, v11.x
// npm install --save @optimizely/optimizely-sdk request request-promise

const readline = require('readline');
const assert = require('assert');
const request = require('request-promise');
const DEBUG_TEXT_ON = '[DEBUG: Feature \x1b[36mON\x1b[0m]';
const DEBUG_TEXT_OFF = '[DEBUG: Feature \x1b[33mOFF\x1b[0m]';
let cmdLineOpen = true;

// The Optimizely SDK provides APIs to control features and run experiments
const optimizelySDK = require('@optimizely/optimizely-sdk');

// The datafile is a JSON file that gets updated everytime you update your data in the Optimizely UI!
// The datafile contains all the necessary information for the SDK to run features and experiments.
const DATAFILE_URL = 'https://cdn.optimizely.com/onboarding/OlVMTITAR8G7Xx85fR4M-w.json';


function getVisitorExperience(optimizely, visitor) {
  let text;

  // In the Optimizely UI, we have defined a feature called 'purchase_option'
  // For a given userId, isFeatureEnabled will return whether the feature is
  // enabled for that given userId.
  const isFeatureEnabled = optimizely.isFeatureEnabled('purchase_option', visitor.userId)

  if (isFeatureEnabled) {
    // Within the 'purchase_option' feature, we have defined a variable called 'message'
    // In the Optimizely UI, you can setup a feature test to test different values for this 'message' string
    text = optimizely.getFeatureVariableString('purchase_option', 'message', visitor.userId)

    if (visitor.purchasedItem) {
      optimizely.track('purchased_item', visitor.userId);
    }
  } else {
    text = 'Daily deal: A bluetooth speaker for $99!';
  }

  return {
    text: text,
    isEnabled: isFeatureEnabled,
    debugText: isFeatureEnabled ? DEBUG_TEXT_ON : DEBUG_TEXT_OFF,
  };
}

async function main(datafile) {

  // Initialize the SDK with the latest version of the datafile
  const optimizelyClientInstance = optimizelySDK.createInstance({
    datafile: datafile,
  });

  // Simulate 10 visitors.
  const visitors = [
    { userId: 'alice',   },
    { userId: 'bob',     },
    { userId: 'charlie', },
    { userId: 'don',     },
    { userId: 'eli',     },
    { userId: 'fabio',   },
    { userId: 'gary',    },
    { userId: 'helen',   },
    { userId: 'ian',     },
    { userId: 'jill',    },
  ];

  // Clear Console
  const emptyLines = visitors.map((visitor, i) => ({ text: '...' }))
  process.stdout.write('\x1Bc');
  console.log('Welcome to Daily Deal, we have great deals!');
  console.log('Let\'s see what the visitors experience!\n');
  await printLines(emptyLines, { isAsync: false, debug: false })
  readline.cursorTo(process.stdin, 0, 3)

  // For each visitor, let's see what experience they get!
  const variations = visitors.map((visitor, i) => {
    return getVisitorExperience(optimizelyClientInstance, visitor)
  });

  // Count how many visitors had the feature enabled
  const onVariations = variations.reduce((accum, value) => {
    return (value.isEnabled) ? accum + 1 : accum
  }, 0)

  await printLines(variations, { isAsync: true, debug: onVariations > 0 })

  // Count what experience each visitor got
  const freqMap = variations.reduce((accum, value) => {
    accum[value.text] = accum[value.text] ? accum[value.text] + 1 : 1;
    return accum;
  }, {});

  let total = visitors.length;
  let percentage = Math.round(onVariations / total * 100);

  if (onVariations > 0) {
    console.log(`\n${onVariations} out of ${total} visitors (~${percentage}%) had the feature enabled.\n`)

    Object.keys(freqMap).forEach((text) => {
      let perc = Math.round(freqMap[text] / total * 100);
      console.log(`${freqMap[text]} visitors (~${perc}%) got the experience: \'${text}\'`)
    })
  }

  console.log('\nUpdate the feature from the tutorial and this app will show the updated visitor\'s experiences!\n')
}

function startApp() {
  let currentDatafile = {}
  function pollForDatafile() {
    const datafileURL = {uri: DATAFILE_URL, json: true, gzip:true};

    // Request the datafile every second. If the datafile has changed
    // since the last time we've seen it, then call our main method again
    // with the newest datafile!
    request(datafileURL)
      .then(async (latestDatafile) => {
        try {
          assert.deepEqual(currentDatafile, latestDatafile)
        } catch (err) {

          // The datafile is different! Let's rerun our main function with the new datafile
          // Make sure we aren't currently logging to the console to avoid overwriting ourselves
          if (cmdLineOpen) {
            cmdLineOpen = false;
            currentDatafile = latestDatafile;
            await main(latestDatafile);
            cmdLineOpen = true;
          }
        }
      })
      .catch((err) => (console.log(`\nAn error occurred when running the application: ${err}. Be sure to use a supported node version! Supported versions include: v7.6.x, v8.x, v9.x, v10.15.x, v11.x`)))
  }

  setInterval(pollForDatafile, 1000);
}

startApp();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function printLines(experiences, options) {
  let i = 1;
  for (experience of experiences) {
    let preText = 'Visitor #' + i + ': ';
    let line = options.debug
      ? experience.debugText + ' ' + experience.text
      : experience.text

    await printLine(preText, line, options.isAsync)
    i++;
  }
}

async function printLine(preText, line, isAsync = false) {
  let logPromise = new Promise((resolve, reject) => {
    readline.clearLine(process.stdin, 0);
    rl.write(preText)
    if (isAsync) {
      setTimeout(() => {
        rl.write(line + '\n');
        resolve();
      }, 500)
    } else {
      rl.write(line + '\n');
      resolve();
    }
  });
  return logPromise;
}