const express = require('express');
const { createCart, showCart, deleteCart,IncreAndDecre} = require('../controller/');
const router = express();

const { addCartValidation,accessTokenVarify,checkRole,incrementCartValidation} = require('../middleware')



/**
 * @swagger
 * components:
 *      schemas:
 *          cart:
 *              type: object
 *              required :
 *                  - productId
 *                  - quantity
 *              properties:
 *                  productId :
 *                      type : string
 *                  quantity :
 *                      type : number
 *              example :
 *                  productId : "624e87177795b1eb1d58e51b "
 *                  quantity : "12"
 */


/**
 * @swagger
 * /v1/cart:
 *   post:
 *     summary: create brand 
 *     tags: [cart]
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:  
 *            schema:
 *              $ref: '#components/schemas/cart'
 *     responses:
 *       200:
 *         description: cart create successfully
 */
router.post('/',accessTokenVarify,checkRole('user'),addCartValidation,createCart)

/**
 * @swagger
 * /v1/cart:
 *   get:
 *     summary: show cart 
 *     tags: [cart]
 *     responses:
 *       200:
 *         description: show cart successfully
 *
 */
router.get('/',accessTokenVarify,checkRole('user'),showCart)

/**
 * @swagger
 * /v1/cart/{id}:
 *   delete:
 *     summary: delete cart by id
 *     tags: [cart]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: delete cart by id  successfully
 *
 */
router.delete('/:id',accessTokenVarify,checkRole('user'),deleteCart)


/**
 * @swagger
 * /v1/cart/{id}:
 *   put:
 *     summary: delete cart by id
 *     tags: [cart]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *      - in: query
 *        name: value
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: updated cart by id  successfully
 *
 */
router.put('/:id',accessTokenVarify,checkRole('user'),incrementCartValidation,IncreAndDecre)


module.exports = router