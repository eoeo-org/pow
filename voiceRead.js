const debug__GuildContext = require("debug")("voiceRead.js:GuildContext");
const debug__initialize   = require("debug")("voiceRead.js:initialize");

const axios = require("axios");
const { Queue, awaitEvent, getProperty } = require("./utils");

let client;

class GuildContext {
  constructor(guild) {
    this.guild = client.guilds.resolve(guild);
    this.readQueue = new Queue(this._readMessage.bind(this));
    this.cleanChannels();
  }

  async _readMessage({ audioStream, message, convertedMessage }) {
    if (this.connection === null) return;
    const dispatcher = this.connection.play(audioStream);
    if (/[A-Z]/g.test(convertedMessage)) dispatcher.setVolume(10000);

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

  async addMessage(message, convertedMessage) {
    if (!this.isJoined()) return false;

    try {
      debug__GuildContext("fetching audio");
      const audioStream = await this._fetchAudioStream({
        text: convertedMessage,
        speaker: "haruka"
      });

      debug__GuildContext("got response, adding to queue");
      this.readQueue.add({ message, convertedMessage, audioStream });
    } catch(error) {
      debug__GuildContext(`error, status code: ${error.response.status}`);
      this.textChannel.send(`はい${error.response.status}！ｗ`);
    }
  }

  async _fetchAudioStream(params) {
    return await axios
      .post("https://api.voicetext.jp/v1/tts", new URLSearchParams({ ...params, format: "mp3" }), {
        auth: { username: process.env.VOICETEXT_API_KEY },
        responseType: 'stream'
      })
      .then(getProperty("data"));
  }
}

class GuildCtxManager extends Map {
  get(guild) {
    guild = client.guilds.resolve(guild);
    if (this.has(guild.id)) return super.get(guild.id);

    const guildContext = new GuildContext(guild);
    if (!guildContext.guild) return;
    this.set(guild.id, guildContext);
    return guildContext;
  }
}

exports.initialize = c => {
  debug__initialize("initializing GuildCtxManager");
  client = c;
  exports.guilds = new GuildCtxManager();
};
