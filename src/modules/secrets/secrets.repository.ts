import { db } from '../../core/db/database'

export const secretsRepository = {
    async getUserSalt(userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const query = `SELECT salt FROM users WHERE id = ? LIMIT 1`
            db.get(query, [userId], (err, row) => {
                if (err) reject(err)
                else resolve(row)
            })
        })
    },

    async saveSecret(userId: string, title: string, encryptedData: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO secrets (user_id, title, encrypted_data) VALUES (?, ?, ?)`
            db.run(query, [userId, title, encryptedData], function(err) {
                if (err) reject(err)
                else resolve()
            })
        })
    },

    async getSecretsByUser(userId: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const query = `SELECT id, title FROM secrets WHERE user_id = ?`
            db.all(query, [userId], function(err, rows) {
                if (err) reject(err)
                else resolve(rows)
            })
        })
    },

    async getEncryptedDataById(secretId: string, userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const query = `SELECT encrypted_data FROM secrets WHERE id = ? AND user_id = ? LIMIT 1`
            db.get(query, [secretId, userId], (err, row) => {
                if (err) reject(err)
                else resolve(row)
            })
        })
    }
}