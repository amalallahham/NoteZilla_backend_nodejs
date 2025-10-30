const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const users = require('../controllers/admin/userAdminController');
const videos = require('../controllers/admin/videoAdminController');
const dash  = require('../controllers/admin/dashboardController');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));


module.exports = router;
