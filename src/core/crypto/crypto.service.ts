import { randomBytes, scrypt, createCipheriv, createDecipheriv } from "node:crypto";

export function generateSalt(): string{
    return randomBytes(16).toString('hex')
}

export function deriveKey(password: string, salt: string): Promise<Buffer>{
    return new Promise((resolve, reject) => {
        scrypt(password, salt, 32, (err, deriveKey) => {
            if(err){
                reject(err)
            }

            resolve(deriveKey)
        })
    })
}

export function encrypt(text: string, key: Buffer): string{
    const iv = randomBytes(12)

    const cipher = createCipheriv('aes-256-gcm', key, iv)

    let encryptedText = cipher.update(text, 'utf-8', 'hex') + cipher.final('hex')

    const authTag = cipher.getAuthTag().toString('hex')

    return `${iv.toString('hex')}:${authTag}:${encryptedText}`
}


export function decrypt(encryptedData: string, key: Buffer): string{
    const data = encryptedData.split(':')
    const ivHex = data[0]
    const authTagHex = data[1]
    const encryptedTextHex = data[2]

    const ivBuffer = Buffer.from(ivHex, 'hex')
    const authTagBuffer = Buffer.from(authTagHex, 'hex')

    const decipher = createDecipheriv('aes-256-gcm', key, ivBuffer)

    try{
        decipher.setAuthTag(authTagBuffer)
    
        const originalText = decipher.update(encryptedTextHex, 'hex', 'utf-8') + decipher.final('utf-8')
        return originalText
    } catch(err){
        throw new Error('Falha na decifragem:  dados corrompidos ou chave inválida')
    }


}
