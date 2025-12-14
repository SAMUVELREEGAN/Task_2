const express = require('express')
const OnBoardController = require('../Controllers/OnBoardController')

const onboard = express.Router()

// onboard.get('/onboard', OnBoardController.getOnboard)

// onboard.get('/onboard/:type_id', OnBoardController.getTypeCategories)

onboard.get('/onboard/:type_id/:category_id', OnBoardController.handleView);
onboard.get('/onboard/:type_id/', OnBoardController.handleView);
onboard.get('/onboard/', OnBoardController.handleView);

// onboard.get('/onboard/:type_id/:category_id/:sub_category_id', OnBoardController.getDetails)
// onboard.get('/onboard/:type_id/:category_id/', OnBoardController.getDetails)

// onboard.post('/onboard/:type_id/:category_id/:sub_category_id', OnBoardController.postDetails)
// onboard.post('/onboard/:type_id/:category_id/', OnBoardController.postDetails)

module.exports = onboard