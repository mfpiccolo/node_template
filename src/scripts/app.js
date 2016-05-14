/* eslint-disable no-console */
function liftoff() {
  let seconds = 3;

  const countdown = (resolve) => {
    if (seconds === 0) {
      return resolve();
    }
    console.log(seconds--);
    return setTimeout(() => {
      countdown(resolve);
    }, 1000);
  };

  function doTheCountdown() {
    return new Promise(resolve => {
      countdown(resolve);
    });
  }

  doTheCountdown().then(() => {
    console.log(...'We have LIFTOFF!');
  });
}

liftoff();
