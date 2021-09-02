const debug__Queue = require("debug")("utils.js:Queue");
const { EventEmitter } = require("events");

exports.getProperty = property => object => object[property];

const awaitEvent = exports.awaitEvent = (eventEmitter, event, validate = () => true) => new Promise(resolve => {
  const callback = (...args) => {
    if (validate(...args)) {
      eventEmitter.off(event, callback);
      resolve(event, ...args);
    }
  };
  eventEmitter.on(event, callback);
});

exports.Queue = class Queue extends EventEmitter {
  constructor(consumer) {
    super();

    if (typeof consumer !== 'function') throw new RangeError();
    this.consumer = consumer;
    this.items = [];

    (async () => {
      debug__Queue("starting event loop");
      while (true) {
        debug__Queue(`items.length: ${this.items.length}`);
        if (this.items.length === 0) {
          debug__Queue("awaiting new_item");
          await awaitEvent(this, "new_item");
          debug__Queue("new_item resolved");
        }
        debug__Queue("awaiting consumer");
        await Promise.race([
          awaitEvent(this, "purge").then(() => debug__Queue("queue purged, continuing")),
          this.consumer(this.items.shift())
        ]);
        debug__Queue("consumer resolved");
      }
    })();
  }

  add(item) {
    this.items.push(item);
    this.emit("new_item");
  }

  purge() {
    this.items.splice(0, this.items.length);
    this.emit("purge");
  }
}
