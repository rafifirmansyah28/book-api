import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function initDB() {
    db = await open({
        filename: './books.db',
        driver: sqlite3.Database
    });

    await db.exec(`CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT
    )`);
}

export function getDB() {
    return db;
}