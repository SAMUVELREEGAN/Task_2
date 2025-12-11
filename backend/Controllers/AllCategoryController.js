const db = require('../Configs/db_config')

exports.getTypes = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM type_name")
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

exports.getCategories = async (req, res) => {
    const { type_id } = req.params

    try {
        const [rows] = await db.query(
            "SELECT * FROM category_name WHERE type_id = ?",
            [type_id]
        )
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

exports.getSubCategories = async (req, res) => {
    const { type_id, category_id } = req.params

    try {
        const [rows] = await db.query(`SELECT * FROM sub_category WHERE type_id = ? AND category_id = ?`,[type_id, category_id]
        )
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

// =============================


exports.postDoctorLicense = async (req, res) => {
    const { type_id } = req.params;
    const { license_details, general_details, security_details } = req.body;

    try {

        // REQUIRED
        if (!license_details ||
            !license_details.clininc_upload_certificate ||
            !license_details.clinic_registration_number ||
            !license_details.clininc_expiry_date ||
            !license_details.practice_upload_certificate ||
            !license_details.practice_registration_number ||
            !license_details.practice_expiry_date ||
            !license_details.address_proof_upload ||
            !license_details.clinic_image
        ) {
            return res.status(400).json({
                message: "All doctor license fields are required under license_details"
            });
        }

        // license_details
        await db.query(
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

        // required 

        if (type_id == 3) {
            if (!general_details ||
                !general_details.doctor_name ||
                !general_details.speciality ||
                !general_details.clinic_name ||
                !general_details.address_1 ||
                !general_details.address_2 ||
                !general_details.address_3 ||
                !general_details.address_4 ||
                !general_details.area ||
                !general_details.pincode_id
            ) {
                return res.status(400).json({
                    message: "General details fields are required under general_details for type_id = 3"
                });
            }

            //general details
            await db.query(
                `INSERT INTO general_details
                (doctor_name, speciality, clinic_name,
                 address_1, address_2, address_3, address_4,
                 area, pincode_id, type_id)
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
        }

        //required

        if (type_id == 3) {
            if (!security_details ||
                !security_details.doctor_name ||
                !security_details.speciality ||
                !security_details.clinic_name ||
                !security_details.address_1 ||
                !security_details.address_2 ||
                !security_details.address_3 ||
                !security_details.address_4 ||
                !security_details.area ||
                !security_details.pincode_id
            ) {
                return res.status(400).json({
                    message: "General details fields are required under security_details for type_id = 3"
                });
            }

            //general details
            await db.query(
                `INSERT INTO security_details
                (mobile_number, email, upload_pan,
                 pan_number, upload_gst, gst_number, is_email,
                 is_mobile, type_id)
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
        }

        res.json({ message: "Doctor Security Detail Saved Successfully" });

    } catch (err) {
        res.status(500).json(err);
    }
};


exports.getDoctorLicense = async (req, res) => {
    const { type_id } = req.params;

    try {
        const [license] = await db.query(
            "SELECT * FROM license_details_doctor WHERE type_id=?",
            [type_id]
        );

        let generalDetails = []
        let securityDetail = []

        if(type_id ==3){
            const [general] = await db.query(`SELECT doctor_name , speciality ,clinic_name ,address_1, address_2, address_3, address_4,area, pincode_id 
                FROM general_details WHERE type_id=? `, [type_id] )

             generalDetails = general

         // ---------------- SECURITY DETAILS ----------------
        const [security] = await db.query(`SELECT 
                id ,mobile_number, email, upload_pan,
                 pan_number, upload_gst, gst_number, is_email,
                 is_mobile, type_id FROM security_details WHERE type_id=? `, [type_id] )

             securityDetail = security
        }
        
        else{
            return res.status(400).json({message:"Invalid doctor's general"})
        }

       
        res.json({
            license_details : license,
            general_details : generalDetails,
            security_details : securityDetail
        });
    } catch (err) {
        res.status(500).json(err);
    }
};


// ========================================================

exports.postHospitalLicense = async (req, res) => {
    const { type_id, category_id, sub_category_id } = req.params;

    const { license_details, general_details,security_detail} = req.body;

    try {
        let licenseQuery = "";
        let licenseValues = [];

        let generalQuery = "";
        let generalValues = [];

        let securityQuery = "";
        let securityValues = [];

        // ---------------- LICENSE INSERT ----------------
        if (type_id == 2 && category_id == 4 &&
            (sub_category_id == 1 || sub_category_id == 2 || sub_category_id == 3)) {

            licenseQuery = `
                INSERT INTO license_details_hospital
                (upload_registration_certificate, hospital_registration_number,
                 registration_date, image, type_id, category_id, sub_category_id)
                VALUES (?,?,?,?,?,?,?)
            `;

            licenseValues = [
                license_details.upload_registration_certificate,
                license_details.hospital_registration_number,
                license_details.registration_date,
                license_details.image,
                type_id,
                category_id,
                sub_category_id
            ];
        }

        else if (type_id == 2 && category_id == 5 && !sub_category_id) {

            licenseQuery = `
                INSERT INTO license_details_hospital
                (upload_govt_establishment_order, hospital_code,
                 national_identification_number, legal_start_date,
                 official_letter, type_id, category_id)
                VALUES (?,?,?,?,?,?,?)
            `;

            licenseValues = [
                license_details.upload_govt_establishment_order,
                license_details.hospital_code,
                license_details.national_identification_number,
                license_details.legal_start_date,
                license_details.official_letter,
                type_id,
                category_id
            ];
        }

        // ---------------- GENERAL INSERT ----------------
        if (type_id == 2 && category_id == 4 &&
            (sub_category_id == 1 || sub_category_id == 2 || sub_category_id == 3)) {

            generalQuery = `
                INSERT INTO general_details 
                (hospital_name, short_name, address_1, address_2, address_3, 
                 address_4, area, pincode_id, type_id, category_id, sub_category_id)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
            `;

            generalValues = [
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
            ];
        }

        else if (type_id == 2 && category_id == 5 && !sub_category_id) {

            generalQuery = `
                INSERT INTO general_details 
                (hospital_name, short_name, address_1, address_2, address_3, 
                 address_4, area, pincode_id, type_id, category_id)
                VALUES (?,?,?,?,?,?,?,?,?,?)
            `;

            generalValues = [
                general_details.hospital_name,
                general_details.short_name,
                general_details.address_1,
                general_details.address_2,
                general_details.address_3,
                general_details.address_4,
                general_details.area,
                general_details.pincode_id,
                type_id,
                category_id
            ];
        }
        // ---------------- Security INSERT ----------------
        if (type_id == 2 && category_id == 4 &&
            (sub_category_id == 1 || sub_category_id == 2 || sub_category_id == 3)) {

            securityQuery = `
                INSERT INTO security_details
                (mobile_number, email, upload_pan,
                 pan_number, upload_gst, gst_number, is_email,
                 is_mobile, type_id, category_id, sub_category_id)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
            `;

            securityValues = [
                security_detail.mobile_number,
                security_detail.email,
                security_detail.upload_pan,
                security_detail.pan_number,
                security_detail.upload_gst,
                security_detail.gst_number,
                security_detail.is_email,
                security_detail.is_mobile,
                type_id,
                category_id,
                sub_category_id
            ];
        }

        else if (type_id == 2 && category_id == 5 && !sub_category_id) {

            securityQuery = `
               INSERT INTO security_details
                (mobile_number, email, upload_pan,
                 pan_number, upload_gst, gst_number, is_email,
                 is_mobile, type_id, category_id, sub_category_id)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
            `;

            securityValues = [
                security_detail.mobile_number,
                security_detail.email,
                security_detail.upload_pan,
                security_detail.pan_number,
                security_detail.upload_gst,
                security_detail.gst_number,
                security_detail.is_email,
                security_detail.is_mobile,
                type_id,
                category_id
            ];
        }

        else {
            return res.status(400).json({ error: "Invalid Hospital Category" });
        }

        if (licenseQuery) await db.query(licenseQuery, licenseValues);
        if (generalQuery) await db.query(generalQuery, generalValues);
        if (securityQuery) await db.query(securityQuery, securityValues);

        res.json({
            message: "Hospital License Saved Successfully",
            license_details: licenseValues,
            general_details: generalValues,
            security_details: securityValues
        });

    } catch (err) {
        res.status(500).json(err);
    }
};





// GET
exports.getHospitalLicense = async (req, res) => {
    const { type_id, category_id, sub_category_id } = req.params;

    try {
        let licenseQuery = "";
        let licenseParams = [];

        let generalQuery = "";
        let generalParams = [];

        let securityQuery = "";
        let securityParams = [];

        // --- LICENSE DETAILS ---
        if (type_id == 2 && category_id == 4 &&
            (sub_category_id == 1 || sub_category_id == 2 || sub_category_id == 3)) {

            licenseQuery = `
                SELECT upload_registration_certificate, hospital_registration_number,
                       registration_date, image
                FROM license_details_hospital
                WHERE type_id=? AND category_id=? AND sub_category_id=?
            `;
            licenseParams = [type_id, category_id, sub_category_id];
        }

        else if (type_id == 2 && category_id == 5 && !sub_category_id) {

            licenseQuery = `
                SELECT upload_govt_establishment_order, hospital_code,
                       national_identification_number, legal_start_date,
                       official_letter
                FROM license_details_hospital
                WHERE type_id=? AND category_id=?
            `;
            licenseParams = [type_id, category_id];
        }

        // --- GENERAL DETAILS ---
        if (type_id == 2 && category_id == 4 &&
            (sub_category_id == 1 || sub_category_id == 2 || sub_category_id == 3)) {

            generalQuery = `
                SELECT hospital_name , short_name , address_1 , address_2 , address_3 ,
                       address_4, area, pincode_id
                FROM general_details
                WHERE type_id=? AND category_id=? AND sub_category_id=?
            `;
            generalParams = [type_id, category_id, sub_category_id];
        }

        else if (type_id == 2 && category_id == 5 && !sub_category_id) {

            generalQuery = `
                SELECT hospital_name , short_name , address_1 , address_2 , address_3 ,
                       address_4, area, pincode_id
                FROM general_details
                WHERE type_id=? AND category_id=?
            `;
            generalParams = [type_id, category_id];
        }
        // --- security Details ---
        if (type_id == 2 && category_id == 4 &&
            (sub_category_id == 1 || sub_category_id == 2 || sub_category_id == 3)) {

            securityQuery = `
                SELECT mobile_number, email, upload_pan,
                 pan_number, upload_gst, gst_number, is_email,
                 is_mobile
                FROM security_details
                WHERE type_id=? AND category_id=? AND sub_category_id=?
            `;
            securityParams = [type_id, category_id, sub_category_id];
        }

        else if (type_id == 2 && category_id == 5 && !sub_category_id) {

            securityQuery = `
                SELECT mobile_number, email, upload_pan,
                 pan_number, upload_gst, gst_number, is_email,
                 is_mobile FROM security_details
                WHERE type_id=? AND category_id=?
            `;
            securityParams = [type_id, category_id];
        }

        else {
            return res.status(400).json({ error: "Invalid Hospital Category" });
        }


        const [license] = await db.query(licenseQuery, licenseParams);
        const [general] = await db.query(generalQuery, generalParams);
        const [security] = await db.query(securityQuery, securityParams);

        res.json({
            license_details: license,
            general_details: general,
            security_detail:security
        });

    } catch (err) {
        res.status(500).json(err);
    }
};




// ========================================================

// POST
exports.postPharmacyLicense = async (req, res) => {
    const { type_id, category_id } = req.params;
    const { license_details, general_details , security_detail } = req.body;

    try {

        // ================================
        // LICENSE DETAILS SECTION
        // ================================
        let licenseQuery = "";
        let licenseValues = [];

        if (type_id == 1 && category_id == 1) {

            licenseQuery = `
                INSERT INTO license_details_pharmacy
                (20_upload_license, 20_drug_license_number, 20_expiry_date,
                 21_upload_license, 21_drug_license_number, 21_expiry_date,
                 pharmacy_image, type_id, category_id)
                VALUES (?,?,?,?,?,?,?,?,?)
            `;

            licenseValues = [
                license_details.license_20_upload,
                license_details.license_20_number,
                license_details.license_20_expiry,
                license_details.license_21_upload,
                license_details.license_21_number,
                license_details.license_21_expiry,
                license_details.pharmacy_image,
                type_id,
                category_id
            ];
        }

        else if (type_id == 1 && category_id == 2) {

            licenseQuery = `
                INSERT INTO license_details_pharmacy
                (20B_upload_license, 20B_drug_license_number, 20B_expiry_date,
                 21B_upload_license, 21B_drug_license_number, 21B_expiry_date,
                 pharmacy_image, type_id, category_id)
                VALUES (?,?,?,?,?,?,?,?,?)
            `;

            licenseValues = [
                license_details.license_20B_upload,
                license_details.license_20B_number,
                license_details.license_20B_expiry,
                license_details.license_21B_upload,
                license_details.license_21B_number,
                license_details.license_21B_expiry,
                license_details.pharmacy_image,
                type_id,
                category_id
            ];
        }

        else if (type_id == 1 && category_id == 3) {

            licenseQuery = `
                INSERT INTO license_details_pharmacy
                (20_upload_license, 20_drug_license_number, 20_expiry_date,
                 21_upload_license, 21_drug_license_number, 21_expiry_date,
                 20B_upload_license, 20B_drug_license_number, 20B_expiry_date,
                 21B_upload_license, 21B_drug_license_number, 21B_expiry_date,
                 pharmacy_image, type_id, category_id)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            `;

            licenseValues = [
                license_details.license_20_upload,
                license_details.license_20_number,
                license_details.license_20_expiry,
                license_details.license_21_upload,
                license_details.license_21_number,
                license_details.license_21_expiry,
                license_details.license_20B_upload,
                license_details.license_20B_number,
                license_details.license_20B_expiry,
                license_details.license_21B_upload,
                license_details.license_21B_number,
                license_details.license_21B_expiry,
                license_details.pharmacy_image,
                type_id,
                category_id
            ];
        }

        else {
            return res.status(400).json({ error: "Invalid Pharmacy Category" });
        }


        // ============= INSERT LICENSE DETAILS ==============
        await db.query(licenseQuery, licenseValues);


        // ================================
        // GENERAL DETAILS SECTION
        // ================================
        if (!general_details ||
            !general_details.pharmacy_name ||
            !general_details.cathlap ||
            !general_details.address_1 ||
            !general_details.address_2 ||
            !general_details.address_3 ||
            !general_details.address_4 ||
            !general_details.area ||
            !general_details.pincode_id
        ) {
            return res.status(400).json({
                message: "All general_details fields are required"
            });
        }

        const generalQuery = `
            INSERT INTO general_details 
            (pharmacy_name, cathlap, address_1, address_2, address_3, address_4, area, pincode_id, type_id, category_id)
            VALUES (?,?,?,?,?,?,?,?,?,?)
        `;

        const generalValues = [
            general_details.pharmacy_name,
            general_details.cathlap,
            general_details.address_1,
            general_details.address_2,
            general_details.address_3,
            general_details.address_4,
            general_details.area,
            general_details.pincode_id,
            type_id,
            category_id
        ];

        await db.query(generalQuery, generalValues);


        //  security_detail

        if (!security_detail.mobile_number ||
            !security_detail.email ||
            !security_detail.upload_pan ||
            !security_detail.pan_number ||
            !security_detail.upload_gst ||
            !security_detail.gst_number ||
            !security_detail.is_email ||
            !security_detail.is_mobile
        ) {
            return res.status(400).json({
                message: "All security_detail fields are required"
            });
        }

        const securityQuery = `
            INSERT INTO security_detail 
            (mobile_number, email, upload_pan,
                 pan_number, upload_gst, gst_number, is_email,
                 is_mobile, type_id)
                VALUES (?,?,?,?,?,?,?,?,?)
        `;

        const securityValues = [
            security_detail.mobile_number ,
            security_detail.email ,
            security_detail.upload_pan ,
            security_detail.pan_number ,
            security_detail.upload_gst ,
            security_detail.gst_number ,
            security_detail.is_email ,
            security_detail.is_mobile,
            type_id,
            category_id
        ];

        await db.query(securityQuery, securityValues);


        res.json({ message: "Pharmacy Saved Successfully" });

    } catch (err) {
        res.status(500).json(err);
    }
};



// =============================

// GET
exports.getPharmacyLicense = async (req, res) => {
    const { type_id, category_id } = req.params;

    try {
        let licenseQuery = "";
        let generalQuery = "";
        let securityQuery = "";
        let licenseParams = [type_id, category_id];
        let generalParams = [type_id, category_id];
        let securityParams = [type_id, category_id];

        // ---------------- LICENSE DETAILS ----------------
        if (type_id == 1 && category_id == 1) {
            licenseQuery = `
                SELECT id, 20_upload_license, 20_drug_license_number, 20_expiry_date,
                       21_upload_license, 21_drug_license_number, 21_expiry_date,
                       pharmacy_image
                FROM license_details_pharmacy
                WHERE type_id=? AND category_id=?
            `;
        }
        else if (type_id == 1 && category_id == 2) {
            licenseQuery = `
                SELECT id, 20B_upload_license, 20B_drug_license_number, 20B_expiry_date,
                       21B_upload_license, 21B_drug_license_number, 21B_expiry_date,
                       pharmacy_image
                FROM license_details_pharmacy
                WHERE type_id=? AND category_id=?
            `;
        }
        else if (type_id == 1 && category_id == 3) {
            licenseQuery = `
                SELECT * 
                FROM license_details_pharmacy
                WHERE type_id=? AND category_id=?
            `;
        }
        else {
            return res.status(400).json({ error: "Invalid Pharmacy Category" });
        }

        // ---------------- GENERAL DETAILS ----------------
        if (type_id == 1 && (category_id == 1 || category_id == 2 || category_id == 3)) {
            generalQuery = `
                SELECT id, pharmacy_name, cathlap, address_1, address_2, address_3,
                       address_4, area, pincode_id, type_id, category_id
                FROM general_details
                WHERE type_id=? AND category_id=?
            `;
        }
        // ---------------- security DETAILS ----------------
        if (type_id == 1 && (category_id == 1 || category_id == 2 || category_id == 3)) {
            securityQuery = `
                SELECT 
                id ,mobile_number, email, upload_pan,
                 pan_number, upload_gst, gst_number, is_email,
                 is_mobile, type_id FROM security_details
                WHERE type_id=? AND category_id=?
            `;
        }

        // ---------------- EXECUTE QUERIES ----------------
        const [license_rows] = licenseQuery ? await db.query(licenseQuery, licenseParams) : [[]];
        const [general_rows] = generalQuery ? await db.query(generalQuery, generalParams) : [[]];
        const [security_rows] = securityQuery ? await db.query(securityQuery, securityParams) : [[]];

        // ---------------- RETURN SAME FORMAT ----------------
        res.json({
            license_details: license_rows,
            general_details: general_rows,
            security_details: security_rows
        });

    } catch (err) {
        res.status(500).json(err);
    }
};

