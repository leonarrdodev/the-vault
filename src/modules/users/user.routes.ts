import { FastifyInstance } from "fastify";
import { createHash, timingSafeEqual } from "node:crypto";
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

    app.post('/login', async (request, reply) => {
        const {username, password} = request.body as any

        try{
            const query = `
                SELECT id, salt, password_hash
                FROM users
                WHERE username = ?
                LIMIT 1
            `

            const values = [username]
            
            const user = await new Promise<any>((resolve, reject) => {
                db.get(query, values, (err, row) => {
                    if (err) {
                        reject(err); 
                    } else {
                        resolve(row); 
                    }
                });
            });

           
            if (!user) {
                return reply.status(401).send({ message: 'Credenciais inválidas' });
            }

            const masterKey = await deriveKey(password, user.salt);
            
            const loginHash = createHash('sha256').update(masterKey).digest('hex');

            const hashBufferEntrada = Buffer.from(loginHash, 'hex');
            const hashBufferBanco = Buffer.from(user.password_hash, 'hex');

            if (hashBufferEntrada.length !== hashBufferBanco.length || !timingSafeEqual(hashBufferEntrada, hashBufferBanco)) {
                return reply.status(401).send({ message: 'Credenciais inválidas' });
            }
            
            const token = app.jwt.sign({
                id: user.id,
                username: user.username
            }, {
                expiresIn: '2h'
            })

            return reply.status(200).send({
                message: 'Login realizado com sucesso!',
                token: token
            })
            

        } catch(err: any){
            app.log.error(`Erro ao logar: ${err.message}`)
            return reply.status(400).send({message: 'Falha ao realizar login'})
        }

    })
}