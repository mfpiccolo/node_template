/* eslint-disable no-console */
async function liftoff() {
  let seconds = 3;

  const printOutArgs = (arr) => {
    console.log(...arr);
  };

  const countdown = (resolve) => {
    if (seconds === 0) {
      return resolve();
    }
    console.log(seconds--);
    return setTimeout(() => {
      countdown(resolve);
    }, 1000);
  };

  async function doTheCountdown() {
    return new Promise(resolve => {
      countdown(resolve);
    });
  }

  await doTheCountdown();
  printOutArgs('We have LIFTOFF!');
}

liftoff();
