const Resume = require('../models/Resume.js');
const User = require('../models/User.js');
const Internship = require('../models/Internship.js');
const Course = require('../models/Course.js');
const Hackathon = require('../models/Hackathon.js');
const Project = require('../models/Project.js');
const Skill = require('../models/Skill.js');

// @desc    Get all resumes for user
// @route   GET /api/resumes
// @access  Private
exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ isDefault: -1, lastUpdated: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resume with full data
// @route   GET /api/resumes/:id
// @access  Private
exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const [user, internships, courses, hackathons, projects, skills] = await Promise.all([
      User.findById(req.user.id),
      resume.sections.internships ? Internship.find({ userId: req.user.id }).sort({ startDate: -1 }) : [],
      resume.sections.courses ? Course.find({ userId: req.user.id }).sort({ completionDate: -1 }) : [],
      resume.sections.hackathons ? Hackathon.find({ userId: req.user.id }).sort({ date: -1 }) : [],
      resume.sections.projects ? Project.find({ userId: req.user.id }).sort({ startDate: -1 }) : [],
      resume.sections.skills ? Skill.find({ userId: req.user.id }) : []
    ]);

    res.status(200).json({
      success: true,
      data: {
        resume,
        user: {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          location: user.location,
          linkedinUrl: user.linkedinUrl,
          githubUrl: user.githubUrl,
          portfolioUrl: user.portfolioUrl,
          bio: user.bio
        },
        internships,
        courses,
        hackathons,
        projects,
        skills
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
exports.createResume = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;

    if (req.body.isDefault) {
      await Resume.updateMany(
        { userId: req.user.id },
        { isDefault: false }
      );
    }

    const resume = await Resume.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
exports.updateResume = async (req, res, next) => {
  try {
    let resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    if (req.body.isDefault) {
      await Resume.updateMany(
        { userId: req.user.id, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }

    req.body.lastUpdated = Date.now();
    resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate resume summary using AI logic
// @route   POST /api/resumes/:id/generate-summary
// @access  Private
exports.generateSummary = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }


    const [user, internships, courses, hackathons, projects, skills] = await Promise.all([
      User.findById(req.user.id),
      Internship.find({ userId: req.user.id, verificationStatus: 'verified' }),
      Course.find({ userId: req.user.id, verificationStatus: 'verified' }),
      Hackathon.find({ userId: req.user.id, verificationStatus: 'verified' }),
      Project.find({ userId: req.user.id }),
      Skill.find({ userId: req.user.id })
    ]);

    const summary = generateProfessionalSummary({
      user,
      internships,
      courses,
      hackathons,
      projects,
      skills
    });

    resume.summary = summary;
    resume.lastUpdated = Date.now();
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Summary generated successfully',
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate professional summary
function generateProfessionalSummary(data) {
  const { user, internships, courses, hackathons, projects, skills } = data;
  
  let summary = '';
  
  const role = internships.length > 0 
    ? internships[0].role 
    : user.role === 'student' ? 'Student' : 'Professional';
  
  summary += `${role} with `;
 
  if (internships.length > 0) {
    summary += `${internships.length} internship${internships.length > 1 ? 's' : ''} `;
  }
  
  if (courses.length > 0) {
    summary += `and ${courses.length} completed course${courses.length > 1 ? 's' : ''} `;
  }

  if (skills.length > 0) {
    const topSkills = skills
      .filter(s => s.category === 'technical')
      .slice(0, 5)
      .map(s => s.skillName);
    
    if (topSkills.length > 0) {
      summary += `specializing in ${topSkills.join(', ')}. `;
    }
  }

  if (projects.length > 0 || hackathons.length > 0) {
    summary += `Demonstrated expertise through ${projects.length} project${projects.length !== 1 ? 's' : ''}`;
    
    if (hackathons.length > 0) {
      summary += ` and participation in ${hackathons.length} hackathon${hackathons.length !== 1 ? 's' : ''}`;
    }
    summary += '. ';
  }

  summary += 'Passionate about leveraging technology to solve real-world problems and continuously learning new skills.';
  
  return summary;
}