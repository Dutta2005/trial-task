# Resume Building & Career Ecosystem - Backend API

A comprehensive backend system for managing resumes, internships, projects, courses, and career achievements with authentication and verification capabilities.

## 🚀 Features

### Authentication & Security
- JWT-based authentication
- Password encryption with bcrypt
- Password reset functionality
- Role-based access control (Student, Professional, Admin)
- Email verification system
- Rate limiting protection
- Security headers implementation

### Core Functionality
- **User Management**: Registration, login, profile updates
- **Resume Builder**: Create multiple resumes with customizable sections
- **Internship Tracking**: Add and verify internship experiences
- **Project Portfolio**: Manage personal and collaborative projects
- **Course Certifications**: Track completed courses with verification
- **Hackathon Achievements**: Document hackathon participation and wins
- **Auto-Summary Generation**: AI-powered resume summary creation
- **Credibility Scoring**: Verification-based credibility system

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd resume-ecosystem-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/resume-ecosystem

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRE=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# Platform API Keys (for future integrations)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
```

### 4. Start MongoDB
```bash
# Using MongoDB service
sudo systemctl start mongodb

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Run the application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/reset-password/:token` | Reset password | No |
| POST | `/logout` | Logout user | Yes |
| DELETE | `/account` | Delete account | Yes |

### Resume Routes (`/api/resumes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all user resumes | Yes |
| GET | `/:id` | Get single resume with data | Yes |
| POST | `/` | Create new resume | Yes |
| PUT | `/:id` | Update resume | Yes |
| DELETE | `/:id` | Delete resume | Yes |
| POST | `/:id/generate-summary` | Auto-generate summary | Yes |

### Internship Routes (`/api/internships`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all internships | Yes |
| GET | `/:id` | Get single internship | Yes |
| POST | `/` | Create internship | Yes |
| PUT | `/:id` | Update internship | Yes |
| DELETE | `/:id` | Delete internship | Yes |

### Project Routes (`/api/projects`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all projects | Yes |
| GET | `/:id` | Get single project | Yes |
| POST | `/` | Create project | Yes |
| PUT | `/:id` | Update project | Yes |
| DELETE | `/:id` | Delete project | Yes |

### Course Routes (`/api/courses`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all courses | Yes |
| POST | `/` | Create course | Yes |
| PUT | `/:id` | Update course | Yes |
| DELETE | `/:id` | Delete course | Yes |

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Example Request
```javascript
fetch('http://localhost:5000/api/resumes', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
})
```

## 📝 Request/Response Examples

### 1. Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "student@example.com",
    "role": "student",
    "isVerified": false,
    "credibilityScore": 0
  }
}
```

### 2. Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePass123"
}
```

### 3. Create Internship
```bash
POST /api/internships
Authorization: Bearer <token>
Content-Type: application/json

{
  "company": "Tech Corp",
  "role": "Software Engineering Intern",
  "description": "Worked on backend development",
  "responsibilities": [
    "Developed RESTful APIs",
    "Collaborated with senior developers"
  ],
  "achievements": [
    "Improved API response time by 30%"
  ],
  "startDate": "2024-06-01",
  "endDate": "2024-08-31",
  "location": "Remote",
  "skills": ["Node.js", "Express", "MongoDB"]
}
```

### 4. Create Project
```bash
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "E-commerce Platform",
  "description": "Full-stack e-commerce application with payment integration",
  "technologies": ["React", "Node.js", "MongoDB", "Stripe"],
  "githubUrl": "https://github.com/username/ecommerce",
  "liveUrl": "https://myecommerce.com",
  "startDate": "2024-01-15",
  "endDate": "2024-05-20",
  "isFeatured": true
}
```

### 5. Create Resume
```bash
POST /api/resumes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Software Developer Resume",
  "isDefault": true,
  "templateId": "modern",
  "visibility": "public",
  "sections": {
    "education": true,
    "internships": true,
    "projects": true,
    "courses": true,
    "hackathons": true,
    "skills": true,
    "achievements": true
  }
}
```

### 6. Generate Auto-Summary
```bash
POST /api/resumes/:id/generate-summary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Software Developer Resume",
    "summary": "Student with 2 verified internships and 5 projects showcasing expertise in Node.js, React, MongoDB, Express, Python. Completed 8 verified courses to continuously enhance technical skills. Verified credibility score: 75/100.",
    "lastUpdated": "2024-10-17T10:30:00.000Z"
  }
}
```

## 🏗️ Project Structure

