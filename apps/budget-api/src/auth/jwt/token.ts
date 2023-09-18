import { sign } from 'jsonwebtoken'
import { JwtPayload } from './jwt.stategy'
import { config } from '../../config/config'

const { jwtSecret, expirationTime } = config.jwt

export const createJwtToken = async (
  token: string,
): Promise<{ accessToken: string; expiresIn: number }> => {
  const payload: JwtPayload = { token }
  const expiresIn = 60 * 60 * 24
  const accessToken = sign(payload, jwtSecret, { expiresIn: expirationTime })
  return {
    accessToken,
    expiresIn,
  }
}
