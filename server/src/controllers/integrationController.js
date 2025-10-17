const axios = require('axios');
const PlatformIntegration = require('../models/PlatformIntegration.js');
const Course = require('../models/Course.js');
const Internship = require('../models/Internship.js');
const Hackathon = require('../models/Hackathon.js');
const Project = require('../models/Project.js');
const Skill = require('../models/Skill.js');
const Resume = require('../models/Resume.js');

// @desc    Get all platform integrations for user
// @route   GET /api/integrations
// @access  Private
exports.getIntegrations = async (req, res, next) => {
  try {
    const integrations = await PlatformIntegration.find({ userId: req.user.id })
      .select('-accessToken -refreshToken');

    res.status(200).json({
      success: true,
      count: integrations.length,
      data: integrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connect to external platform
// @route   POST /api/integrations/connect/:platform
// @access  Private
exports.connectPlatform = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { accessToken, refreshToken, platformUserId } = req.body;

    const supportedPlatforms = ['linkedin', 'github', 'coursera', 'udemy', 'hackerrank', 'leetcode', 'devfolio'];
    if (!supportedPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform not supported'
      });
    }

    let integration = await PlatformIntegration.findOne({
      userId: req.user.id,
      platformName: platform
    });

    if (integration) {
      integration.accessToken = accessToken;
      integration.refreshToken = refreshToken;
      integration.platformUserId = platformUserId;
      integration.syncStatus = 'active';
      integration.connectedAt = Date.now();
      await integration.save();
    } else {
      integration = await PlatformIntegration.create({
        userId: req.user.id,
        platformName: platform,
        accessToken,
        refreshToken,
        platformUserId,
        syncStatus: 'active'
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully connected to ${platform}`,
      data: {
        platformName: integration.platformName,
        connectedAt: integration.connectedAt,
        syncStatus: integration.syncStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disconnect from external platform
// @route   DELETE /api/integrations/disconnect/:platform
// @access  Private
exports.disconnectPlatform = async (req, res, next) => {
  try {
    const { platform } = req.params;

    const integration = await PlatformIntegration.findOneAndDelete({
      userId: req.user.id,
      platformName: platform
    });

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully disconnected from ${platform}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync data from external platform
// @route   POST /api/integrations/sync/:platform
// @access  Private
exports.syncPlatformData = async (req, res, next) => {
  try {
    const { platform } = req.params;

    const integration = await PlatformIntegration.findOne({
      userId: req.user.id,
      platformName: platform
    });

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Platform not connected'
      });
    }

    let syncedData = {};

    switch (platform) {
      case 'github':
        syncedData = await syncGithubData(req.user.id, integration);
        break;
      case 'linkedin':
        syncedData = await syncLinkedInData(req.user.id, integration);
        break;
      case 'coursera':
        syncedData = await syncCourseraData(req.user.id, integration);
        break;
      case 'udemy':
        syncedData = await syncUdemyData(req.user.id, integration);
        break;
      case 'devfolio':
        syncedData = await syncDevfolioData(req.user.id, integration);
        break;
      case 'hackerrank':
        syncedData = await syncHackerRankData(req.user.id, integration);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Sync not implemented for this platform'
        });
    }

    integration.lastSync = Date.now();
    await integration.save();

    await Resume.updateOne(
      { userId: req.user.id, isDefault: true },
      { lastUpdated: Date.now() }
    );

    res.status(200).json({
      success: true,
      message: `Successfully synced data from ${platform}`,
      data: syncedData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Webhook handler for platform updates
// @route   POST /api/integrations/webhook/:platform
// @access  Public (with verification)
exports.webhookHandler = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const webhookData = req.body;

    switch (platform) {
      case 'github':
        await handleGithubWebhook(webhookData);
        break;
      case 'coursera':
        await handleCourseraWebhook(webhookData);
        break;
      case 'devfolio':
        await handleDevfolioWebhook(webhookData);
        break;
      default:
        console.log(`Webhook received from unsupported platform: ${platform}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};


// PLATFORM-SPECIFIC SYNC FUNCTIONS


// Sync GitHub data
async function syncGithubData(userId, integration) {
  try {
    const { accessToken, platformUserId } = integration;

    const reposResponse = await axios.get(
      `https://api.github.com/users/${platformUserId}/repos`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );

    const repos = reposResponse.data;
    let syncedProjects = 0;

    for (const repo of repos.slice(0, 10)) {
      const existingProject = await Project.findOne({
        userId,
        githubUrl: repo.html_url
      });

      if (!existingProject && !repo.fork) {
        await Project.create({
          userId,
          title: repo.name,
          description: repo.description || 'GitHub repository',
          technologies: repo.language ? [repo.language] : [],
          githubUrl: repo.html_url,
          liveUrl: repo.homepage || null,
          startDate: new Date(repo.created_at),
          endDate: repo.updated_at ? new Date(repo.updated_at) : null
        });
        syncedProjects++;
      }
    }

    const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];
    for (const lang of languages) {
      const existingSkill = await Skill.findOne({
        userId,
        skillName: lang
      });

      if (!existingSkill) {
        await Skill.create({
          userId,
          skillName: lang,
          category: 'technical',
          proficiencyLevel: 'intermediate',
          verifiedBy: [{
            source: 'GitHub',
            date: new Date()
          }]
        });
      }
    }

    return {
      projectsSynced: syncedProjects,
      skillsExtracted: languages.length
    };
  } catch (error) {
    console.error('GitHub sync error:', error.message);
    throw new Error('Failed to sync GitHub data');
  }
}

// Sync LinkedIn data
async function syncLinkedInData(userId, integration) {
  try {
    const { accessToken } = integration;

    const profileResponse = await axios.get(
      'https://api.linkedin.com/v2/me',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    // Fetch positions
    const positionsResponse = await axios.get(
      'https://api.linkedin.com/v2/positions',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    let syncedInternships = 0;

    if (positionsResponse.data && positionsResponse.data.elements) {
      for (const position of positionsResponse.data.elements) {
        const existingInternship = await Internship.findOne({
          userId,
          company: position.companyName,
          role: position.title
        });

        if (!existingInternship) {
          await Internship.create({
            userId,
            company: position.companyName,
            role: position.title,
            description: position.description || '',
            startDate: new Date(position.timePeriod.startDate.year, position.timePeriod.startDate.month - 1),
            endDate: position.timePeriod.endDate ? new Date(position.timePeriod.endDate.year, position.timePeriod.endDate.month - 1) : null,
            platformName: 'LinkedIn',
            verificationStatus: 'verified'
          });
          syncedInternships++;
        }
      }
    }

    return {
      internshipsSynced: syncedInternships
    };
  } catch (error) {
    console.error('LinkedIn sync error:', error.message);
    throw new Error('Failed to sync LinkedIn data');
  }
}

// Sync Coursera data
async function syncCourseraData(userId, integration) {
  try {
    const { accessToken } = integration;

    const coursesResponse = await axios.get(
      'https://api.coursera.org/api/courses.v1',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    let syncedCourses = 0;

    if (coursesResponse.data && coursesResponse.data.elements) {
      for (const courseData of coursesResponse.data.elements) {
        const existingCourse = await Course.findOne({
          userId,
          courseName: courseData.name,
          platform: 'Coursera'
        });

        if (!existingCourse) {
          await Course.create({
            userId,
            courseName: courseData.name,
            platform: 'Coursera',
            instructor: courseData.instructors ? courseData.instructors.join(', ') : '',
            completionDate: new Date(),
            verificationStatus: 'verified',
            skillsLearned: courseData.skills || []
          });
          syncedCourses++;
        }
      }
    }

    return {
      coursesSynced: syncedCourses
    };
  } catch (error) {
    console.error('Coursera sync error:', error.message);
    throw new Error('Failed to sync Coursera data');
  }
}

// Sync Udemy data
async function syncUdemyData(userId, integration) {
  try {
    // Similar implementation to Coursera
    // Udemy API documentation: https://www.udemy.com/developers/

    return {
      coursesSynced: 0,
      message: 'Udemy sync requires user consent'
    };
  } catch (error) {
    console.error('Udemy sync error:', error.message);
    throw new Error('Failed to sync Udemy data');
  }
}

// Sync Devfolio data (for hackathons)
async function syncDevfolioData(userId, integration) {
  try {
    const { accessToken } = integration;

    const hackathonsResponse = await axios.get(
      'https://api.devfolio.co/v1/hackathons/participated',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    let syncedHackathons = 0;

    if (hackathonsResponse.data && hackathonsResponse.data.hackathons) {
      for (const hack of hackathonsResponse.data.hackathons) {
        const existingHackathon = await Hackathon.findOne({
          userId,
          name: hack.name
        });

        if (!existingHackathon) {
          await Hackathon.create({
            userId,
            name: hack.name,
            organizer: hack.organizer || '',
            position: hack.position || '',
            projectName: hack.project.name || '',
            projectDescription: hack.project.description || '',
            technologies: hack.project.technologies || [],
            date: new Date(hack.date),
            projectUrl: hack.project.url || '',
            verificationStatus: 'verified'
          });
          syncedHackathons++;
        }
      }
    }

    return {
      hackathonsSynced: syncedHackathons
    };
  } catch (error) {
    console.error('Devfolio sync error:', error.message);
    throw new Error('Failed to sync Devfolio data');
  }
}

// Sync HackerRank data
async function syncHackerRankData(userId, integration) {
  try {
    const { accessToken, platformUserId } = integration;

    const profileResponse = await axios.get(
      `https://www.hackerrank.com/rest/hackers/${platformUserId}/scores_elo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    let syncedSkills = 0;

    if (profileResponse.data && profileResponse.data.models) {
      for (const model of profileResponse.data.models) {
        const existingSkill = await Skill.findOne({
          userId,
          skillName: model.track
        });

        if (!existingSkill) {
          let proficiency = 'beginner';
          if (model.score > 1500) proficiency = 'expert';
          else if (model.score > 1000) proficiency = 'advanced';
          else if (model.score > 500) proficiency = 'intermediate';

          await Skill.create({
            userId,
            skillName: model.track,
            category: 'technical',
            proficiencyLevel: proficiency,
            verifiedBy: [{
              source: 'HackerRank',
              date: new Date()
            }]
          });
          syncedSkills++;
        }
      }
    }

    return {
      skillsSynced: syncedSkills
    };
  } catch (error) {
    console.error('HackerRank sync error:', error.message);
    throw new Error('Failed to sync HackerRank data');
  }
}

// WEBHOOK HANDLERS


async function handleGithubWebhook(data) {
  console.log('GitHub webhook received:', data);
}

async function handleCourseraWebhook(data) {
  console.log('Coursera webhook received:', data);
}

async function handleDevfolioWebhook(data) {
  console.log('Devfolio webhook received:', data);
}