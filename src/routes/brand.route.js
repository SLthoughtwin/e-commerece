const express = require('express');
const router = express();

const {
    createBrand,
    updateBrand,
    showBrand,
    showBrandById,
    deleteBrand,
  } = require('../controller');
const {accessTokenVarify,checkRole,uploadImage1,uploadfile,brandValidation} = require('../middleware')

/**
 * @swagger
 * components:
 *      schemas:
 *          brand:
 *              type: object
 *              required :
 *                  - brand_name
 *                  - description
 *                  - avatar
 *              properties:
 *                  brand_name:
 *                      type : string
 *                  description :
 *                      type : string
 *                  avatar:
 *                      type: string
 *                      format: binary
 *              example :
 *                  brand_name : glass
 *                  description : This item is made of transparent glass
 */


/**
 * @swagger
 * /v1/brand:
 *   post:
 *     summary: create brand 
 *     tags: [brand]
 *     requestBody:
 *         required: true
 *         content:
 *          multipart/form-data:
 *            schema:
 *              $ref: '#components/schemas/brand'
 *
 *     responses:
 *       200:
 *         description: verified seller successfully
 *
 *
 *
 */
router.post('/',uploadImage1,accessTokenVarify,checkRole('admin'),brandValidation,createBrand)

/**
 * @swagger
 * /v1/brand/{id}:
 *   put:
 *     summary: show brand by id
 *     tags: [brand]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *     requestBody:
 *        content:
 *          multipart/form-data:
 *            schema:
 *              $ref: '#components/schemas/brand'
 *     responses:
 *       200:
 *         description: update brand by id  successfully
 *
 *
 *
 */
router.put('/:id',uploadImage1,accessTokenVarify,checkRole('admin'),brandValidation,updateBrand)


/**
 * @swagger
 * /v1/brand:
 *   get:
 *     summary: show brand
 *     tags: [brand]
 *     parameters:
 *      - in: query
 *        name: search
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: get all Product  successfully
 *
 *
 *
 */
router.get('/',accessTokenVarify,checkRole('admin'),showBrand)
/**
 * @swagger
 * /v1/brand/{id}:
 *   get:
 *     summary: show brand by id
 *     tags: [brand]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: get brand by id  successfully
 *
 *
 *
 */
router.get('/:id',accessTokenVarify,checkRole('admin'),showBrandById)

/**
 * @swagger
 * /v1/brand/{id}:
 *   delete:
 *     summary: show brand by id
 *     tags: [brand]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: delete brand by id  successfully
 *
 *
 *
 */
router.delete('/:id',accessTokenVarify,checkRole('admin'),deleteBrand)

module.exports = router;