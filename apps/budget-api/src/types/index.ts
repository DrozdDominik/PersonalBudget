type DbConfig = {
    host: string
    username: string
    password: string
    database: string
}

type JwtConfig = {
    jwtSecret: string
    expirationTime: number
}

export interface Config {
    db: DbConfig
    jwt: JwtConfig
}