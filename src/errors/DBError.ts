import { PowError } from './PowError.js'

export class DBError extends PowError {
  override name = 'データベースエラー'
}
