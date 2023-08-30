import { PowError } from './PowError.js'

export class WorkerError extends PowError {
  override name = 'ワーカーエラー'
}

export class NotReadyWorkerError extends WorkerError {
  override message =
    'worker の準備が整っていません。十数秒後に再試行してください。'
}

export class NoWorkerError extends WorkerError {
  override message = '参加させられるBotが居ません。'
}
