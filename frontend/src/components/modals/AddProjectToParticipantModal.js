import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const AddProjectToParticipantModal = ({
  isOpen,
  participant,
  formData,
  setFormData,
  projects,
  onSubmit,
  onClose
}) => {
  const [availableProjects, setAvailableProjects] = useState([]);
  const [availableSubProjects, setAvailableSubProjects] = useState([]);
  const [selectedProjectCode, setSelectedProjectCode] = useState('');
  const [selectedSubProjectCode, setSelectedSubProjectCode] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  useEffect(() => {
    // Get unique project names and their codes
    const projectMap = new Map();
    projects.forEach(project => {
      if (!projectMap.has(project.projectName)) {
        projectMap.set(project.projectName, project.projectCode);
      }
    });
    setAvailableProjects(Array.from(projectMap, ([name, code]) => ({ name, code })));
  }, [projects]);
  
  useEffect(() => {
    // Filter subprojects based on selected project
    if (formData.projectName) {
      const filtered = projects.filter(p => p.projectName === formData.projectName);
      setAvailableSubProjects(filtered);
      
      // Set project code and ID
      const projectInfo = availableProjects.find(p => p.name === formData.projectName);
      if (projectInfo) {
        setSelectedProjectCode(projectInfo.code);
        
        // Find the first project with this name to get the ID
        const firstProject = projects.find(p => p.projectName === formData.projectName);
        if (firstProject && firstProject.id) {
          setSelectedProjectId(firstProject.id);
          setFormData(prev => ({...prev, projectId: firstProject.id}));
        }
        
        // Check if participant has participated in this project before
        const previousParticipation = Object.entries(participant.projectStatus || {}).find(([key]) => 
          key.startsWith(formData.projectName)
        );
        
        if (previousParticipation) {
          const prevData = previousParticipation[1];
          setFormData(prev => ({
            ...prev,
            participantProjectId: prevData.participantProjectId || `${projectInfo.code}-`
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            participantProjectId: `${projectInfo.code}-`
          }));
        }
      }
    } else {
      setAvailableSubProjects([]);
      setSelectedProjectCode('');
      setSelectedProjectId(null);
    }
  }, [formData.projectName, projects, availableProjects, participant, setFormData]);
  
  useEffect(() => {
    // Set subproject code when subproject is selected
    if (formData.subProjectName) {
      const subProject = availableSubProjects.find(p => p.subProjectName === formData.subProjectName);
      if (subProject) {
        setSelectedSubProjectCode(subProject.subProjectCode);
        setFormData(prev => ({
          ...prev,
          participantSubProjectId: `${subProject.subProjectCode}-`
        }));
      }
    } else {
      setSelectedSubProjectCode('');
    }
  }, [formData.subProjectName, availableSubProjects, setFormData]);

  if (!isOpen || !participant) return null;

  const handleProjectIdChange = (value) => {
    // Ensure the project code prefix is maintained
    if (!value.startsWith(selectedProjectCode + '-')) {
      return;
    }
    setFormData({...formData, participantProjectId: value});
  };

  const handleSubProjectIdChange = (value) => {
    // Ensure the subproject code prefix is maintained
    if (!value.startsWith(selectedSubProjectCode + '-')) {
      return;
    }
    setFormData({...formData, participantSubProjectId: value});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">
          為 {participant.name} 新增計畫
        </h2>
        
        <div className="space-y-4">
          {/* 選擇計畫 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              計畫 *
            </label>
            <select
              value={formData.projectName}
              onChange={(e) => setFormData({
                ...formData, 
                projectName: e.target.value,
                subProjectName: '', // Reset subproject when project changes
                participantSubProjectId: ''
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">選擇計畫</option>
              {availableProjects.map(project => (
                <option key={project.name} value={project.name}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* 選擇子計畫 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              子計畫 *
            </label>
            <select
              value={formData.subProjectName}
              onChange={(e) => setFormData({...formData, subProjectName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!formData.projectName}
            >
              <option value="">選擇子計畫</option>
              {availableSubProjects
                .filter(subProject => {
                  // Check if participant already in this subproject
                  const projectKey = `${subProject.projectName}-${subProject.subProjectName}（${subProject.subProjectCode}）`;
                  return !participant.projectStatus?.[projectKey];
                })
                .map(subProject => (
                  <option key={subProject.id} value={subProject.subProjectName}>
                    {subProject.subProjectName}（{subProject.subProjectCode}）
                  </option>
                ))
              }
            </select>
          </div>
          
          {/* 計畫編號 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                計畫編號 *
              </label>
              <input
                type="text"
                value={formData.participantProjectId}
                onChange={(e) => handleProjectIdChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`${selectedProjectCode}-XXX`}
                disabled={!selectedProjectCode}
              />
              {selectedProjectCode && (
                <p className="text-xs text-gray-500 mt-1">格式: {selectedProjectCode}-編號</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                子計畫編號 *
              </label>
              <input
                type="text"
                value={formData.participantSubProjectId}
                onChange={(e) => handleSubProjectIdChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`${selectedSubProjectCode}-XXX`}
                disabled={!selectedSubProjectCode}
              />
              {selectedSubProjectCode && (
                <p className="text-xs text-gray-500 mt-1">格式: {selectedSubProjectCode}-編號</p>
              )}
            </div>
          </div>
          
          {/* 狀態和參與日期 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                狀態
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="進行中">進行中</option>
                <option value="已完成">已完成</option>
                <option value="終止">終止</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                參與日期
              </label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* 同意書版本 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              同意書版本
            </label>
            <div className="flex flex-wrap gap-2">
              {['v1.0', 'v1.1', 'v2.0', 'v2.1'].map(version => (
                <label key={version} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={formData.consentVersions.includes(version)}
                    onChange={(e) => {
                      const newVersions = e.target.checked
                        ? [...formData.consentVersions, version]
                        : formData.consentVersions.filter(v => v !== version);
                      setFormData({...formData, consentVersions: newVersions});
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{version}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* 終止原因 */}
          {formData.status === '終止' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終止原因
              </label>
              <textarea
                value={formData.terminationReason}
                onChange={(e) => setFormData({...formData, terminationReason: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="請填寫終止原因"
              />
            </div>
          )}
        </div>
        
        {/* 按鈕區域 */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <X size={20} />
            取消
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <Save size={20} />
            新增
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectToParticipantModal;
