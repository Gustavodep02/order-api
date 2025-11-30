import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

app.post('/order', (req, res) => {
    res.status(201).json(req.body);
}
);

app.listen(3000);