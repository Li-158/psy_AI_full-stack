import React from 'react';
import { X, Save } from 'lucide-react';

const AddParticipantModal = ({
  isOpen,
  isEditing,
  formData,
  setFormData,
  projects,
  onSubmit,
  onClose,
  onGoToAddProject
}) => {
  if (!isOpen) return null;

  const getAvailableSubProjects = () => {
    return projects.map(project => ({
      value: `${project.projectName}-${project.subProjectName}（${project.subProjectCode}）`,
      label: `${project.projectName} - ${project.subProjectName}（${project.subProjectCode}）`,
      code: project.subProjectCode
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {isEditing ? '編輯參與者' : '新增參與者'}
        </h2>
        
        <div className="space-y-4">
          {/* UUID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UUID
            </label>
            <input
              type="text"
              value={formData.uuid}
              onChange={(e) => setFormData({...formData, uuid: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="留空則自動生成"
            />
          </div>
          
          {/* 姓名和子計畫 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  子計畫 *
                </label>
                <select
                  value={formData.selectedSubProject}
                  onChange={(e) => {
                    const selectedProject = getAvailableSubProjects().find(p => p.value === e.target.value);
                    setFormData({
                      ...formData,
                      selectedSubProject: e.target.value,
                      participantId: selectedProject ? `${selectedProject.code}-` : ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">選擇子計畫</option>
                  {getAvailableSubProjects().map(project => (
                    <option key={project.value} value={project.value}>
                      {project.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* 參與者編號 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              參與者編號 {!isEditing && '*'}
            </label>
            <input
              type="text"
              value={formData.participantId}
              onChange={(e) => setFormData({...formData, participantId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：AGE-001"
              required={!isEditing}
              disabled={isEditing}
            />
          </div>
          
          {/* 聯絡資訊 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* 地址 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              地址
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 生日和性別 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                生日
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                性別
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇性別</option>
                <option value="男">男</option>
                <option value="女">女</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
          
          {/* 快速新增子計畫 */}
          {!isEditing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                💡 找不到需要的子計畫？
              </p>
              <button
                type="button"
                onClick={onGoToAddProject}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + 快速新增子計畫
              </button>
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
            {isEditing ? '更新' : '新增'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddParticipantModal;
