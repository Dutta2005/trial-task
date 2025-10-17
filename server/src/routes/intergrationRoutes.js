const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.js');
const {connectPlatform, disconnectPlatform, getIntegrations, syncPlatformData, webhookHandler} = require('../controllers/integrationController.js');


router.get('/', protect, getIntegrations);
router.post('/connect/:platform', protect, connectPlatform);
router.delete('/disconnect/:platform', protect, disconnectPlatform);
router.post('/sync/:platform', protect, syncPlatformData);
router.post('/webhook/:platform', webhookHandler);

module.exports = router;
