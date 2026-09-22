import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
    'database',
    (): TypeOrmModuleOptions => {
        console.log('DEBUG ENV DB_HOST:', process.env.DB_HOST);
        console.log('DEBUG ENV DB_SSL:', process.env.DB_SSL);
        return {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'fintrack_db',
            schema: process.env.DB_SCHEMA || 'fintrack-labs',
            autoLoadEntities: true,
            synchronize: false,
            logging: process.env.NODE_ENV === 'development',
            ssl:
                process.env.DB_SSL === 'true'
                    ? { rejectUnauthorized: false }
                    : false,
        }
    },
);