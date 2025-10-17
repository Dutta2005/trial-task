import React from 'react';
import { Database, Users, Award, BookOpen, Code, Briefcase, Shield } from 'lucide-react';

export default function DatabaseSchema() {
  const tables = [
    {
      name: 'users',
      icon: Users,
      color: 'bg-blue-500',
      fields: ['id', 'email', 'password_hash', 'full_name', 'phone', 'role', 'is_verified', 'profile_picture', 'linkedin_url', 'github_url', 'portfolio_url', 'created_at', 'updated_at']
    },
    {
      name: 'resumes',
      icon: Briefcase,
      color: 'bg-green-500',
      fields: ['id', 'user_id (FK)', 'title', 'is_default', 'template_id', 'visibility', 'last_updated', 'created_at']
    },
    {
      name: 'education',
      icon: BookOpen,
      color: 'bg-purple-500',
      fields: ['id', 'user_id (FK)', 'institution', 'degree', 'field_of_study', 'start_date', 'end_date', 'grade', 'is_verified']
    },
    {
      name: 'internships',
      icon: Briefcase,
      color: 'bg-orange-500',
      fields: ['id', 'user_id (FK)', 'company', 'role', 'description', 'start_date', 'end_date', 'certificate_url', 'verification_status', 'platform_id']
    },
    {
      name: 'courses',
      icon: BookOpen,
      color: 'bg-indigo-500',
      fields: ['id', 'user_id (FK)', 'course_name', 'platform', 'completion_date', 'certificate_id', 'skills_learned', 'verification_status']
    },
    {
      name: 'hackathons',
      icon: Code,
      color: 'bg-red-500',
      fields: ['id', 'user_id (FK)', 'name', 'organizer', 'position', 'project_name', 'project_description', 'date', 'certificate_url', 'verification_status']
    },
    {
      name: 'projects',
      icon: Code,
      color: 'bg-teal-500',
      fields: ['id', 'user_id (FK)', 'title', 'description', 'technologies', 'github_url', 'live_url', 'start_date', 'end_date', 'is_featured']
    },
    {
      name: 'skills',
      icon: Award,
      color: 'bg-yellow-500',
      fields: ['id', 'user_id (FK)', 'skill_name', 'category', 'proficiency_level', 'verified_by', 'years_of_experience']
    },
    {
      name: 'achievements',
      icon: Award,
      color: 'bg-pink-500',
      fields: ['id', 'user_id (FK)', 'title', 'description', 'date', 'type', 'issuer', 'verification_status']
    },
    {
      name: 'platform_integrations',
      icon: Shield,
      color: 'bg-gray-500',
      fields: ['id', 'user_id (FK)', 'platform_name', 'platform_user_id', 'access_token', 'refresh_token', 'connected_at', 'last_sync']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="w-12 h-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Database Schema</h1>
          </div>
          <p className="text-blue-200 text-lg">Resume Building & Career Ecosystem</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table, idx) => {
            const Icon = table.icon;
            return (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${table.color} p-2 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{table.name}</h3>
                </div>
                <div className="space-y-2">
                  {table.fields.map((field, fieldIdx) => (
                    <div
                      key={fieldIdx}
                      className="text-sm text-blue-100 bg-white/5 px-3 py-1.5 rounded border border-white/10"
                    >
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Key Relationships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-white mb-2">One-to-Many</p>
              <ul className="space-y-1 text-sm">
                <li>→ users → resumes</li>
                <li>→ users → education</li>
                <li>→ users → internships</li>
                <li>→ users → courses</li>
                <li>→ users → projects</li>
                <li>→ users → skills</li>
              </ul>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-white mb-2">Features</p>
              <ul className="space-y-1 text-sm">
                <li>✓ Auto-verification status</li>
                <li>✓ Platform integration tracking</li>
                <li>✓ Real-time sync capabilities</li>
                <li>✓ Multi-resume support</li>
                <li>✓ Skill verification system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}