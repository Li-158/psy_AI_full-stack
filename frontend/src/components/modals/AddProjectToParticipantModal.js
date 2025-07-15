import React from 'react';
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
  if (!isOpen || !participant) return null;

  const getAvailableSubProjects = () => {
    return projects.map(project => ({
      value: `${project.projectName}-${project.subProjectName}（${project.subProjectCode}）`,
      label: `${project.projectName} - ${project.subProjectName}（${project.subProjectCode}）`,
      code: project.subProjectCode
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">
          為 {participant.name} 新增計畫
        </h2>
        
        <div className="space-y-4">
          {/* 選擇子計畫 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              子計畫 *
            </label>
            <select
              value={formData.selectedSubProject}
              onChange={(e) => setFormData({...formData, selectedSubProject: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">選擇子計畫</option>
              {getAvailableSubProjects()
                .filter(project => !participant.projectStatus?.[project.value])
                .map(project => (
                  <option key={project.value} value={project.value}>
                    {project.label}
                  </option>
                ))
              }
            </select>
          </div>
          
          {/* 計畫編號 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                計畫編號
              </label>
              <input
                type="text"
                value={formData.participantProjectId}
                onChange={(e) => setFormData({...formData, participantProjectId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="P001-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                子計畫編號
              </label>
              <input
                type="text"
                value={formData.participantSubProjectId}
                onChange={(e) => setFormData({...formData, participantSubProjectId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="S001-001"
              />
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
