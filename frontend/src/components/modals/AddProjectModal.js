import React from 'react';
import { X, Save } from 'lucide-react';

const AddProjectModal = ({
  isOpen,
  formData,
  setFormData,
  projects,
  onSubmit,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">新增計畫</h2>
        
        <div className="space-y-4">
          {/* 1. 計畫名稱 - 移到最上方 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              計畫名稱 *
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({...formData, projectName: value});
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：認知行為研究計畫"
              required
            />
            {projects.find(p => p.projectName === formData.projectName) && formData.projectName !== '' && (
              <p className="text-sm text-blue-600 mt-1">
                💡 將新增為「{formData.projectName}」的子計畫
              </p>
            )}
          </div>

          {/* 2. 子計畫名稱 & 子計畫代碼 - 重新命名後的欄位 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                子計畫名稱 *
              </label>
              <input
                type="text"
                value={formData.subProjectName}
                onChange={(e) => setFormData({...formData, subProjectName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：記憶測試"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                子計畫代碼 *
              </label>
              <input
                type="text"
                value={formData.subProjectCode}
                onChange={(e) => setFormData({...formData, subProjectCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：AGE"
                required
              />
            </div>
          </div>

          {/* 3. 研究人員姓名 & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                研究人員姓名 *
              </label>
              <input
                type="text"
                value={formData.researcherName}
                onChange={(e) => setFormData({...formData, researcherName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                研究人員 Email
              </label>
              <input
                type="email"
                value={formData.researcherEmail}
                onChange={(e) => setFormData({...formData, researcherEmail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 4. 計畫描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              計畫描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>

        {/* 按鈕區域 - 不變 */}
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

export default AddProjectModal;
