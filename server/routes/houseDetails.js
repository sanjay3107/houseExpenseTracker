const express = require('express');
const router = express.Router();
const houseDetailsController = require('../controllers/houseDetailsController');
const auth = require('../middleware/auth'); // Import auth middleware

// All routes require authentication
router.use(auth);

// GET house details
router.get('/', houseDetailsController.getHouseDetails);

// POST create house details
router.post('/', houseDetailsController.createHouseDetails);

// PUT update house details
router.put('/', houseDetailsController.updateHouseDetails);

// DELETE house details
router.delete('/', houseDetailsController.deleteHouseDetails);

module.exports = router;
