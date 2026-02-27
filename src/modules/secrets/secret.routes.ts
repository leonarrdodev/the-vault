import { FastifyInstance } from "fastify";
import { deriveKey, encrypt, decrypt } from '../../core/crypto/crypto.service'
import { secretsRepository } from './secrets.repository'

// tipagens
interface JwtUser {
    id: string;
}

interface SaveSecretBody {
    title: string;
    secretValue: string;
    masterPassword: string;
}

interface RevealSecretParams {
    id: string;
}

interface RevealSecretBody {
    masterPassword: string;
}

export async function secretRoutes(app: FastifyInstance){
    
    app.addHook('onRequest', async (request, reply) => {
        try{
            await request.jwtVerify()
        } catch(err){
            return reply.status(401).send({message: 'Acesso negado ou Token inválido'})
        }
    })   

    app.post<{ Body: SaveSecretBody }>('/', async (request, reply) => {
        const { id: userId } = request.user as JwtUser
        const { title, secretValue, masterPassword } = request.body

        try{
            const saltRow = await secretsRepository.getUserSalt(userId)

            if(!saltRow){
                return reply.status(401).send({message: 'Usuario não encontrado'})
            }

            const masterKey = await deriveKey(masterPassword, saltRow.salt)
            const encryptedData = encrypt(secretValue, masterKey)

            await secretsRepository.saveSecret(userId, title, encryptedData)

            return reply.status(201).send({message: 'Segredo salvo com sucesso!'})
        } catch(err: any){
            app.log.error(`Erro ao criar segredo: ${err.message}`)
            return reply.status(500).send({message: 'Falha ao criar segredo!'})
        }
    })

    // Buscar segredos
    app.get('/', async (request, reply) => {
        const { id: userId } = request.user as JwtUser
        
        try{
            const secrets = await secretsRepository.getSecretsByUser(userId)
            return reply.status(200).send(secrets)
        } catch(err: any){
            app.log.error(`Erro ao buscar segredos: ${err.message}`)
            return reply.status(500).send({message: 'Falha ao buscar segredos'})
        }
    })

    app.post<{ Params: RevealSecretParams, Body: RevealSecretBody }>('/:id/reveal', async (request, reply) => {
        const { id: userId } = request.user as JwtUser
        const { id: secretId } = request.params
        const { masterPassword } = request.body

        try{
            const saltRow = await secretsRepository.getUserSalt(userId)

            if(!saltRow){
                return reply.status(401).send({message: 'Usuario não encontrado'})
            }

            const encryptedRow = await secretsRepository.getEncryptedDataById(secretId, userId)

            if(!encryptedRow){
                return reply.status(401).send({message: 'Segredo não encontrado'})
            }

            const masterKey = await deriveKey(masterPassword, saltRow.salt)
            const unlockedData = decrypt(encryptedRow.encrypted_data, masterKey)

            return reply.status(200).send({secret: unlockedData})
        } catch(err: any){
            app.log.error(`Erro ao buscar segredo: ${err.message}`)
            return reply.status(401).send({message: 'Senha incorreta ou falha ao destrancar'})
        }
    })
}