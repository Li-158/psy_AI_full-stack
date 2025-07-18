import React from 'react';
import { Edit, Plus, Phone, Mail, Home, Calendar, User, Activity, FileText } from 'lucide-react';
import ProjectStatusItem from './ProjectStatusItem';

const ParticipantDetail = ({
  participant,
  onEdit,
  onAddProject,
  onUpdateProjectStatus,
  onDeleteProject,
  expandedProjects,
  onToggleProject
}) => {
  if (!participant) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <User size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg">請選擇一個參與者查看詳細資訊</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{participant.name}</h2>
          <p className="text-sm text-blue-600 font-mono mt-1">UUID：{participant.uuid}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="編輯參與者"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={onAddProject}
            className="p-2 text-green-600 hover:bg-green-50 rounded"
            title="新增計畫"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      
      {/* 基本資訊 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-gray-400" />
            <span className="font-medium">{participant.phone || '未填寫'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-gray-400" />
            <span className="font-medium">{participant.email || '未填寫'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Home size={16} className="text-gray-400" />
            <span className="font-medium">{participant.address || '未填寫'}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="font-medium">生日：{participant.birthDate || '未填寫'}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            <span className="font-medium">性別：{participant.gender || '未填寫'}</span>
          </div>
        </div>
      </div>
      
      {/* 計畫參與狀態 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity size={20} />
          計畫參與狀態
        </h3>
        
        <div className="space-y-3">
          {Object.entries(participant.projectStatus || {}).map(([projectKey, projectData]) => (
            <ProjectStatusItem
              key={projectKey}
              projectKey={projectKey}
              projectData={projectData}
              participantId={participant.id}
              onUpdate={onUpdateProjectStatus}
              onDelete={onDeleteProject}
              isExpanded={expandedProjects[projectKey]}
              onToggle={() => onToggleProject(projectKey)}
            />
          ))}
          
          {Object.keys(participant.projectStatus || {}).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>尚未參與任何計畫</p>
              <button
                onClick={onAddProject}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                新增計畫
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetail;
