import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2, Edit2, Check, XCircle } from 'lucide-react';

const ConsentVersionModal = ({ project, onClose, onUpdate }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newVersion, setNewVersion] = useState({ version_name: '', description: '', is_active: true });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [project]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects/${project.id}/consent-versions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      } else {
        console.error('Failed to fetch consent versions');
      }
    } catch (error) {
      console.error('Error fetching consent versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVersion = async () => {
    if (!newVersion.version_name.trim()) {
      alert('請輸入版本名稱');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects/${project.id}/consent-versions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVersion)
      });

      if (response.ok) {
        await fetchVersions();
        setNewVersion({ version_name: '', description: '', is_active: true });
        setShowAddForm(false);
        onUpdate();
      } else {
        const error = await response.json();
        alert(error.detail || '新增失敗');
      }
    } catch (error) {
      console.error('Error adding consent version:', error);
      alert('新增同意書版本時發生錯誤');
    }
  };

  const handleUpdateVersion = async (version) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects/${project.id}/consent-versions/${version.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version_name: version.version_name,
          description: version.description,
          is_active: version.is_active
        })
      });

      if (response.ok) {
        await fetchVersions();
        setEditingId(null);
        onUpdate();
      } else {
        const error = await response.json();
        alert(error.detail || '更新失敗');
      }
    } catch (error) {
      console.error('Error updating consent version:', error);
      alert('更新同意書版本時發生錯誤');
    }
  };

  const handleDeleteVersion = async (versionId) => {
    if (!window.confirm('確定要刪除這個同意書版本嗎？')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects/${project.id}/consent-versions/${versionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchVersions();
        onUpdate();
      } else {
        const error = await response.json();
        alert(error.detail || '刪除失敗');
      }
    } catch (error) {
      console.error('Error deleting consent version:', error);
      alert('刪除同意書版本時發生錯誤');
    }
  };

  const handleEditStart = (version) => {
    setEditingId(version.id);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    fetchVersions(); // 重新載入以恢復原始資料
  };

  const handleEditSave = (version) => {
    handleUpdateVersion(version);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">管理同意書版本</h2>
            <p className="text-sm text-gray-600 mt-1">
              計畫：{project.projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              {/* 版本列表 */}
              <div className="space-y-3 mb-4">
                {versions.map(version => (
                  <div key={version.id} className="border rounded-lg p-4">
                    {editingId === version.id ? (
                      // 編輯模式
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={version.version_name}
                          onChange={(e) => {
                            const updated = versions.map(v => 
                              v.id === version.id ? { ...v, version_name: e.target.value } : v
                            );
                            setVersions(updated);
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="版本名稱"
                        />
                        <textarea
                          value={version.description || ''}
                          onChange={(e) => {
                            const updated = versions.map(v => 
                              v.id === version.id ? { ...v, description: e.target.value } : v
                            );
                            setVersions(updated);
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                          rows="2"
                          placeholder="版本說明（選填）"
                        />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={version.is_active}
                              onChange={(e) => {
                                const updated = versions.map(v => 
                                  v.id === version.id ? { ...v, is_active: e.target.checked } : v
                                );
                                setVersions(updated);
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">啟用此版本</span>
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSave(version)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="儲存"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                              title="取消"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // 顯示模式
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{version.version_name}</h4>
                            {version.is_active && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                啟用中
                              </span>
                            )}
                          </div>
                          {version.description && (
                            <p className="text-sm text-gray-600 mt-1">{version.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            建立時間：{new Date(version.created_at).toLocaleDateString('zh-TW')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditStart(version)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="編輯"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteVersion(version.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="刪除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 新增表單 */}
              {showAddForm ? (
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium mb-3">新增同意書版本</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newVersion.version_name}
                      onChange={(e) => setNewVersion({ ...newVersion, version_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="版本名稱（例如：v1.0）"
                    />
                    <textarea
                      value={newVersion.description}
                      onChange={(e) => setNewVersion({ ...newVersion, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows="2"
                      placeholder="版本說明（選填）"
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newVersion.is_active}
                          onChange={(e) => setNewVersion({ ...newVersion, is_active: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">啟用此版本</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddVersion}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          新增
                        </button>
                        <button
                          onClick={() => {
                            setShowAddForm(false);
                            setNewVersion({ version_name: '', description: '', is_active: true });
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  新增同意書版本
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentVersionModal;
