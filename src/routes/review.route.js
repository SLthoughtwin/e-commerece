const express = require('express');
const router = express();

const { createReview, deleteReview, getReview,editReview } = require('../controller');
const {
  accessTokenVarify,
  checkRole,
  uploadImage,
  uploadfile,
  reviewValidation,
  reviewDeleteValidation,
  editReviewValidation
} = require('../middleware/');

/**
 * @swagger
 * components:
 *      schemas:
 *          review:
 *              type: object
 *              required :
 *                  - userId
 *                  - productId
 *                  - comments
 *              properties:
 *                  userId:
 *                      type : string
 *                  productId :
 *                      type : string
 *                  comments:
 *                      type: array
 *              example :
 *                  productId : '9456gjfjbjb95t9kgjv'
 *                  comments : [{
 *                  userId: String,
 *                  content: String,
 *                  votes: Number }]
 */

/**
 * @swagger
 * /v1/review/{id}:
 *   post:
 *     summary: create review
 *     tags: [review]
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
router.post(
  '/:id',
  uploadImage,
  accessTokenVarify,
  checkRole('user'),
  reviewValidation,
  createReview,
);

/**
 * @swagger
 * /v1/order:
 *   delete:
 *     summary: create delete
 *     tags: [review]
 *     responses:
 *       200:
 *         description: delete order successfully
 *
 *
 *
 */
router.delete('/:id', accessTokenVarify, checkRole('user'), reviewDeleteValidation,deleteReview);

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
router.get('/:id', accessTokenVarify, checkRole('user'), getReview);

router.put(
   '/:id',
   uploadImage,
   accessTokenVarify,
   checkRole('user'),
   editReviewValidation,
   editReview,
 );
module.exports = router;
