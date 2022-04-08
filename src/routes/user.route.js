const express = require('express');
const { route } = require('express/lib/application');
const router = express();
const {
  userVarified,
  userLogin,
  userVerifiedOtp,
  createAccessRefreshTokenToUser,
  signUPUser,
  logoutUser,
  updateUser
} = require('../controller/');
const {
  signUpSellerValidation,
  loginsellerValidation,
} = require('../middleware/');

/**
 * @swagger
 * /auth/user/register:
 *   post:
 *     summary: create a new user
 *     tags: [user]
 *     requestBody:
 *         required: true
 *         content:
 *          application/json:
 *            schema:
 *                required:
 *                   - fullName
 *                   - email
 *                   - phone
 *                   - password
 *                properties:
 *                   fullName:
 *                      type:string
 *                   email:
 *                      type: email
 *                   phone:
 *                      type:number
 *                   password:
 *                      type: password
 *                example:
 *                   fullName: sourabh
 *                   email: sourabh@gmail.com
 *                   phone: "9546845896"
 *                   password: "123456"
 *
 *     responses:
 *       200:
 *         description: signup successfully
 *
 *
 *
 */

router.post('/register', signUpSellerValidation, signUPUser);

/**
 * @swagger
 * /auth/user/login:
 *   post:
 *     summary: user login
 *     tags: [user]
 *     requestBody:
 *         required: true
 *         content:
 *          application/json:
 *            schema:
 *                required:
 *                   - email
 *                   - phone
 *                   - password
 *                properties:
 *                   email:
 *                      type: email
 *                   phone:
 *                      type:number
 *                   password:
 *                      type: password
 *                example:
 *                   email/phone: sourabh@gmail.com/9546845896
 *                   password: "123456"
 *
 *     responses:
 *       200:
 *         description: login successfully
 *
 *
 *
 */
router.post('/login', loginsellerValidation, userLogin);

/**
 * @swagger
 * /auth/user/varifiedotp:
 *   post:
 *     summary: user verify by otp
 *     tags: [user]
 *     requestBody:
 *         required: true
 *         content:
 *          application/json:
 *            schema:
 *                required:
 *                   - phone:
 *                   - otp
 *                properties:
 *                   phone:
 *                      type:string
 *                   otp:
 *                      type:string
 *                example:
 *                   phone: "9302807262"
 *                   otp: "123456"
 *
 *     responses:
 *       200:
 *         description: signup successfully
 *
 *
 *
 */
router.post('/varifiedotp', userVerifiedOtp);

/**
 * @swagger
 * /auth/user/logout:
 *   post:
 *     summary: user logout
 *     tags: [user]
 *     requestBody:
 *         required: true
 *         content:
 *          application/json:
 *            schema:
 *                required:
 *                   - id
 *                properties:
 *                   id:
 *                      type:string
 *                example:
 *                   id: 123456fdffeerwer
 *
 *     responses:
 *       200:
 *         description: signup successfully
 *
 *
 *
 */
router.post('/logout', logoutUser);

/**
 * @swagger
 * /auth/user/{token}:
 *   get:
 *     summary: verifyed user by token
 *     tags: [user]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: verified
 *       404:
 *         description: not verified
 */
router.get('/:token', userVarified);

/**
 * @swagger
 * /auth/user/updateUser:
 *   post:
 *     summary: updateuser
 *     tags: [user]
 *     requestBody:
 *         required: true
 *         content:
 *          application/json:
 *            schema:
 *                required:
 *                   - id
 *                properties:
 *                   id:
 *                      type:string
 *                example:
 *                   id: 'hfdgf3ty894rjhf349'
 *
 *     responses:
 *       200:
 *         description: update user successfully
 *
 *
 *
 */
router.post('/updateUser',updateUser);

module.exports = router;
