const express = require('express');
const router = express.Router();
const { getResumes, getResume, createResume, updateResume, deleteResume, generateSummary } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');


router.get('/', protect, getResumes);
router.get('/:id', protect, getResume);
router.post('/', protect, createResume);
router.put('/:id', protect, updateResume);
router.delete('/:id', protect, deleteResume);
router.post('/:id/generate-summary', protect, generateSummary);

module.exports = router;