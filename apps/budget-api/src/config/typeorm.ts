import { registerAs } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "./config";

const { host, username, password, database } = config.db

const dbConfig = {
    type: 'mysql',
    host,
    port: 3306,
    username,
    password,
    database,
    entities: ["dist/**/*.entity{.ts,.js}"],
    migrations: ["dist/migrations/*{.ts,.js}"],
    autoLoadEntities: true,
    synchronize: false,
}

export default registerAs('typeorm', () => dbConfig)
export const connectionSource = new DataSource(dbConfig as DataSourceOptions);