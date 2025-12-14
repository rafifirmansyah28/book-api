/* eslint-disable no-undef */
import request from 'supertest';
import app from '../../src/app.js';
import { initDB, getDB } from '../../src/db.js';

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await initDB();
});

afterEach(async () => {
    const db = getDB();
    await db.run('DELETE FROM books');
});

describe('Books API Integration', () => {
    test('POST /books - should add a new book', async () => {
        const res = await request(app)
            .post('/books')
            .send({ title: 'Atomic Habits', author: 'James Clear' });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('Atomic Habits');
    });

    test('GET /books - should return books', async () => {
        const db = getDB();
        await db.run('INSERT INTO books (title, author) VALUES (?, ?)', ['The Lean Startup', 'Eric Ries']);

        const res = await request(app).get('/books');
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });
});

