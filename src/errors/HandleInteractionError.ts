import { PowError } from './PowError.js'

export const HandleInteractionErrorType = {
  userNotJoined: 'このコマンドを実行するには、VCに参加している必要があります。',
  cannotJoined: 'このVCに参加する権限がありません。',
  noWorker: '参加させられるBotが居ません。',
  userNotWithBot: 'BOTと同じVCに参加している必要があります。',
} as const

type ErrorType =
  (typeof HandleInteractionErrorType)[keyof typeof HandleInteractionErrorType]

export class HandleInteractionError extends PowError {
  override name = 'コマンド実行エラー'
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(message: ErrorType) {
    super(message)
  }
}
