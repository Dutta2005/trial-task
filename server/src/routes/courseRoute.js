const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.js');
const {addCourse, deleteCourse, getCourses, updateCourse} = require('../controllers/courseController');


router.get('/courses', protect, getCourses);
router.post('/courses', protect, addCourse);
router.put('/courses/:id', protect, updateCourse);
router.delete('/courses/:id', protect, deleteCourse);

module.exports = router;
