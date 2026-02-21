import 'dotenv/config'
import { buildApp } from "./app";
import { initDB } from './core/db/database';


//verifica se esta em desenvolvimento ou em produção para ativar a formatação de logs no terminal
const envLogger = process.env.NODE_ENV === 'development'
    ?{
         transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'SYS:HH:HM:ss',
                ignore: 'pid,hostname'
            }
        },
        level: process.env.LOG_LEVEL || 'info'
    }
    : true


const app = buildApp({
    logger: envLogger

})

const start = async () => {
    try {
        //usa-se parseInt pois tudo que é carregado do .env vem como string
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
        const host = process.env.HOST || '0.0.0.0'
        initDB()


        await app.listen({port, host})

    } catch(err){
        app.log.error(err)
        process.exit(1)
    }
}

start()