const express = require('express');
const { route } = require('express/lib/application');
const router = express();
const {
  createAddress,
  updateAddress,
  showAddress,
  deleteAddress,
  axiosTest,
} = require('../controller/');
const { adderssValidation } = require('../middleware/');

/**
 * @swagger
 * /user/address/create:
 *   post:
 *     summary: create new address
 *     tags: [address]
 *     requestBody:
 *         required: true
 *         content:
 *          application/json:
 *            schema:
 *                required:
 *                   - fullName
 *                   - userid
 *                   - phone
 *                   - country
 *                   - state
 *                   - city
 *                   - street
 *                   - houseNo
 *                   - pincode
 *                   - landmark
 *                   - addressType
 *                properties:
 *                   fullname:
 *                      type:string
 *                   phone:
 *                      type:number
 *                   country:
 *                      type: string
 *                   state:
 *                      type: string
 *                   city:
 *                      type: string
 *                   street:
 *                      type: string
 *                   houseNo:
 *                      type: string
 *                   pincode:
 *                      type: number
 *                   landmark:
 *                       type: string
 *                   addressType:
 *                      type: string
 *                example:
 *                   fullName: sourabh
 *                   phone: "9546845896"
 *                   country: india
 *                   state: MP
 *                   city: indore
 *                   street: LIG-colony
 *                   houseNo: 304/2
 *                   pincode: 456786
 *                   landmark: temple
 *                   addressType: house
 *
 *     responses:
 *       200:
 *         description: create address successfully
 *
 *
 *
 */

router.post('/create', adderssValidation, createAddress);

/**
 * @swagger
 * /user/address/show:
 *   post:
 *     summary: find address
 *     tags: [address]
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
 *                   id: dfsf9r998s9f8fdfd4
 *
 *     responses:
 *       200:
 *         description: find address successfully
 *
 *
 *
 */
router.post('/show', showAddress);

/**
 * @swagger
 * /user/address/update:
 *   post:
 *     summary: update address
 *     tags: [address]
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
 *                   id: rjf484898ewfs8ffdr4
 *
 *     responses:
 *       200:
 *         description: update address successfully
 *
 *
 *
 */
router.post('/update', updateAddress);

/**
 * @swagger
 * /user/address/delete:
 *   post:
 *     summary: delete address
 *     tags: [address]
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
router.post('/delete', deleteAddress);

router.get('/axios', axiosTest);

module.exports = router;
