const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.js');
const {addInternship, deleteInternship, getInternships, updateInternship} = require('../controllers/internshipController');

router.get('/internships', protect, getInternships);
router.post('/internships', protect, addInternship);
router.put('/internships/:id', protect, updateInternship);
router.delete('/internships/:id', protect, deleteInternship);


module.exports = router;
