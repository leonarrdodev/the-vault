import { FastifyInstance } from "fastify";
import { db }from '../../core/db/database'
import { deriveKey, encrypt } from '../../core/crypto/crypto.service'

export async function secretRoutes(app: FastifyInstance){
    //intercepta qualquer requisição para verificar se possui o JWT
    app.addHook('onRequest', async (request, reply) => {
        try{
            await request.jwtVerify()
        } catch(err){
            return reply.status(401).send({message: 'Acesso negado ou Token inválido'})
        }
    })   

    //rota para salvar segredo
    app.post('/', async (request, reply) => {
        const {id: userId} = request.user as any
        const {title, secretValue, masterPassword} = request.body as any


        try{
            const queryGetSalt = `
                SELECT salt
                FROM users
                WHERE id = ? 
                LIMIT 1
            `

            const valueGetSalt = [userId]

            const salt = await new Promise<any>((resolve, reject) => {
                db.get(queryGetSalt, valueGetSalt, (err, row) => {
                    if(err){
                        reject(err)
                    } else {
                        resolve(row)
                    }
                })
            })

            if(!salt){
                return reply.status(401).send({message: 'Usuario não encontrado'})
            }

            const masterKey = await deriveKey(masterPassword, salt.salt)

            const encryptedData = encrypt(secretValue, masterKey)

            //salvar no banco
            const querySaveDb = `
                INSERT INTO secrets (user_id, title, encrypted_data)
                VALUES (?, ?, ?)
            `
            const valueSaveDb = [userId, title, encryptedData]

            await new Promise<void>((resolve, reject) => {
                db.run(querySaveDb, valueSaveDb, function(err) {
                    if(err){
                        reject(err)
                    } else{
                        resolve()
                    }
                })
            })

            return reply.status(201).send({message: 'Segredo salvo com sucesso!'})
        } catch(err: any){
            app.log.error(`Erro ao criar segredo: ${err.message}`)
            return reply.status(500).send({message: 'Falha ao criar segredo!'})
        }
    })
}