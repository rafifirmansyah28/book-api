import express from 'express';
import dotenv from 'dotenv';
import bookRoutes from './routes/books.js';
import { initDB } from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/books', bookRoutes);

initDB(); // Initialize the database

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;