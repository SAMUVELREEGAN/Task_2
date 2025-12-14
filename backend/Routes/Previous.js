const express = require('express')
const OnBoardController = require('../Controllers/OnBoardController')

const onboard = express.Router()

onboard.get('/onboard', OnBoardController.getOnboard)
onboard.get('/onboard/1', OnBoardController.getParmacyType)
onboard.get('/onboard/2', OnBoardController.getDoctorType)

onboard.get('/onboard/2/4', OnBoardController.gethospitalType)

// Hospital
onboard.get('/onboard/2/:category_id', OnBoardController.getHospital)
onboard.get('/onboard/2/:category_id/:sub_category_id', OnBoardController.getHospital)

onboard.post('/onboard/2/:category_id', OnBoardController.postHospital)
onboard.post('/onboard/2/:category_id/:sub_category_id', OnBoardController.postHospital)

// Pharmacy
onboard.get('/onboard/1/:category_id', OnBoardController.getParmacy)
onboard.post('/onboard/1/:category_id', OnBoardController.postParmacy)

// Doctor
onboard.get('/onboard/3', OnBoardController.getDoctor)
onboard.post('/onboard/3', OnBoardController.postDoctor)

module.exports = onboard