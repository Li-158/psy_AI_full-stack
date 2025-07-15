import React from 'react';
import { Edit, BarChart3, Users, ChevronUp, ChevronDown } from 'lucide-react';

const ProjectDetail = ({
  project,
  participants,
  editingDescription,
  onEditDescription,
  onUpdateDescription,
  onCancelEdit,
  expandedParticipants,
  onToggleParticipant
}) => {
  if (!project) {
    return null;
  }

  const getProjectStats = () => {
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

  const getProjectParticipants = () => {
    const projectKey = `${project.projectName}-${project.subProjectName}（${project.subProjectCode}）`;
    return participants.filter(p => p.projectStatus && p.projectStatus[projectKey]);
  };

  const stats = getProjectStats();
  const projectParticipants = getProjectParticipants();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">計畫資訊</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{project.projectName}</h3>
            <p className="text-gray-600 mt-1">
              子計畫：{project.subProjectName}（{project.subProjectCode}）
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700">負責人</h4>
              <p className="text-gray-900">{project.researcherName}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">聯絡信箱</h4>
              <p className="text-gray-900">{project.researcherEmail}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-gray-700">計畫描述</h4>
              <button
                onClick={() => onEditDescription(project)}
                className="text-blue-600 hover:bg-blue-50 p-1 rounded"
              >
                <Edit size={16} />
              </button>
            </div>
            {editingDescription ? (
              <div>
                <textarea
                  value={project.description}
                  onChange={(e) => onUpdateDescription({...project, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onUpdateDescription(project, true)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    保存
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 leading-relaxed">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          參與者統計
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">總人數</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-600">進行中</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
            <p className="text-sm text-gray-600">已完成</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">{stats.terminated}</p>
            <p className="text-sm text-gray-600">已終止</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={20} />
          子計畫參與者
        </h3>
        <div className="space-y-3">
          {projectParticipants.map(participant => {
            const projectKey = `${project.projectName}-${project.subProjectName}（${project.subProjectCode}）`;
            const isExpanded = expandedParticipants[participant.id];
            const projectData = participant.projectStatus[projectKey];
            
            return (
              <div key={participant.id} className="border rounded-lg overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onToggleParticipant(participant.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{participant.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>參與者編號：{participant.participantId}</span>
                        <span>參與日期：{projectData.joinDate || '未記錄'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        projectData.status === '進行中' ? 'bg-green-100 text-green-800' :
                        projectData.status === '已完成' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {projectData.status}
                      </span>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-4 border-t bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="text-xs text-gray-600">電話</label>
                        <p className="font-medium">{participant.phone}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Email</label>
                        <p className="font-medium">{participant.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="text-xs text-gray-600">計畫編號</label>
                        <p className="font-medium">{projectData.participantProjectId || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">子計畫編號</label>
                        <p className="font-medium">{projectData.participantSubProjectId || '-'}</p>
                      </div>
                    </div>
                    
                    {projectData.status === '終止' && projectData.terminationReason && (
                      <div className="mb-3">
                        <label className="text-xs text-gray-600">終止原因</label>
                        <p className="text-sm mt-1">{projectData.terminationReason}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-xs text-gray-600">同意書版本</label>
                      <p className="text-sm mt-1">
                        {projectData.consentVersions?.join(', ') || '未記錄'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
