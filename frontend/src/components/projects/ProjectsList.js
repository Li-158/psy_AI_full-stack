import React from 'react';
import { FolderPlus, Trash2 } from 'lucide-react';

const ProjectsList = ({ projects, selectedProject, onSelectProject, onAddProject, onDeleteProject }) => {
  const groupProjectsByProjectName = () => {
    const grouped = {};
    projects.forEach(project => {
      if (!grouped[project.projectName]) {
        grouped[project.projectName] = [];
      }
      grouped[project.projectName].push(project);
    });
    return grouped;
  };

  const getProjectStats = (project) => {
    // This would normally calculate from participants data
    // For now, returning placeholder values
    return {
      total: 0,
      active: 0,
      completed: 0,
      terminated: 0
    };
  };

  const hasParticipants = (project) => {
    // This would normally check if project has participants
    // For now, returning false to allow deletion
    return false;
  };

  return (
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
        {Object.entries(groupProjectsByProjectName()).map(([projectName, projectList]) => (
          <div key={projectName} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">
              {projectName}
            </h3>
            <div className="space-y-2">
              {projectList.map((project, index) => {
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
                        <p className="font-medium">子計畫 {index + 1}：{project.subProjectName}（{project.subProjectCode}）</p>
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
        ))}
      </div>
    </div>
  );
};

export default ProjectsList;
