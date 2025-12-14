const db = require("../Configs/db_config");



exports.handleView = async (req, res) => {
  const { view } = req.query;

  if (view === 'type') {
    return exports.getOnboard(req, res);
  }

  if (view === 'categories') {
    if (!req.params.type_id) {
      return res.status(400).json({ message: 'type_id is required' });
    }
    return exports.getTypeCategories(req, res);
  }

  if (view === 'subcategories') {
    const { type_id, category_id } = req.params;
    if (!type_id || !category_id) {
      return res.status(400).json({ message: 'type_id and category_id are required' });
    }
    return exports.getCategorySubCategories(req, res);
  }

  return res.status(400).json({
    message: 'Invalid or missing view query parameter'
  });
};



exports.getOnboard = async (req, res) => {
  try {
    const [types] = await db.query(`SELECT * FROM type_name`);
    res.json({ types: types });
  } catch (err) {
    res.status(500).json(err);
  }
};



exports.getTypeCategories = async (req, res) => {
  const { type_id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT id, category_name FROM category_name WHERE type_id = ?",
      [type_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getCategorySubCategories = async (req, res) => {
  const { type_id, category_id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT id, sub_category_name FROM sub_category WHERE type_id = ? AND category_id = ?",
      [type_id, category_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
};


