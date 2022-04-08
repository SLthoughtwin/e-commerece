const express = require('express');
const router = express();
const { adminValidation } = require('./../middleware/');
const {
  adminLogin,
  verifiedByAdmin,
  getAllseller,
} = require('./../controller/');
const { accessTokenVarify} = require('./../middleware');
const {checkRole} = require('./../middleware/seller.middleware');

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: login admin
 *     tags: [admin]
 *     requestBody:
 *         required: true
 *         content:
 *          application/json:
 *            schema:
 *                required:
 *                   - email
 *                   - password
 *                properties:
 *                   email:
 *                      type: email
 *                   password:
 *                      type: password
 *                example:
 *                   email: sourabh@gmail.com
 *                   password: "123456"
 *
 *     responses:
 *       200:
 *         description: login successfully
 *
 *
 *
 */
router.get('/login',(req,res)=>{
  
  res.render('admin')
})
router.post('/login', adminValidation, adminLogin);

/**
 * @swagger
 * /auth/admin/verifySeller:
 *   post:
 *     summary: approve seller by admin
 *     tags: [admin]
 *     requestBody:
 *         required: true
 *         content:
 *          application/json:
 *            schema:
 *                required:
 *                   - id
 *                properties:
 *                   id:
 *                      type: string
 *                example:
 *                   id: "573hbnsbdfhuru848"
 *
 *     responses:
 *       200:
 *         description: verified seller successfully
 *
 *
 *
 */
router.post('/verifySeller', accessTokenVarify,checkRole("admin"), verifiedByAdmin);

/**
 * @swagger
 * /auth/admin/getAllSeller:
 *   get:
 *     security:
 *       - jwt: []
 *     summary: get all seller
 *     tags: [admin]
 *     parameters:
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *     responses:
 *       200:
 *         description: get allseller successfully
 *
 *
 *
 */
router.get('/getAllSeller', accessTokenVarify,checkRole('admin'),getAllseller);

module.exports = router;
