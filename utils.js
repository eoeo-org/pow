exports.getProperty = property => object => object[property];

exports.awaitEvent = (eventEmitter, event, validate = () => true) => new Promise(resolve => {
  const callback = (...args) => {
    if (validate(...args)) {
      eventEmitter.off(event, callback);
      resolve(event, ...args);
    }
  };
  eventEmitter.on(event, callback);
});

