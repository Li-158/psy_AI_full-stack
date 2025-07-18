import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const ProjectStatusItem = ({ projectKey, projectData, participantId, onUpdate, onDelete, isExpanded, onToggle }) => {
  const [projectInfo, subProjectInfo] = projectKey.split('-');
  const [availableVersions, setAvailableVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 從 projectKey 解析出專案 ID（假設專案資料中有 id）
  const getProjectId = () => {
    // 這裡需要根據實際的資料結構來獲取專案 ID
    // 可能需要從父組件傳遞專案列表或專案 ID
    return projectData.projectId;
  };

  useEffect(() => {
    if (isExpanded && projectData.projectId) {
      fetchConsentVersions();
    }
  }, [isExpanded, projectData.projectId]);

  const fetchConsentVersions = async () => {
    if (!projectData.projectId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/${projectData.projectId}/consent-versions?active_only=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const versions = await response.json();
        setAvailableVersions(versions);
      }
    } catch (error) {
      console.error('Error fetching consent versions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <span className="font-medium">{projectInfo}</span>
                <span className="mx-2">-</span>
                <span>{subProjectInfo}</span>
              </div>
              <span className="text-sm text-gray-500">參與日期: {projectData.joinDate || '未記錄'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(projectKey);
              }}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="刪除參與計畫"
            >
              <Trash2 size={16} />
            </button>
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
        <div className="p-4 border-t bg-white">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-600">計畫編號</label>
              <input
                type="text"
                value={projectData.participantProjectId || ''}
                onChange={(e) => onUpdate(participantId, projectKey, 'participantProjectId', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="輸入計畫編號"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">子計畫編號</label>
              <input
                type="text"
                value={projectData.participantSubProjectId || ''}
                onChange={(e) => onUpdate(participantId, projectKey, 'participantSubProjectId', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="輸入子計畫編號"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-600">狀態</label>
              <select
                value={projectData.status}
                onChange={(e) => onUpdate(participantId, projectKey, 'status', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="進行中">進行中</option>
                <option value="已完成">已完成</option>
                <option value="終止">終止</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">參與日期</label>
              <input
                type="date"
                value={projectData.joinDate || ''}
                onChange={(e) => onUpdate(participantId, projectKey, 'joinDate', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          
          {projectData.status === '終止' && (
            <div className="mb-3">
              <label className="text-xs text-gray-600">終止原因</label>
              <textarea
                value={projectData.terminationReason || ''}
                onChange={(e) => onUpdate(participantId, projectKey, 'terminationReason', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                rows={2}
                placeholder="請填寫終止原因"
              />
            </div>
          )}
          
          <div>
            <label className="text-xs text-gray-600">同意書版本</label>
            {loading ? (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {availableVersions.length > 0 ? (
                  availableVersions.map(version => (
                    <label key={version.id} className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={projectData.consentVersions?.includes(version.version_name) || false}
                        onChange={(e) => {
                          const newVersions = e.target.checked
                            ? [...(projectData.consentVersions || []), version.version_name]
                            : (projectData.consentVersions || []).filter(v => v !== version.version_name);
                          onUpdate(participantId, projectKey, 'consentVersions', newVersions);
                        }}
                        className="rounded border-gray-300"
                      />
                      {version.version_name}
                      {version.description && (
                        <span className="text-xs text-gray-500 ml-1">({version.description})</span>
                      )}
                    </label>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">尚未設定同意書版本</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusItem;
