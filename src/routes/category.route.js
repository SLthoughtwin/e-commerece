const express = require('express');
const router = express();

const {
  createCategory,
  updateCategory,
  showCategory,
  showCategoryById,
  deleteCategory,
} = require('../controller');
const { accessTokenVarify, checkRole ,categoryValidation,uploadImage1} = require('../middleware');


/**
 * @swagger
 * components:
 *      schemas:
 *          category:
 *              type: object
 *              required :
 *                  - category_name
 *                  - description
 *                  - avatar
 *              properties:
 *                  category_name:
 *                      type : string
 *                  description :
 *                      type : string
 *                  avatar:
 *                      type: string
 *                      format: binary
 *              example :
 *                  category_name : glass
 *                  description : This item is made of transparent glass
 */



/**
 * @swagger
 * /v1/category:
 *   post:
 *     summary: create category 
 *     tags: [category]
 *     requestBody:
 *         required: true
 *         content:
 *          multipart/form-data:
 *            schema:
 *             $ref: '#components/schemas/category'          
 *     responses:
 *       200:
 *         description: verified seller successfully
 *
 *
 *
 */

router.post('/',uploadImage1,accessTokenVarify,checkRole('admin'),categoryValidation,createCategory);

/**
 * @swagger
 * /v1/category/{id}:
 *   put:
 *     summary: update category by id
 *     tags: [category]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#components/schemas/category'
 *     responses:
 *       200:
 *         description: update category by id  successfully
 *
 *
 *
 */
router.put('/:id',uploadImage1,accessTokenVarify, checkRole('admin'), categoryValidation,updateCategory);

/**
 * @swagger
 * /v1/category:
 *   get:
 *     summary: show category 
 *     tags: [category]
 *     parameters:
 *      - in: query
 *        name: search
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: show category successfully
 *
 *
 *
 */
router.get('/', accessTokenVarify, checkRole('admin'), showCategory);

/**
 * @swagger
 * /v1/category/{id}:
 *   get:
 *     summary: show category by id
 *     tags: [category]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: show category by id  successfully
 *
 *
 *
 */
router.get('/:id', accessTokenVarify, checkRole('admin'), showCategoryById);

/**
 * @swagger
 * /v1/category/{id}:
 *   delete:
 *     summary: delete category by id
 *     tags: [category]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: delete category by id  successfully
 *
 *
 *
 */
router.delete('/:id', accessTokenVarify, checkRole('admin'), deleteCategory);

module.exports = router;
