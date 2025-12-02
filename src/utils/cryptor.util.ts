import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

const SALT_OR_ROUNDS = 10

@Injectable()
export class CryptorUtil {
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_OR_ROUNDS)
  }

  comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }
}
