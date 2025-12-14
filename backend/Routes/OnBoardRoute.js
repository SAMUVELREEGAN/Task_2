const express = require('express')
const OnBoardController = require('../Controllers/OnBoardController')

const onboard = express.Router()

onboard.get('/onboard' , OnBoardController.Onboard)

onboard.get("/onboard/:type_id", OnBoardController.getTypes); 

onboard.post("/onboard/:type_id", OnBoardController.postTypes);

onboard.get("/onboard/:type_id/:category_id", OnBoardController.getCategories);

onboard.post("/onboard/:type_id/:category_id", OnBoardController.postCategories);

onboard.get("/onboard/:type_id/:category_id/:sub_category_id", OnBoardController.getSubCategories);

onboard.post("/onboard/:type_id/:category_id/:sub_category_id", OnBoardController.postSubCategories);

module.exports = onboard