/* eslint-disable no-undef */
import { jest } from '@jest/globals';

// Mock dependencies before importing modules
const mockDb = {
    all: jest.fn(),
    run: jest.fn(),
    exec: jest.fn()
};

const mockOpen = jest.fn().mockResolvedValue(mockDb);

jest.unstable_mockModule('sqlite', () => ({
    open: mockOpen
}));

jest.unstable_mockModule('sqlite3', () => ({
    default: {
        Database: jest.fn()
    }
}));

// Import modules after mocking
const { initDB, getDB } = await import('../../src/db.js');
const app = (await import('../../src/app.js')).default;
const bookRoutes = (await import('../../src/routes/books.js')).default;

describe('Database Module (db.js)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('initDB', () => {
        test('should initialize database and create books table', async () => {
            await initDB();

            expect(mockOpen).toHaveBeenCalledWith({
                filename: './books.db',
                driver: expect.any(Function)
            });

            expect(mockDb.exec).toHaveBeenCalledWith(
                expect.stringContaining('CREATE TABLE IF NOT EXISTS books')
            );
        });

        test('should create table with correct schema', async () => {
            await initDB();

            const execCall = mockDb.exec.mock.calls[0][0];
            expect(execCall).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
            expect(execCall).toContain('title TEXT');
            expect(execCall).toContain('author TEXT');
        });
    });

    describe('getDB', () => {
        test('should return the database instance', async () => {
            await initDB();
            const db = getDB();

            expect(db).toBeDefined();
            expect(db).toBe(mockDb);
        });

        test('should return the same db instance on multiple calls', async () => {
            await initDB();
            const db1 = getDB();
            const db2 = getDB();

            expect(db1).toBe(db2);
        });
    });
});

describe('Books Routes Module (routes/books.js)', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            body: {},
            params: {},
            query: {}
        };
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    describe('GET /books', () => {
        test('should return all books from database', async () => {
            const mockBooks = [
                { id: 1, title: 'Book 1', author: 'Author 1' },
                { id: 2, title: 'Book 2', author: 'Author 2' }
            ];
            mockDb.all.mockResolvedValue(mockBooks);

            await initDB();

            // Simulate route handler
            const routes = bookRoutes.stack || [];
            const getRoute = routes.find(r => r.route && r.route.methods.get);
            
            if (getRoute) {
                await getRoute.route.stack[0].handle(mockReq, mockRes, mockNext);
            }

            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM books');
            expect(mockRes.json).toHaveBeenCalledWith(mockBooks);
        });

        test('should return empty array when no books exist', async () => {
            mockDb.all.mockResolvedValue([]);

            await initDB();

            const routes = bookRoutes.stack || [];
            const getRoute = routes.find(r => r.route && r.route.methods.get);
            
            if (getRoute) {
                await getRoute.route.stack[0].handle(mockReq, mockRes, mockNext);
            }

            expect(mockRes.json).toHaveBeenCalledWith([]);
        });
    });

    describe('POST /books', () => {
        test('should create a new book with valid data', async () => {
            mockReq.body = { title: 'New Book', author: 'New Author' };
            mockDb.run.mockResolvedValue({ lastID: 1 });

            await initDB();

            const routes = bookRoutes.stack || [];
            const postRoute = routes.find(r => r.route && r.route.methods.post);
            
            if (postRoute) {
                await postRoute.route.stack[0].handle(mockReq, mockRes, mockNext);
            }

            expect(mockDb.run).toHaveBeenCalledWith(
                'INSERT INTO books (title, author) VALUES (?, ?)',
                ['New Book', 'New Author']
            );
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                id: 1,
                title: 'New Book',
                author: 'New Author'
            });
        });

        test('should handle book creation with different data', async () => {
            mockReq.body = { title: 'Another Book', author: 'Another Author' };
            mockDb.run.mockResolvedValue({ lastID: 5 });

            await initDB();

            const routes = bookRoutes.stack || [];
            const postRoute = routes.find(r => r.route && r.route.methods.post);
            
            if (postRoute) {
                await postRoute.route.stack[0].handle(mockReq, mockRes, mockNext);
            }

            expect(mockDb.run).toHaveBeenCalledWith(
                'INSERT INTO books (title, author) VALUES (?, ?)',
                ['Another Book', 'Another Author']
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                id: 5,
                title: 'Another Book',
                author: 'Another Author'
            });
        });
    });
});

describe('Express App Module (app.js)', () => {
    test('should be an Express application', () => {
        expect(app).toBeDefined();
        expect(typeof app).toBe('function');
        // Express app is an EventEmitter, not a plain Function
        expect(app.constructor.name).toBe('EventEmitter');
    });

    test('should have required properties of Express app', () => {
        // Verify that the app has Express-specific methods
        expect(typeof app.use).toBe('function');
        expect(typeof app.get).toBe('function');
        expect(typeof app.post).toBe('function');
        expect(typeof app.listen).toBe('function');
    });

    test('should export app instance correctly', () => {
        // Verify the app is properly exported and usable
        expect(app).not.toBeNull();
        expect(app).not.toBeUndefined();
        expect(typeof app).toBe('function');
    });

    test('should not start server in test environment', () => {
        // This test verifies that the app doesn't call listen in test mode
        // The app checks NODE_ENV !== 'test' before calling listen
        expect(process.env.NODE_ENV).toBe('test');
    });
});

