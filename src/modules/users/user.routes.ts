import { FastifyInstance } from "fastify";
import { createHash } from "node:crypto";
import { generateSalt, deriveKey } from '../../core/crypto/crypto.service'
import { db } from "../../core/db/database";

export function userRoutes(app: FastifyInstance){
    app.post('/register', async (request, reply) => {
        const {username, password} = request.body as any

        try{
            const salt = generateSalt()
            const masterKey = await deriveKey(password, salt)
            const passwordHash = createHash('sha256').update(masterKey).digest('hex')
            const query = `
                    INSERT INTO users (username, password_hash, salt)
                    VALUES (?, ?, ?)
                `
            const values = [username, passwordHash, salt]
    
            await new Promise<void>((resolve, reject) => {
               db.run(query, values, function (err){
                if(err){
                    reject(err)
                } else{
                    resolve()
                }
               })
            })

            return reply.status(201).send({message: 'Cofre criado com sucesso!'})
        } catch(error: any){
            app.log.error(`Erro ao criar usuario: ${error.message}`)
            return reply.status(400).send({message: 'Falha ao criar usuario. Talvez o username ja exista'})
        }

    })
}