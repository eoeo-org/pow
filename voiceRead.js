const debug__GuildContext    = require("debug")("voiceRead.js:GuildContext");
const debug__Queue           = require("debug")("voiceRead.js:Queue");
const debug__GuildCtxManager = require("debug")("voiceRead.js:GuildCtxManager");
const debug__initialize      = require("debug")("voiceRead.js:initialize");

const axios = require("axios");
const { awaitEvent, getProperty } = require("./utils");
const { EventEmitter } = require("events");
const axiosOptions = {
  auth: {
    username: process.env.VOICETEXT_API_KEY
  },
  responseType: 'stream'
};

let client;

class Queue extends EventEmitter {
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

class GuildContext {
  constructor(guild) {
    this.guild = client.guilds.resolve(guild);
    this.readQueue = new Queue(this._readMessage.bind(this));

    this.cleanChannels();
  }

  async _readMessage(audio) {
    if (this.connection === null) return;
    const dispatcher = this.connection.play(audio);
    debug__GuildContext("read started");
    await awaitEvent(dispatcher, 'speaking', state => state === 0);
    debug__GuildContext("read finished");
  }

  cleanChannels() {
    this.textChannel  = null;
    this.voiceChannel = null;
    this.connection   = null;
  }

  isJoined() {
    return this.textChannel  !== null
        && this.voiceChannel !== null
        && this.connection   !== null
        && this.connection.status !== 4;
  }

  async join(textChannel, voiceChannel) {
    if (this.isJoined()) return;

    this.textChannel = this.guild.channels.resolve(textChannel);
    this.voiceChannel = this.guild.channels.resolve(voiceChannel);
    this.connection = await this.voiceChannel.join();

    this.connection.once("disconnect", () => {
      this.leave();
    });
  }

  leave() {
    this.readQueue.purge();
    this.voiceChannel.leave();

    this.cleanChannels();
  }

  addMessage(message) {
    if (!this.isJoined()) return false;

    const params = new URLSearchParams({
      format: "mp3",
      text: message,
      speaker: "haruka"
    });

    debug__GuildContext("fetching audio");
    axios
      .post("https://api.voicetext.jp/v1/tts", params, axiosOptions)
      .then(getProperty("data"))
      .then(audio => {
        debug__GuildContext("got response, adding to queue");
        this.readQueue.add(audio);
      })
      .catch((error) => {
        debug__GuildContext(`error, status code: ${error.response.status}`);
        this.textChannel.send(`はい${error.response.status}！ｗ`);
      });
  }
}

class GuildCtxManager extends Map {
  get(guild) {
    debug__GuildCtxManager("getting context object");
    guild = client.guilds.resolve(guild);
    if (this.has(guild.id)) {
      debug__GuildCtxManager("using already created one");
      return super.get(guild.id);
    }

    debug__GuildCtxManager("not found, creating");
    const guildContext = new GuildContext(guild);
    if (!guildContext.guild) {
      debug__GuildCtxManager("wrong guild");
      return;
    }
    this.set(guild.id, guildContext);
    return guildContext;
  }
}

exports.initialize = c => {
  debug__initialize("initializing GuildCtxManager");
  client = c;
  exports.guilds = new GuildCtxManager();
};

