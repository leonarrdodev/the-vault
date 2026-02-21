import sqlite3 from "sqlite3";
const sqlite = sqlite3.verbose()

export const db = new sqlite.Database('./vault.db', (err) => {
    if(err){
        return console.error('Falha no banco de dados', err.message)
    }
        return console.log('Conexão com o SQLite estabelecida')

})

export function initDB(){
    db.serialize(() => {
        db.run('PRAGMA foreign_keys = ON;')
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL
            )    
        `)

        db.run(`
            CREATE TABLE IF NOT EXISTS secrets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                title TEXT NOT NULL,
                encrypted_data VARCHAR(255)NOT NULL
            )
            `)
    })
}