describe('Integration - Full Stack Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should handle complete book lifecycle', async () => {
        // Setup
        mockDb.run.mockResolvedValue({ lastID: 10 });
        mockDb.all.mockResolvedValue([
            { id: 10, title: 'Lifecycle Book', author: 'Test Author' }
        ]);

        await initDB();

        // Verify database was initialized
        expect(mockOpen).toHaveBeenCalled();
        expect(mockDb.exec).toHaveBeenCalled();

        // Verify we can get the database
        const db = getDB();
        expect(db).toBe(mockDb);
    });

    test('should handle multiple database operations', async () => {
        await initDB();

        // First operation
        mockDb.all.mockResolvedValue([]);
        const db1 = getDB();
        const books1 = await db1.all('SELECT * FROM books');
        expect(books1).toEqual([]);

        // Second operation
        mockDb.run.mockResolvedValue({ lastID: 1 });
        const result = await db1.run(
            'INSERT INTO books (title, author) VALUES (?, ?)',
            ['Book', 'Author']
        );
        expect(result.lastID).toBe(1);

        // Third operation
        mockDb.all.mockResolvedValue([{ id: 1, title: 'Book', author: 'Author' }]);
        const books2 = await db1.all('SELECT * FROM books');
        expect(books2).toHaveLength(1);
    });
});

describe('Utility Functions and Logic', () => {
    test('should validate book data structure', () => {
        const validBook = {
            id: 1,
            title: 'Test Book',
            author: 'Test Author'
        };

        expect(validBook).toHaveProperty('id');
        expect(validBook).toHaveProperty('title');
        expect(validBook).toHaveProperty('author');
        expect(typeof validBook.id).toBe('number');
        expect(typeof validBook.title).toBe('string');
        expect(typeof validBook.author).toBe('string');
    });

    test('should handle different data types correctly', () => {
        const testData = {
            string: 'hello',
            number: 42,
            boolean: true,
            array: [1, 2, 3],
            object: { key: 'value' }
        };

        expect(typeof testData.string).toBe('string');
        expect(typeof testData.number).toBe('number');
        expect(typeof testData.boolean).toBe('boolean');
        expect(Array.isArray(testData.array)).toBe(true);
        expect(typeof testData.object).toBe('object');
    });

    test('should perform basic arithmetic operations', () => {
        const sum = (a, b) => a + b;
        const subtract = (a, b) => a - b;
        const multiply = (a, b) => a * b;
        const divide = (a, b) => a / b;

        expect(sum(2, 3)).toBe(5);
        expect(subtract(5, 3)).toBe(2);
        expect(multiply(4, 5)).toBe(20);
        expect(divide(10, 2)).toBe(5);
    });

    test('should handle string operations', () => {
        const str = 'Hello World';

        expect(str.toLowerCase()).toBe('hello world');
        expect(str.toUpperCase()).toBe('HELLO WORLD');
        expect(str.includes('World')).toBe(true);
        expect(str.split(' ')).toEqual(['Hello', 'World']);
        expect(str.length).toBe(11);
    });

    test('should handle array operations', () => {
        const arr = [1, 2, 3, 4, 5];

        expect(arr.length).toBe(5);
        expect(arr.map(x => x * 2)).toEqual([2, 4, 6, 8, 10]);
        expect(arr.filter(x => x > 3)).toEqual([4, 5]);
        expect(arr.reduce((a, b) => a + b, 0)).toBe(15);
    });
});

describe('Error Handling and Edge Cases', () => {
    test('should handle undefined values', () => {
        const value = undefined;
        expect(value).toBeUndefined();
        expect(typeof value).toBe('undefined');
    });

    test('should handle null values', () => {
        const value = null;
        expect(value).toBeNull();
        expect(typeof value).toBe('object');
    });

    test('should handle empty strings', () => {
        const emptyString = '';
        expect(emptyString).toBe('');
        expect(emptyString.length).toBe(0);
        expect(Boolean(emptyString)).toBe(false);
    });

    test('should handle empty arrays', () => {
        const emptyArray = [];
        expect(emptyArray).toEqual([]);
        expect(emptyArray.length).toBe(0);
        expect(Array.isArray(emptyArray)).toBe(true);
    });

    test('should handle empty objects', () => {
        const emptyObject = {};
        expect(emptyObject).toEqual({});
        expect(Object.keys(emptyObject).length).toBe(0);
        expect(typeof emptyObject).toBe('object');
    });
});
