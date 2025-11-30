import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(express.json());

app.post('/order', async (req, res) => {
    const items = [];
    for(let i = 0; i < req.body.items.length; i++) {
        items.push({
            productId: req.body.items[i].idItem,
            quantity: req.body.items[i].quantidadeItem,
            price: req.body.items[i].valorItem
        });
    }
    await prisma.order.create({
        data:{
            orderId: req.body.numeroPedido,
            value: req.body.valorTotal,
            creationDate: req.body.dataCriacao,
            items: {
                create: items
            }
        }
    });
    res.status(201).json(req.body);
}
);

app.listen(3000);