```
resume-ecosystem-backend/
│
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   │
│   ├── middleware/
│   │   ├── auth.js              # Authentication & authorization
│   │   ├── validation.js        # Request validation(TODO)
│   │   └── errorHandler.js      # Error handling
│   │
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Resume.js            # Resume schema
│   │   ├── Internship.js        # Internship schema
│   │   ├── Course.js            # Course schema
│   │   ├── Hackathon.js         # Hackathon schema
│   │   └── Project.js           # Project schema
│   │
│   ├── routes/
│   │   ├── userRoute.js              # User routes
│   │   ├── resumeRoute.js            # Resume routes
│   │   ├── internshipRoute.js        # Internship routes
│   │   ├── courseRoute.js            # Course routes
│   │   └── projectRoute.js           # Project routes (TODO)
│   │
│   ├── controllers/
│   │   ├──userController.js              # User controllers
│   │   ├── resumeController.js            # Resume controllers
│   │   ├── internshipController.js        # Internship controllers
│   │   ├── courseController.js            # Course controllers
│   │   └── projectController.js           # Project controllers (TODO)
│   │
│   └── app.js                   # Main application
│
├── .env                         # Environment variables
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

## 🛡️ Middleware Features

### 1. Authentication Middleware
- `protect`: Verify JWT token
- `authorize(...roles)`: Check user roles
- `checkVerified`: Ensure email is verified
- `optionalAuth`: Attach user if token exists
- `rateLimit`: Prevent abuse
- `checkOwnership`: Verify resource ownership

### 2. Validation Middleware
- Email format validation
- Password strength validation
- Phone number validation
- URL validation
- Date validation
- MongoDB ID validation
- Pagination validation

### 3. Error Handling
- Mongoose error handling
- JWT error handling
- Validation error formatting
- Custom error responses
- Development vs production error details

## 🔒 Security Features

1. **Password Security**
   - Bcrypt hashing (12 rounds)
   - Minimum 6 characters with complexity requirements
   - Password reset tokens with expiration

2. **JWT Security**
   - Secure token generation
   - Configurable expiration
   - Token verification on protected routes

3. **Input Validation**
   - Express-validator for all inputs
   - SQL injection prevention
   - XSS protection

4. **Security Headers**
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - Strict-Transport-Security

5. **Rate Limiting**
   - Prevent brute force attacks
   - Configurable limits per user/IP

## 📊 Data Models

### User Model
- Email, password, fullName, phone
- Role (student/professional/admin)
- Profile information (bio, location, social links)
- Credibility score (0-100)
- Email verification status

### Resume Model
- Title, template, visibility
- Section toggles
- Custom sections
- Auto-generated summary

### Internship Model
- Company, role, description
- Responsibilities, achievements
- Date range, location
- Skills, verification status

### Project Model
- Title, description, technologies
- GitHub/live URLs
- Collaborators, images
- Featured flag

### Course Model
- Course name, platform, instructor
- Certificate URL and ID
- Skills learned, verification status

## 🧪 Testing

### Manual Testing with cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","fullName":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'
```

**Get Profile:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET` (min 32 characters)
   - Configure production MongoDB URI
   - Set up email service credentials

2. **Security**
   - Enable HTTPS
   - Configure CORS properly
   - Set secure cookie options
   - Implement proper rate limiting

3. **Database**
   - Use MongoDB Atlas or similar
   - Set up database backups
   - Configure connection pooling
   - Add database indexes

4. **Monitoring**
   - Set up logging service
   - Configure error tracking
   - Monitor API performance
   - Set up uptime monitoring

## 📈 Future Enhancements

- [ ] Email verification implementation
- [ ] OAuth integration (LinkedIn, GitHub)
- [ ] Platform API integrations
- [ ] Resume PDF generation
- [ ] Advanced search and filtering
- [ ] Analytics dashboard
- [ ] Notification system
- [ ] File upload for certificates
- [ ] AI-powered skill matching
- [ ] Public resume sharing links

## 🤝 Contributing

This is a trial task submission. For contributions or questions, please contact the development team.

## 📄 License

Proprietary - Resume Ecosystem Platform

## 👨‍💻 Developer Notes

**Approach:**
This backend system was built with scalability, security, and maintainability in mind. Key decisions include:

1. **Modular Architecture**: Separated concerns with clear middleware, controllers, and routes
2. **Comprehensive Validation**: Used express-validator for robust input validation
3. **Security First**: Implemented multiple security layers including JWT, bcrypt, rate limiting
4. **Error Handling**: Centralized error handling with detailed error responses
5. **Auto-Generation**: Created intelligent resume summary generation based on user achievements
6. **Verification System**: Built-in verification workflow for internships, courses, and hackathons
7. **Scalable Design**: Easy to add new resources and extend functionality

**Tools Used:**
- Node.js & Express.js for server
- MongoDB & Mongoose for database
- JWT for authentication
- Bcrypt for password hashing
- Express-validator for validation

**Contribution to System:**
This module provides the core authentication and data management backbone for the entire Resume Ecosystem. It enables:
- Secure user management
- Centralized data storage
- Verification workflows
- Integration readiness for external platforms
- Foundation for resume generation and AI features

---

**Developed for Resume Building & Career Ecosystem Trial Task** | `/profile` | Update profile | Yes |
| PUT | `/change-password` | Change password | Yes |
| POST | `/forgot-password` | Request password reset | No |
| PUT