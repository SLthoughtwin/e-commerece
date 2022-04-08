const express = require('express');
const router = express();

const {
    createBrand,
    updateBrand,
    showBrand,
    showBrandById,
    deleteBrand,
  } = require('../controller');
const {accessTokenVarify,checkRole,uploadImage1,uploadfile} = require('../middleware')

/**
 * @swagger
 * components:
 *      schemas:
 *          brand:
 *              type: object
 *              required :
 *                  - brand_name
 *                  - description
 *                  - logo
 *              properties:
 *                  brand_name:
 *                      type : string
 *                  description :
 *                      type : string
 *                  logo:
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
router.post('/',uploadImage1,accessTokenVarify,checkRole('admin'),uploadfile,createBrand)

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
router.put('/',uploadImage1,accessTokenVarify,checkRole('admin'),uploadfile,updateBrand)


/**
 * @swagger
 * /v1/brand:
 *   get:
 *     summary: show brand
 *     tags: [brand]
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
router.delete('/',accessTokenVarify,checkRole('admin'),deleteBrand)

module.exports = router;