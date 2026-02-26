import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import ProjectHeader from '../components/project/ProjectHeader';
import ProjectOverview from '../components/project/ProjectOverview';
import ProjectRuns from '../components/project/ProjectRuns';
import ProjectCode from '../components/project/ProjectCode';
import ProjectVariables from '../components/project/ProjectVariables';
import ProjectState from '../components/project/ProjectState';
import ProjectSecurity from '../components/project/ProjectSecurity';
import ProjectSettings from '../components/project/ProjectSettings';
import ProjectGit from '../components/project/ProjectGit';
import { MOCK_PROJECTS } from '../components/project/projectData';
import type { TabId } from '../components/project/projectData';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const project = MOCK_PROJECTS[projectId || ''];

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', display: 'flex' }}>
        <DashboardSidebar />
        <main style={{ flex: 1, marginLeft: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 48 }}>🔍</span>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginTop: 12 }}>Project not found</p>
            <Link to="/dashboard" style={{ fontSize: 13, color: '#4F46E5', textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>← Back to projects</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', display: 'flex' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh' }}>
        <ProjectHeader project={project} activeTab={activeTab} onTabChange={setActiveTab} />
        <div style={{ padding: '28px 40px 40px' }}>
          {activeTab === 'overview' && <ProjectOverview project={project} onTabChange={setActiveTab} />}
          {activeTab === 'runs' && <ProjectRuns project={project} />}
          {activeTab === 'code' && <ProjectCode project={project} />}
          {activeTab === 'variables' && <ProjectVariables project={project} />}
          {activeTab === 'state' && <ProjectState project={project} />}
          {activeTab === 'security' && <ProjectSecurity project={project} />}
          {activeTab === 'git' && <ProjectGit project={project} />}
          {activeTab === 'settings' && <ProjectSettings project={project} />}
        </div>
      </main>
    </div>
  );
}