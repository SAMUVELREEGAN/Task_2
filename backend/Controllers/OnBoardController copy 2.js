const db = require("../Configs/db_config");

exports.Onboard = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM type_name")
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

exports.getTypes = async (req, res) => {
    const { type_id } = req.params;
    const { where, user_id } = req.query;  

    try {
        if (where === "type") {
            const [rows] = await db.query(
                "SELECT id , category_name FROM category_name WHERE type_id = ?",
                [type_id]
            );
            return res.json(rows);
        } 
        else if (where === 'details') {

            if (type_id !== "3") {
                return res.status(400).json({ message: "Details available only for type_id 3" });
            }

            if (!user_id) {
                return res.status(400).json({ message: "user_id is required" });
            }

        //       ONBOARDING FORM
            const [onboarding] = await db.query(
                `SELECT 
                    license_doctor_id,
                    general_id,
                    security_detail_id
                 FROM onboarding_form
                 WHERE user_id = ? AND type_id = ?`,
                [user_id, type_id]
            );

            if (!onboarding.length) {
                return res.status(404).json({ message: "No onboarding data found" });
            }

            const {
                license_doctor_id,
                general_id,
                security_detail_id
            } = onboarding[0];

            // LICENSE DETAILS
            const [license] = license_doctor_id
                ? await db.query(
                    "SELECT * FROM license_details_doctor WHERE id = ? AND user_id =?",
                    [license_doctor_id ,user_id]
                )
                : [[]];
            // GENERAL DETAILS
            const [generalDetails] = general_id
                ? await db.query(
                    `SELECT doctor_name, speciality, clinic_name,
                            address_1, address_2, address_3, address_4,
                            area, pincode_id, user_id
                     FROM general_details
                     WHERE id = ? AND user_id = ?`,
                    [general_id , user_id]
                )
                : [[]];
            // SECURITY DETAILS
            const [securityDetails] = security_detail_id
                ? await db.query(
                    `SELECT id, mobile_number, email, upload_pan,
                            pan_number, upload_gst, gst_number,
                            is_email, is_mobile, type_id, user_id
                     FROM security_details
                     WHERE id = ? AND user_id = ?`,
                    [security_detail_id , user_id]
                )
                : [[]];

            return res.json({
                license_details: license,
                general_details: generalDetails,
                security_details: securityDetails
            });
        } 
        else {
            return res.status(400).json({ message: "Invalid where parameter" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || err });
    }
};



exports.postTypes = async (req, res) => {
    const { type_id } = req.params;
    const { where } = req.query;

    const {
        user_id,              // needed for onboarding_form
        license_details,
        general_details,
        security_details
    } = req.body;

    try {
        if (where !== "details") {
            return res.status(400).json({ message: "Invalid where" });
        }

        if (type_id !== "3") {
            return res.status(400).json({ message: "Only type_id 3 allowed" });
        }

        if (!user_id) {
            return res.status(400).json({ message: "user_id is required" });
        }

        /* ===============================
           LICENSE INSERT
        =============================== */
        const [licenseResult] = await db.query(
            `INSERT INTO license_details_doctor
            (clininc_upload_certificate, clinic_registration_number, clininc_expiry_date,
             practice_upload_certificate, practice_registration_number, practice_expiry_date,
             address_proof_upload, clinic_image, type_id)
            VALUES (?,?,?,?,?,?,?,?,?)`,
            [
                license_details.clininc_upload_certificate,
                license_details.clinic_registration_number,
                license_details.clininc_expiry_date,
                license_details.practice_upload_certificate,
                license_details.practice_registration_number,
                license_details.practice_expiry_date,
                license_details.address_proof_upload,
                license_details.clinic_image,
                type_id
            ]
        );

        const license_doctor_id = licenseResult.insertId;

        /* ===============================
           GENERAL DETAILS INSERT
        =============================== */
        const [generalResult] = await db.query(
            `INSERT INTO general_details
            (doctor_name, speciality, clinic_name, address_1, address_2,
             address_3, address_4, area, pincode_id, type_id)
            VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
                general_details.doctor_name,
                general_details.speciality,
                general_details.clinic_name,
                general_details.address_1,
                general_details.address_2,
                general_details.address_3,
                general_details.address_4,
                general_details.area,
                general_details.pincode_id,
                type_id
            ]
        );

        const general_id = generalResult.insertId;

        /* ===============================
           SECURITY DETAILS INSERT
        =============================== */
        const [securityResult] = await db.query(
            `INSERT INTO security_details
            (mobile_number, email, upload_pan, pan_number,
             upload_gst, gst_number, is_email, is_mobile, type_id)
            VALUES (?,?,?,?,?,?,?,?,?)`,
            [
                security_details.mobile_number,
                security_details.email,
                security_details.upload_pan,
                security_details.pan_number,
                security_details.upload_gst,
                security_details.gst_number,
                security_details.is_email,
                security_details.is_mobile,
                type_id
            ]
        );

        const security_detail_id = securityResult.insertId;

        /* ===============================
           ONBOARDING FORM INSERT
        =============================== */
        await db.query(
            `INSERT INTO onboarding_form
            (user_id, type_id, license_doctor_id, general_id, security_detail_id)
            VALUES (?,?,?,?,?)`,
            [
                user_id,
                type_id,
                license_doctor_id,
                general_id,
                security_detail_id
            ]
        );

        return res.json({
            message: "Details inserted successfully and onboarding updated"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};



exports.getCategories = async (req, res) => {
    const { type_id, category_id } = req.params;
    const { where } = req.query;

    const typeIdNum = Number(type_id);
    const categoryIdNum = Number(category_id);

    try {
        if (where === "type") {
            const [rows] = await db.query(
                `SELECT id, sub_category_name FROM sub_category WHERE type_id = ? AND category_id = ?`,
                [type_id, category_id]
            );
            return res.json(rows);
        }

        if (where === 'details') {
            let license = [];
            let generalDetails = [];
            let securityDetails = [];

            // HOSPITALS 
            if (categoryIdNum === 5) {
                [license] = await db.query(
                    `SELECT upload_govt_establishment_order, hospital_code,
                            national_identification_number, legal_start_date,
                            official_letter
                     FROM license_details_hospital
                     WHERE type_id=? AND category_id=?`,
                    [typeIdNum, categoryIdNum]
                );

                [generalDetails] = await db.query(
                    `SELECT hospital_name, short_name, address_1, address_2, address_3,
                            address_4, area, pincode_id
                     FROM general_details
                     WHERE type_id=? AND category_id=?`,
                    [typeIdNum, categoryIdNum]
                );

                [securityDetails] = await db.query(
                    `SELECT mobile_number, email, upload_pan,
                            pan_number, upload_gst, gst_number, is_email,
                            is_mobile
                     FROM security_details
                     WHERE type_id=? AND category_id=?`,
                    [typeIdNum, categoryIdNum]
                );
            }
             else{
            return res.json({error:"Invalid category id"})
        }

            // PHARMACIES (type_id = 1)
            if (typeIdNum === 1 && [1, 2, 3].includes(categoryIdNum)) {
                // LICENSE DETAILS
                const licenseColumnsMap = {
                    1: 'id, 20_upload_license, 20_drug_license_number, 20_expiry_date, 21_upload_license, 21_drug_license_number, 21_expiry_date, pharmacy_image',
                    2: 'id, 20B_upload_license, 20B_drug_license_number, 20B_expiry_date, 21B_upload_license, 21B_drug_license_number, 21B_expiry_date, pharmacy_image',
                    3: '*'
                };
                [license] = await db.query(
                    `SELECT ${licenseColumnsMap[categoryIdNum]} 
                     FROM license_details_pharmacy
                     WHERE type_id=? AND category_id=?`,
                    [typeIdNum, categoryIdNum]
                );

                // GENERAL DETAILS
                [generalDetails] = await db.query(
                    `SELECT id, pharmacy_name, cathlap, address_1, address_2, address_3,
                            address_4, area, pincode_id, type_id, category_id
                     FROM general_details
                     WHERE type_id=? AND category_id=?`,
                    [typeIdNum, categoryIdNum]
                );

                // SECURITY DETAILS
                [securityDetails] = await db.query(
                    `SELECT id, mobile_number, email, upload_pan,
                            pan_number, upload_gst, gst_number, is_email,
                            is_mobile, type_id
                     FROM security_details
                     WHERE type_id=? AND category_id=?`,
                    [typeIdNum, categoryIdNum]
                );
            }

            return res.json({
                license_details: license,
                general_details: generalDetails,
                security_details: securityDetails
            });
        }

        return res.status(400).json({ message: "Invalid where parameter" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || err });
    }
};


exports.postCategories = async (req, res) => {
    const { type_id, category_id } = req.params;
    const { where } = req.query;

    const typeIdNum = Number(type_id);
    const categoryIdNum = Number(category_id);

    const {
        license_details = {},
        general_details = {},
        security_details = {}
    } = req.body;

    try {
        if (where !== "details") {
            return res.status(400).json({ message: "Invalid where parameter" });
        }

        // ===================================================== 
        if (categoryIdNum === 5) {

            // LICENSE
            await db.query(
                `INSERT INTO license_details_hospital
                (upload_govt_establishment_order, hospital_code,
                 national_identification_number, legal_start_date,
                 official_letter, type_id, category_id)
                VALUES (?,?,?,?,?,?,?)`,
                [
                    license_details.upload_govt_establishment_order,
                    license_details.hospital_code,
                    license_details.national_identification_number,
                    license_details.legal_start_date,
                    license_details.official_letter,
                    typeIdNum,
                    categoryIdNum
                ]
            );

            // GENERAL
            await db.query(
                `INSERT INTO general_details
                (hospital_name, short_name, address_1, address_2,
                 address_3, address_4, area, pincode_id,
                 type_id, category_id)
                VALUES (?,?,?,?,?,?,?,?,?,?)`,
                [
                    general_details.hospital_name,
                    general_details.short_name,
                    general_details.address_1,
                    general_details.address_2,
                    general_details.address_3,
                    general_details.address_4,
                    general_details.area,
                    general_details.pincode_id,
                    typeIdNum,
                    categoryIdNum
                ]
            );

            // SECURITY
            await db.query(
                `INSERT INTO security_details
                (mobile_number, email, upload_pan, pan_number,
                 upload_gst, gst_number, is_email, is_mobile,
                 type_id, category_id)
                VALUES (?,?,?,?,?,?,?,?,?,?)`,
                [
                    security_details.mobile_number,
                    security_details.email,
                    security_details.upload_pan,
                    security_details.pan_number,
                    security_details.upload_gst,
                    security_details.gst_number,
                    security_details.is_email,
                    security_details.is_mobile,
                    typeIdNum,
                    categoryIdNum
                ]
            );
        }
        else{
            return res.send("Invalid category id")
        }

 
        // ===================================================== 
        if (typeIdNum === 1 && [1, 2, 3].includes(categoryIdNum)) {

            let licenseQuery = "";
            let licenseValues = [];

            /* ---------- CATEGORY 1 ---------- */
            if (categoryIdNum === 1) {
                licenseQuery = `
                    INSERT INTO license_details_pharmacy
                    (20_upload_license, 20_drug_license_number, 20_expiry_date,
                     21_upload_license, 21_drug_license_number, 21_expiry_date,
                     pharmacy_image, type_id, category_id)
                    VALUES (?,?,?,?,?,?,?,?,?)
                `;

                licenseValues = [
                    license_details["20_upload_license"],
                    license_details["20_drug_license_number"],
                    license_details["20_expiry_date"],
                    license_details["21_upload_license"],
                    license_details["21_drug_license_number"],
                    license_details["21_expiry_date"],
                    license_details.pharmacy_image,
                    typeIdNum,
                    categoryIdNum
                ];
            }

            /* ---------- CATEGORY 2 ---------- */
            if (categoryIdNum === 2) {
                licenseQuery = `
                    INSERT INTO license_details_pharmacy
                    (20B_upload_license, 20B_drug_license_number, 20B_expiry_date,
                     21B_upload_license, 21B_drug_license_number, 21B_expiry_date,
                     pharmacy_image, type_id, category_id)
                    VALUES (?,?,?,?,?,?,?,?,?)
                `;

                licenseValues = [
                    license_details["20B_upload_license"],
                    license_details["20B_drug_license_number"],
                    license_details["20B_expiry_date"],
                    license_details["21B_upload_license"],
                    license_details["21B_drug_license_number"],
                    license_details["21B_expiry_date"],
                    license_details.pharmacy_image,
                    typeIdNum,
                    categoryIdNum
                ];
            }

            /* ---------- CATEGORY 3 ---------- */
            if (categoryIdNum === 3) {
                licenseQuery = `
                    INSERT INTO license_details_pharmacy
                    (20_upload_license, 20_drug_license_number, 20_expiry_date,
                     21_upload_license, 21_drug_license_number, 21_expiry_date,20B_upload_license, 20B_drug_license_number, 20B_expiry_date,
                     21B_upload_license, 21B_drug_license_number, 21B_expiry_date,
                     pharmacy_image, type_id, category_id)
                    VALUES (?,?,?,?,?,?,?,?,?)
                `;

                licenseValues = [
                    license_details["20_upload_license"],
                    license_details["20_drug_license_number"],
                    license_details["20_expiry_date"],
                    license_details["21_upload_license"],
                    license_details["21_drug_license_number"],
                    license_details["21_expiry_date"],
                    license_details["20B_upload_license"],
                    license_details["20B_drug_license_number"],
                    license_details["20B_expiry_date"],
                    license_details["21B_upload_license"],
                    license_details["21B_drug_license_number"],
                    license_details["21B_expiry_date"],
                    license_details.pharmacy_image,
                    typeIdNum,
                    categoryIdNum
                ];
            }

            // LICENSE INSERT
            await db.query(licenseQuery, licenseValues);

            // GENERAL
            await db.query(
                `INSERT INTO general_details
                (pharmacy_name, cathlap, address_1, address_2,
                 address_3, address_4, area, pincode_id,
                 type_id, category_id)
                VALUES (?,?,?,?,?,?,?,?,?,?)`,
                [
                    general_details.pharmacy_name,
                    general_details.cathlap,
                    general_details.address_1,
                    general_details.address_2,
                    general_details.address_3,
                    general_details.address_4,
                    general_details.area,
                    general_details.pincode_id,
                    typeIdNum,
                    categoryIdNum
                ]
            );

            // SECURITY
            await db.query(
                `INSERT INTO security_details
                (mobile_number, email, upload_pan, pan_number,
                 upload_gst, gst_number, is_email, is_mobile,
                 type_id, category_id)
                VALUES (?,?,?,?,?,?,?,?,?,?)`,
                [
                    security_details.mobile_number,
                    security_details.email,
                    security_details.upload_pan,
                    security_details.pan_number,
                    security_details.upload_gst,
                    security_details.gst_number,
                    security_details.is_email,
                    security_details.is_mobile,
                    typeIdNum,
                    categoryIdNum
                ]
            );
        }

        return res.status(201).json({
            message: "Details inserted successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.message || err
        });
    }
};



exports.getSubCategories = async(req,res)=>{
const { type_id, category_id,sub_category_id } = req.params
    const { where } = req.query; 

    try {
        if (where === 'details') {
            if ((type_id) === 2 && (category_id) === 4 &&
            [1, 2, 3].includes((sub_category_id))) {
        return res.status(400).json({ message: "Details not available for this combination" });
}


            // LICENSE DETAILS
            const [license] = await db.query(
                `SELECT upload_registration_certificate, hospital_registration_number,
                       registration_date, image
                FROM license_details_hospital
                WHERE type_id=? AND category_id=? AND sub_category_id=?`,
                [type_id ,category_id , sub_category_id]
            );

            // GENERAL DETAILS
            const [generalDetails] = await db.query(
                `SELECT hospital_name , short_name , address_1 , address_2 , address_3 ,
                       address_4, area, pincode_id
                FROM general_details
                WHERE type_id=? AND category_id=? AND sub_category_id=?`,
                [type_id , category_id,sub_category_id]
            );

            // SECURITY DETAILS
            const [securityDetails] = await db.query(
                `SELECT mobile_number, email, upload_pan,
                 pan_number, upload_gst, gst_number, is_email,
                 is_mobile
                FROM security_details
                WHERE type_id=? AND category_id=? AND sub_category_id=?`,
                [type_id ,category_id,sub_category_id]
            );

            return res.json({
                license_details: license,
                general_details: generalDetails,
                security_details: securityDetails
            });
        } 
        else {
            return res.status(400).json({ message: "Invalid where parameter" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || err });
    }
}


exports.postSubCategories = async (req, res) => {
    const { type_id, category_id, sub_category_id } = req.params;
    const { where } = req.query;

    const {
        license_details = {},
        general_details = {},
        security_details = {}
    } = req.body;

    try {
        if (where !== "details") {
            return res.status(400).json({ message: "Invalid where parameter" });
        }
        if (
            Number(type_id) === 2 &&
            Number(category_id) === 4 &&
            [1, 2, 3].includes(Number(sub_category_id))
        ) {
            return res
                .status(400)
                .json({ message: "Details not available for this combination" });
        }


        // ========================== 
        await db.query(
            `INSERT INTO license_details_hospital
            (upload_registration_certificate, hospital_registration_number,
             registration_date, image,
             type_id, category_id, sub_category_id)
            VALUES (?,?,?,?,?,?,?)`,
            [
                license_details.upload_registration_certificate,
                license_details.hospital_registration_number,
                license_details.registration_date,
                license_details.image,
                type_id,
                category_id,
                sub_category_id
            ]
        );

        // ==========================
        await db.query(
            `INSERT INTO general_details
            (hospital_name, short_name, address_1, address_2,
             address_3, address_4, area, pincode_id,
             type_id, category_id, sub_category_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [
                general_details.hospital_name,
                general_details.short_name,
                general_details.address_1,
                general_details.address_2,
                general_details.address_3,
                general_details.address_4,
                general_details.area,
                general_details.pincode_id,
                type_id,
                category_id,
                sub_category_id
            ]
        );

        // ========================== 
        await db.query(
            `INSERT INTO security_details
            (mobile_number, email, upload_pan, pan_number,
             upload_gst, gst_number, is_email, is_mobile,
             type_id, category_id, sub_category_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [
                security_details.mobile_number,
                security_details.email,
                security_details.upload_pan,
                security_details.pan_number,
                security_details.upload_gst,
                security_details.gst_number,
                security_details.is_email,
                security_details.is_mobile,
                type_id,
                category_id,
                sub_category_id
            ]
        );

        return res.status(201).json({
            message: "Sub-category details inserted successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.message || err
        });
    }
};
