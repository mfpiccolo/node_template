(async function justDoIt() {
  let seconds = 3;

  const printOutArgs = (arr) => {
    /*eslint-disable*/
    console.log(...arr);
    /*eslint-enable*/
  };

  const countdown = (resolve) => {
    if (seconds === 0) {
      return resolve();
    }
    /*eslint-disable*/
    console.log(seconds--);
    /*eslint-enable*/
    setTimeout(() => {
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
}());
