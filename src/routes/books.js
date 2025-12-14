import express from 'express';
import { getDB } from '../db.js';

const router = express.Router();

// GET /books
router.get('/', async (req, res) => {
    const db = getDB();
    const books = await db.all('SELECT * FROM books');
    res.json(books);
});

// POST /books
router.post('/', async (req, res) => {
    const { title, author } = req.body;
    const db = getDB();
    const result = await db.run('INSERT INTO books (title, author) VALUES (?, ?)', [title, author]);
    res.status(201).json({ id: result.lastID, title, author });
});

export default router;