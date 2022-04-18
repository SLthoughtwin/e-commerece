const express = require('express');
const router = express();

const {
    getOrder,
    cancelOrder,
    getAllOrder,
    getOrderById,
    changeStatus
} = require('../controller');
const{accessTokenVarify,checkRole,orderValidation} = require('../middleware/')

router.post('/:id',accessTokenVarify,checkRole('user'),getOrder)
router.delete('/:id',accessTokenVarify,checkRole('user'),cancelOrder)
router.get('/',accessTokenVarify,checkRole('user'),getAllOrder)
router.get('/:id',accessTokenVarify,checkRole('user'),getOrderById)
router.put('/:id',accessTokenVarify,checkRole('admin'),orderValidation,changeStatus)

module.exports = router