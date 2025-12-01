import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(express.json());

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valorTotal:
 *                 type: number
 *               dataCriacao:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Dados invalidos
 */
app.post('/order', authMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /order/list:
 *   get:
 *     summary: Lista todos os pedidos
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */

app.get('/order/list', authMiddleware, async (req, res) => {
    const orders = await prisma.order.findMany({
        include: {
            items: true
        }
    });
    res.status(200).json(orders);
}
);
/**
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Busca um pedido pelo numero
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido não encontrado
 */

app.get('/order/:id', authMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /order/{id}:
 *   delete:
 *     summary: Deleta um pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Pedido deletado
 *       404:
 *         description: Não encontrado
 */

app.delete('/order/:id', authMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /order/{id}:
 *   put:
 *     summary: Atualiza um pedido existente
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Pedido atualizado
 *       404:
 *         description: Não encontrado
 */

app.put('/order/:id', authMiddleware, async (req, res) => {
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


// config da autenticacao com jwt

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ error: "Token não enviado" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (email === "adm@teste.com" && senha === "12345") {
        return res.json({
            token: generateToken({ id: 1, email })
        });
    }

    res.status(401).json({ error: "Credenciais inválidas" });
});

// configuracao do swagger

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Order API", version: "1.0.0" },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer"} 
      }
    },
      title: "Orders API",
      version: "1.0.0",
    },
    apis: ["./server.js"], 
  }
);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));    
