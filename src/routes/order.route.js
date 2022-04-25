const express = require('express');
const router = express();

const {
    createOrder,
    cancelOrder,
    getAllOrder,
    getOrderById,
    changeStatus,
    fsatDeviveryDate
} = require('../controller');
const{accessTokenVarify,checkRole,orderValidation,createOrderValidation} = require('../middleware/')


router.get('/fast',accessTokenVarify,checkRole('user'),fsatDeviveryDate)
/**
 * @swagger
 * components:
 *      schemas:
 *          order:
 *              type: object
 *              required :
 *                  - userId
 *                  - productId
 *                  - quantity
 *                  - paymentType
 *                  - deliveryDate
 *              properties:
 *                  userId:
 *                      type : string
 *                  productId :
 *                      type : string
 *                  quantity:
 *                      type: string
 *                  paymentType:
 *                       type: number
 *                  deliveryDate:
 *                       type: number
 *              example :
 *                  paymentType : "COD"
 *                  quantity : 1
 *                  deliveryDate: 3
 */


/**
 * @swagger
 * /v1/order/{id}:
 *   post:
 *     summary: create order
 *     tags: [order]
 *     parameters: 
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *     requestBody:
 *         required: true
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#components/schemas/order'
 *
 *     responses:
 *       200:
 *         description: create order successfully
 *
 *
 *
 */
router.post('/',accessTokenVarify,checkRole('user'),createOrderValidation,createOrder)

/**
 * @swagger
 * /v1/order/{id}:
 *   delete:
 *     summary: create delete 
 *     tags: [order]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type : string
 *     responses:
 *       200:
 *         description: delete order successfully
 *
 *
 *
 */
router.delete('/:id',accessTokenVarify,checkRole('user'),cancelOrder)

/**
 * @swagger
 * /v1/order/{id}:
 *   get:
 *     summary: create delete 
 *     tags: [order]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type : string
 *     responses:
 *       200:
 *         description: delete order successfully
 *
 */
router.get('/:id',accessTokenVarify,checkRole('user'),getOrderById)

/**
 * @swagger
 * /v1/order:
 *   get:
 *     summary: create delete 
 *     tags: [order]
 *     responses:
 *       200:
 *         description: delete order successfully
 */
router.get('/',accessTokenVarify,checkRole('user'),getAllOrder)

/**
 * @swagger
 * /v1/order/{id}:
 *   put:
 *     summary: create delete 
 *     tags: [order]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type : string
 *     responses:
 *       200:
 *         description: change status order successfully
 *
 */
router.put('/:id',accessTokenVarify,checkRole('seller'),orderValidation,changeStatus)



module.exports = router