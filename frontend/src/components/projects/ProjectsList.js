import React, { useState, useEffect, useCallback } from 'react';
import { FolderPlus, Trash2, FileText } from 'lucide-react';
import ConsentVersionModal from '../modals/ConsentVersionModal';

const ProjectsList = ({ projects, selectedProject, onSelectProject, onAddProject, onDeleteProject, participants }) => {
  const [consentVersions, setConsentVersions] = useState({});
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedProjectForConsent, setSelectedProjectForConsent] = useState(null);

  const fetchConsentVersions = useCallback(async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects/${projectId}/consent-versions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const versions = await response.json();
        setConsentVersions(prev => ({
          ...prev,
          [projectId]: versions
        }));
      }
    } catch (error) {
      console.error('Error fetching consent versions:', error);
    }
  }, []);

  // 當專案列表變化時，獲取所有專案的同意書版本
  useEffect(() => {
    // 獲取每個唯一計畫的同意書版本
    const uniqueProjectIds = new Set();
    projects.forEach(project => {
      if (project.id) {
        uniqueProjectIds.add(project.id);
      }
    });
    
    uniqueProjectIds.forEach(projectId => {
      if (!consentVersions[projectId]) {
        fetchConsentVersions(projectId);
      }
    });
  }, [projects, consentVersions, fetchConsentVersions]);

  const groupProjectsByProjectName = () => {
    const grouped = {};
    projects.forEach(project => {
      if (!grouped[project.projectName]) {
        grouped[project.projectName] = {
          projectInfo: {
            id: project.id,
            projectName: project.projectName,
            projectCode: project.projectCode
          },
          subProjects: []
        };
      }
      grouped[project.projectName].subProjects.push(project);
    });
    return grouped;
  };

  const getProjectStats = (project) => {
    const projectKey = `${project.projectName}-${project.subProjectName}（${project.subProjectCode}）`;
    const stats = {
      total: 0,
      active: 0,
      completed: 0,
      terminated: 0
    };

    participants.forEach(p => {
      if (p.projectStatus && p.projectStatus[projectKey]) {
        stats.total++;
        const status = p.projectStatus[projectKey].status;
        if (status === '進行中') stats.active++;
        else if (status === '已完成') stats.completed++;
        else if (status === '終止') stats.terminated++;
      }
    });

    return stats;
  };

  const hasParticipants = (project) => {
    const projectKey = `${project.projectName}-${project.subProjectName}（${project.subProjectCode}）`;
    return participants.some(p => p.projectStatus && p.projectStatus[projectKey]);
  };

  const handleManageConsentVersions = (projectInfo, e) => {
    e.stopPropagation();
    setSelectedProjectForConsent(projectInfo);
    setShowConsentModal(true);
  };

  const handleConsentVersionUpdate = () => {
    // 重新獲取該專案的同意書版本
    if (selectedProjectForConsent) {
      fetchConsentVersions(selectedProjectForConsent.id);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">計畫列表</h2>
          <button
            onClick={onAddProject}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="新增計畫"
          >
            <FolderPlus size={20} />
          </button>
        </div>
        <div className="space-y-4">
          {Object.entries(groupProjectsByProjectName()).map(([projectName, projectGroup]) => {
            const { projectInfo, subProjects } = projectGroup;
            const versions = consentVersions[projectInfo.id] || [];
            
            return (
              <div key={projectName} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg">
                    {projectName}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">同意書版本：</span>
                      {versions.filter(v => v.is_active).map((version, idx) => (
                        <span key={version.id} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          {version.version_name}
                        </span>
                      ))}
                      {versions.filter(v => v.is_active).length === 0 && (
                        <span className="text-xs text-gray-400">尚未設定</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleManageConsentVersions(projectInfo, e)}
                      className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                      title="管理同意書版本"
                    >
                      <FileText size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {subProjects.map((project, index) => {
                    const stats = getProjectStats(project);
                    const canDelete = !hasParticipants(project);
                    
                    return (
                      <div
                        key={project.id}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          selectedProject?.id === project.id
                            ? 'bg-blue-100 border border-blue-300'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => onSelectProject(project)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{project.subProjectName}（{project.subProjectCode}）</p>
                            <p className="text-sm text-gray-600 mt-1">負責人：{project.researcherName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-blue-600">{stats.total} 人</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteProject(project);
                              }}
                              className={`p-1 rounded ${
                                canDelete
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                              title={canDelete ? '刪除子計畫' : '無法刪除：已有參與者'}
                              disabled={!canDelete}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showConsentModal && (
        <ConsentVersionModal
          project={selectedProjectForConsent}
          onClose={() => {
            setShowConsentModal(false);
            setSelectedProjectForConsent(null);
          }}
          onUpdate={handleConsentVersionUpdate}
        />
      )}
    </>
  );
};

export default ProjectsList;
