const express = require('express')
const prisma = require('../lib/prisma/client')
const validateParams = require('../middlewares/validateParams')
const { param } = require('express-validator')
const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - isAvailable
 *         - image
 *         - price
 *       properties:
 *         title:
 *           type: string
 *           description: The title of your product
 *         description:
 *           type: string
 *           description: The product description
 *         isAvailable:
 *           type: boolean
 *           description: True or False if the product is available/unavailable
 *         image:
 *           type: string
 *           description: The product image
 *         price:
 *           type: number
 *           description: The product price
 *       example:
 *         title: Apple Iphone 14
 *         description: Scopri iPhone 14 e il grandissimo iPhone 14 Plus. Con Rilevamento incidenti, durata della batteria mai vista, fotografia notturna ancora più spettacolare. E cinque colori favolosi.
 *         category: smartphone
 *         isAvailable: true
 *         image: https://www.apple.com/newsroom/images/product/iphone/geo/Apple-iPhone-14-iPhone-14-Plus-hero-220907-geo_Full-Bleed-Image.jpg.large.jpg
 *         price: 999.9
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: The products managing API
 * /products:
 *   get:
 *     summary: Get all products from database
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Retrieve the complete array of products.
 *         examples:
 *           application/json:
 *             [
 *               {
 *                 "id": "1",
 *                 "title": "Apple Iphone 14",
 *                 "description": "Scopri iPhone 14 e il grandissimo iPhone 14 Plus. Con Rilevamento incidenti, durata della batteria mai vista, fotografia notturna ancora più spettacolare. E cinque colori favolosi.",
 *                 "category": "smartphone",
 *                 "isAvailable": true,
 *                 "image": "https://www.apple.com/newsroom/images/product/iphone/geo/Apple-iPhone-14-iPhone-14-Plus-hero-220907-geo_Full-Bleed-Image.jpg.large.jpg",
 *                 "price": 999.9,
 *                 "createdAt": "2023-01-18T08:24:10.260Z",
 *                 "updatedAt": "2023-01-18T08:24:10.260Z"
 *               },
 *               {
 *                 "id": "2",
 *                 "title": "Samsung Galaxy S21",
 *                 "description": "The Samsung Galaxy S21 is a powerful smartphone with a sleek design and advanced features.",
 *                 "category": "smartphone",
 *                 "isAvailable": true,
 *                 "image": "https://www.samsung.com/global/galaxy/galaxy-s21/images/galaxy-s21-5g_front_black.png",
 *                 "price": 899.99,
 *                 "createdAt": "2022-01-01T01:00:00.000Z",
 *                 "updatedAt": "2022-01-01T01:00:00.000Z"
 *               }
 *             ]
 *
 *       500:
 *         description: Some server error
 *
 */

router.get('/products', async (req, res, next) => {
    const products = await prisma.products.findMany()
    res.status(200).send({
        total: products?.length,
        products: products,
    })
})

router.get(
    '/products/:id',
    validateParams([
        param('id').isInt().withMessage('Product id must be an Integer'),
    ]),
    async (req, res, next) => {
        const { productId } = req.params
        const product = await prisma.products.findUnique({
            where: { id: productId },
        })
        if (!product) {
            res.status(404)
            return next(`Cannot GET /products/${productId}`)
        }
        res.status(200).json(product)
    }
)

/**
 * @swagger
 * /products:
 *   post:
 *     description: Create a new product
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product
 *         description: Product object
 *         in: body
 *         required: true
 *         schema:
 *            $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: The created product
 *         schema:
 *           $ref: '#/components/schemas/Product'
 */

router.post('/products', async (req, res, next) => {
    try {
        const addedProduct = await prisma.products.create({
            data: {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                isAvailable: req.body.isAvailable,
                image: req.body.image,
                price: req.body.price,
            },
        })
        res.status(201).json(addedProduct)
    } catch (error) {
        res.status(500)
        next({
            message: 'An error has occurred',
            error: error,
        })
    }
})

router.delete(
    '/products/:id',
    validateParams([
        param('id').isInt().withMessage('Products id must be an Integer'),
    ]),
    async (req, res, next) => {
        const { productId } = req.params

        try {
            await prisma.products.delete({
                where: {
                    id: productId,
                },
            })
            res.status(200).send({ message: 'Product deleted successfully' })
        } catch (error) {
            res.status(404)
            next(`Cannot DELETE /products/${productId}`)
        }
    }
)

router.patch(
    '/products/:id',
    validateParams([
        param('id').isInt().withMessage('App id must be an Integer'),
    ]),
    async (req, res, next) => {
        const { productId } = req.params
        const productData = req.body

        try {
            const product = await prisma.products.update({
                where: { id: productId },
                data: productData,
            })
            if (!product) {
                res.status(404)
                return next(`A product with this id does not exist!`)
            }
            res.status(201).json(product)
        } catch (error) {
            res.status(404)
            next(`Cannot PATCH /products/${productId}`)
        }
    }
)

module.exports = router
