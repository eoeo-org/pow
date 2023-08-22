import debug from 'debug'
const debug__ErrorHandler = debug('voiceRead.js:ErrorHandler')

import type { ReadableStream as NodeJSReadableStream } from 'node:stream/web'

export class ResponseError extends Error {
  constructor(
    message: string,
    public response: Response,
  ) {
    super(message)
    console.log(this.response.status)
  }
}

export async function fetchAudioStream(
  text: string,
  speaker: string,
  pitch: number,
  speed: number,
) {
  const response = await fetch('https://api.voicetext.jp/v1/tts', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${process.env.VOICETEXT_API_KEY}:`),
    },
    body: new URLSearchParams({
      text,
      speaker,
      pitch: pitch.toString(),
      speed: speed.toString(),
      format: 'mp3',
    }),
  })

  if (!response.ok) {
    debug__ErrorHandler(
      `Error while requesting audio: ${response.status} ${response.statusText}`,
    )
    throw new ResponseError('Error while requesting audio.', response)
  }
  // lib.dom.d.ts の型を参照しやがるため、その対策
  return response.body as NodeJSReadableStream<Uint8Array>
}
