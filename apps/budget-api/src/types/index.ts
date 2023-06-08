type DbConfig = {
    host: string
    username: string
    password: string
    database: string
}
export interface Config {
    db: DbConfig
    jwtSecret: string
}