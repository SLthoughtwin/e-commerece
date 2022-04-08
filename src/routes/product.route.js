const router = require('express').Router();
const {
  productValidation,
  uploadfile,
  uploadImage,
  accessTokenVarify,
  checkRole,
  productUpdateValidation
} = require('../middleware/');
const {
  createProduct,
  deleteProcduct,
  updateProduct,
  showProduct,
  showProductById
} = require('./../controller/');
const cloudinary = require('cloudinary').v2;
const {seller} = require('./../config/')


/**
 * @swagger
 * components:
 *      schemas:
 *          product:
 *              type: object
 *              required :
 *                  - title
 *                  - price
 *                  - categoryId
 *                  - brandId
 *                  - avatar
 *                  - description
 *              properties:
 *                  title:
 *                      type : string
 *                  price :
 *                      type : number
 *                  categoryId :
 *                      type : string
 *                  brandId :
 *                      type : string
 *                  description :
 *                      type : string
 *                  avatar: 
 *                      type: string
 *                      format: binary
 *
 *              example :
 *                  title : "glass"
 *                  price : "50"
 *                  categoryId : "624d3a65a00d21db3931f365"
 *                  brandId : "624d3a4ba00d21db3931f361"
 *                  description : "This item is made of transparent glass"
 */

/**
 * @swagger
 * /v1/product:
 *   post:
 *     summary: create new product
 *     tags: [product]
 *     requestBody:
 *         required: true
 *         content:
 *          multipart/form-data:
 *            schema:
 *              $ref: '#components/schemas/product'
 *
 *     responses:
 *       200:
 *         description: create product successfully
 *
 *
 *
 */

router.post(
  '/',
  uploadImage,
  accessTokenVarify,
  productValidation,
  checkRole(seller),
  uploadfile,
  createProduct,
);


/**
 * @swagger
 * /v1/product:
 *   get:
 *     summary: show product
 *     tags: [product]
 *     parameters:
 *      - in: query
 *        name: fields
 *        schema:
 *          type: string
 *      - in: query
 *        name: limit
 *        schema:
 *          type: number
 *      - in: query
 *        name: page
 *        schema:
 *          type: number
 *      - in: query
 *        name: filter
 *        schema:
 *          type: object
 *     responses:
 *       200:
 *         description: get all Product  successfully
 *
 *
 *
 */

router.get('/', accessTokenVarify, checkRole(seller), showProduct);

/**
 * @swagger
 * /v1/product/{id}:
 *   get:
 *     summary: get product by id 
 *     tags: [product]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: verified
 *       404:
 *         description: not verified
 */

router.get('/:id', accessTokenVarify, checkRole(seller), showProductById);

/**
 * @swagger
 * /v1/product/{id}:
 *   put:
 *     summary: update product by id 
 *     tags: [product]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: this is product id 
 *     responses:
 *       200:
 *         description: verified
 *       404:
 *         description: not verified
 */

router.put(
  '/:id',
  uploadImage,
  accessTokenVarify,
  productUpdateValidation,
  checkRole(seller),
  uploadfile,
  updateProduct,
);

/**
 * @swagger
 * /v1/product/{id}:
 *   delete:
 *     summary: delete product by id 
 *     tags: [product]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: this is product id 
 *     responses:
 *       200:
 *         description: verified
 *       404:
 *         description: not verified
 */

router.delete('/:id', accessTokenVarify, checkRole(seller), deleteProcduct);

module.exports = router;
