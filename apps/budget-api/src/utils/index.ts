import {randomBytes, scrypt as _scrypt} from "crypto";
import {promisify} from "util";

const scrypt = promisify(_scrypt);

export const hashPassword = async (password: string): Promise<string> => {
    const salt = randomBytes(8).toString('hex')

    const hash = ( await scrypt(password, salt, 32) ) as Buffer

    return `${hash.toString('hex')}.${salt}`
}

export const verifyPassword = async (passwordHash: string, password: string): Promise<boolean> => {
    const [storedHash, salt] = passwordHash.split('.')

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    return storedHash === hash.toString('hex')
}