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
            productId: parseInt(req.body.items[i].idItem),
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

app.get('/order/list', async (req, res) => {
    const orders = await prisma.order.findMany({
        include: {
            items: true
        }
    });
    res.status(200).json(orders);
}
);

app.get('/order/:id', async (req, res) => {
    const order = await prisma.order.findUnique({
        where: {
            orderId: req.params.id
        },
        include: {
            items: true
        }
    });
    if(order) {
        res.status(200).json(order);
    } else {
        res.status(404).json({ error: 'Pedido não encontrado' });
    }
}
);

app.delete('/order/:id', async (req, res) => {
    try {
        await prisma.order.delete({
            where: {    
                orderId: req.params.id
            }
        });
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: 'Pedido não encontrado' });
    }
}
);

app.put('/order/:id', async (req, res) => {
    const items = [];
    for(let i = 0; i < req.body.items.length; i++) {
        items.push({
            productId: parseInt(req.body.items[i].idItem),
            quantity: req.body.items[i].quantidadeItem,
            price: req.body.items[i].valorItem
        });
    }
    try {
        const updatedOrder = await prisma.order.update({
            where: {
                orderId: req.params.id
            },
            data: {
                quantity: req.body.quantidadeItem,
                price: req.body.valorItem,
                value: req.body.valorTotal,
                items: {
                    deleteMany: {},
                    create: items
                }
            },
            include: {
                items: true
            }
        });
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(404).json({ error: 'Pedido não encontrado' });
    }
}
);
app.listen(3000);