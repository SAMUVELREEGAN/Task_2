const express = require('express')
const AllCategoryController = require('../Controllers/AllCategoryController')

const categoryRoute = express.Router()

categoryRoute.get('/categories' , AllCategoryController.getTypes)

categoryRoute.get("/categories/:type_id", AllCategoryController.getCategories);

categoryRoute.get("/categories/:type_id/:category_id", AllCategoryController.getSubCategories);


// ---------------- doctor ----------------
categoryRoute.post("/onboard/:type_id", AllCategoryController.postDoctorLicense);
categoryRoute.get("/onboard/:type_id", AllCategoryController.getDoctorLicense);


// ---------------- hospital ----------------

categoryRoute.post("/onboard/:type_id/hos/:category_id", AllCategoryController.postHospitalLicense);
categoryRoute.post("/onboard/:type_id/hos/:category_id/:sub_category_id", AllCategoryController.postHospitalLicense);

categoryRoute.get("/onboard/:type_id/hos/:category_id", AllCategoryController.getHospitalLicense);
categoryRoute.get("/onboard/:type_id/hos/:category_id/:sub_category_id", AllCategoryController.getHospitalLicense);

// PHARMACY
categoryRoute.post("/onboard/:type_id/:category_id", AllCategoryController.postPharmacyLicense);
categoryRoute.get("/onboard/:type_id/:category_id", AllCategoryController.getPharmacyLicense);




module.exports = categoryRoute