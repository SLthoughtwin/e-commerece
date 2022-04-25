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
const { adderssValidation,accessTokenVarify } = require('../middleware/');

/**
 * @swagger
 * /v1/address:
 *   post:
 *     summary: create new address
 *     tags: [address]
 *     requestBody:
 *         required: true
 *         content:
 *          application/json:
 *            schema:
 *                required:
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

router.post('/', accessTokenVarify,adderssValidation, createAddress);

/**
 * @swagger
 * /v1/address/show:
 *   get:
 *     summary: find address
 *     tags: [address]
 *     responses:
 *       200:
 *         description: find address successfully
 *
 */
router.get('/show',accessTokenVarify, showAddress);

/**
 * @swagger
 * /v1/address:
 *   put:
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
 *     responses:
 *       200:
 *         description: update address successfully
 *
 *
 *
 */
router.put('/',accessTokenVarify,updateAddress);

/**
 * @swagger
 * /v1/address:
 *   delete:
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
router.delete('/', accessTokenVarify,deleteAddress);

router.get('/axios', axiosTest);

module.exports = router;
