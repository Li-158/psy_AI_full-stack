import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, Edit, Save, X, ChevronDown, ChevronUp, Calendar, Phone, Mail, Home, User, Users, FileText, BarChart3, Activity, Plus, FolderPlus, Filter } from 'lucide-react';

// Toast 提示組件
const Toast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // 3秒後自動關閉
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';
  const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-80 animate-slide-in`}>
        <span className="text-lg">{icon}</span>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 ml-2"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// 確認刪除 Modal 元件
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
};

// 參與者列表項目元件
const ParticipantListItem = ({ participant, isSelected, onClick }) => {
  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{participant.name}</p>
            <p className="text-sm font-mono text-blue-600">{participant.uuid.substring(0, 8)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            參與 {Object.keys(participant.projectStatus || {}).length} 個計畫
          </p>
        </div>
      </div>
    </div>
  );
};

// 計畫狀態項目元件
const ProjectStatusItem = ({ projectKey, projectData, participantId, onUpdate, onDelete, isExpanded, onToggle }) => {
  const [projectInfo, subProjectInfo] = projectKey.split('-');
  
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
            <div className="flex flex-wrap gap-2 mt-1">
              {['v1.0', 'v1.1', 'v2.0', 'v2.1'].map(version => (
                <label key={version} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={projectData.consentVersions?.includes(version) || false}
                    onChange={(e) => {
                      const newVersions = e.target.checked
                        ? [...(projectData.consentVersions || []), version]
                        : (projectData.consentVersions || []).filter(v => v !== version);
                      onUpdate(participantId, projectKey, 'consentVersions', newVersions);
                    }}
                    className="rounded border-gray-300"
                  />
                  {version}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ParticipantManagementApp = () => {
  // 所有的 useState 和狀態管理
  const [participants, setParticipants] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentView, setCurrentView] = useState('participants');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [showAddProjectToParticipant, setShowAddProjectToParticipant] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingProjectDescription, setEditingProjectDescription] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedParticipants, setExpandedParticipants] = useState({});
  const [filterProject, setFilterProject] = useState('');
  const [filterSubProject, setFilterSubProject] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, type: '', data: null });
  const [toastMessage, setToastMessage] = useState({ show: false, type: '', message: '' });

  const [formData, setFormData] = useState({
    uuid: '',
    participantId: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    birthDate: '',
    gender: '',
    selectedSubProject: ''
  });

  const [projectFormData, setProjectFormData] = useState({
    projectName: '',
    subProjectName: '',
    subProjectCode: '',
    researcherName: '',
    researcherEmail: '',
    description: ''
  });

  const [addProjectForm, setAddProjectForm] = useState({
    selectedSubProject: '',
    participantProjectId: '',
    participantSubProjectId: '',
    status: '進行中',
    terminationReason: '',
    consentVersions: [],
    joinDate: new Date().toISOString().split('T')[0]
  });

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 載入示例數據
  useEffect(() => {
    const sampleParticipants = [
      {
        id: 1,
        uuid: generateUUID(),
        participantId: 'AGE-001',
        name: '王小明',
        phone: '0912-345-678',
        email: 'wang@example.com',
        address: '台北市大安區羅斯福路四段1號',
        birthDate: '1990-05-15',
        gender: '男',
        projectStatus: {
          '認知行為研究計畫-老化與認知（AGE）': {
            status: '進行中',
            participantProjectId: 'P001-001',
            participantSubProjectId: 'S001-001',
            terminationReason: '',
            consentVersions: ['v1.0', 'v1.1'],
            joinDate: '2024-01-15'
          }
        }
      }
    ];

    const sampleProjects = [
      {
        id: 1,
        projectName: '認知行為研究計畫',
        subProjectName: '老化與認知',
        subProjectCode: 'AGE',
        researcherName: '王博士',
        researcherEmail: 'dr.wang@psychology.edu',
        description: '本研究旨在探討老化過程中認知功能的變化，透過系列神經心理測驗評估參與者的認知表現。'
      }
    ];

    setParticipants(sampleParticipants);
    setProjects(sampleProjects);
  }, []);

  // Helper functions
  const getAvailableSubProjects = () => {
    return projects.map(project => ({
      value: `${project.projectName}-${project.subProjectName}（${project.subProjectCode}）`,
      label: `${project.projectName} - ${project.subProjectName}（${project.subProjectCode}）`,
      code: project.subProjectCode
    }));
  };

  const getProjectStats = (projectName, subProjectName, subProjectCode) => {
    const projectKey = `${projectName}-${subProjectName}（${subProjectCode}）`;
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

  const getProjectParticipants = (projectName, subProjectName, subProjectCode) => {
    const projectKey = `${projectName}-${subProjectName}（${subProjectCode}）`;
    return participants.filter(p => p.projectStatus && p.projectStatus[projectKey]);
  };

  const filteredParticipants = participants.filter(participant => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      participant.name.toLowerCase().includes(searchLower) ||
      participant.phone.includes(searchTerm) ||
      participant.email.toLowerCase().includes(searchLower) ||
      participant.uuid.toLowerCase().includes(searchLower) ||
      participant.participantId.toLowerCase().includes(searchLower)
    );
    
    const matchesProjectFilter = !filterProject ||
      Object.keys(participant.projectStatus || {}).some(key => key.includes(filterProject));
    
    const matchesSubProjectFilter = !filterSubProject ||
      Object.keys(participant.projectStatus || {}).some(key => key.includes(filterSubProject));
    
    return matchesSearch && matchesProjectFilter && matchesSubProjectFilter;
  });

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

  const hasParticipants = (projectName, subProjectName, subProjectCode) => {
    const projectKey = `${projectName}-${subProjectName}（${subProjectCode}）`;
    return participants.some(p => p.projectStatus && p.projectStatus[projectKey]);
  };

  // Handlers
  const handleAddParticipant = () => {
    if (!formData.name || !formData.selectedSubProject) {
      setToastMessage({
        show: true,
        type: 'error',
        message: '請填寫必要欄位：姓名、子計畫'
      });
      return;
    }

    if (!formData.participantId) {
      setToastMessage({
        show: true,
        type: 'error',
        message: '請填寫參與者編號'
      });
      return;
    }

    const projectKey = formData.selectedSubProject;
    const newParticipant = {
      id: Date.now(),
      uuid: formData.uuid || generateUUID(),
      participantId: formData.participantId,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      birthDate: formData.birthDate,
      gender: formData.gender,
      projectStatus: {
        [projectKey]: {
          status: '進行中',
          participantProjectId: '',
          participantSubProjectId: '',
          terminationReason: '',
          consentVersions: [],
          joinDate: new Date().toISOString().split('T')[0]
        }
      }
    };

    setParticipants([...participants, newParticipant]);
    
    // 顯示成功新增的提示
    setToastMessage({
      show: true,
      type: 'success',
      message: `參與者「${formData.name}」已成功新增`
    });
    
    resetFormData();
    setShowAddForm(false);
  };

  const handleAddProject = () => {
    if (!projectFormData.projectName || !projectFormData.subProjectName || !projectFormData.subProjectCode || !projectFormData.researcherName) {
      setToastMessage({
        show: true,
        type: 'error',
        message: '請填寫必要欄位：計畫名稱、子計畫名稱、子計畫代碼、研究人員姓名'
      });
      return;
    }

    const newProject = {
      id: Date.now(),
      projectName: projectFormData.projectName,
      subProjectName: projectFormData.subProjectName,
      subProjectCode: projectFormData.subProjectCode,
      researcherName: projectFormData.researcherName,
      researcherEmail: projectFormData.researcherEmail,
      description: projectFormData.description
    };

    setProjects([...projects, newProject]);
    
    // 顯示成功新增的提示
    setToastMessage({
      show: true,
      type: 'success',
      message: `子計畫「${projectFormData.subProjectName}」已成功新增`
    });
    
    resetProjectFormData();
    setShowAddProjectForm(false);
  };

  const handleUpdateParticipant = () => {
    if (!formData.name) {
      setToastMessage({
        show: true,
        type: 'error',
        message: '請填寫姓名'
      });
      return;
    }

    setParticipants(participants.map(p => {
      if (p.id === editingId) {
        return {
          ...p,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          birthDate: formData.birthDate,
          gender: formData.gender
        };
      }
      return p;
    }));
    
    // 更新選中的參與者
    if (selectedParticipant && selectedParticipant.id === editingId) {
      const updatedParticipant = {
        ...selectedParticipant,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        birthDate: formData.birthDate,
        gender: formData.gender
      };
      setSelectedParticipant(updatedParticipant);
    }
    
    setToastMessage({
      show: true,
      type: 'success',
      message: `參與者「${formData.name}」資訊已更新`
    });
    
    setShowAddForm(false);
    setEditingId(null);
    resetFormData();
  };

  const handleAddProjectToParticipant = () => {
    if (!addProjectForm.selectedSubProject) {
      setToastMessage({
        show: true,
        type: 'error',
        message: '請選擇子計畫'
      });
      return;
    }
    
    if (selectedParticipant.projectStatus?.[addProjectForm.selectedSubProject]) {
      setToastMessage({
        show: true,
        type: 'error',
        message: '此參與者已參加此子計畫'
      });
      return;
    }

    const updatedParticipants = participants.map(p => {
      if (p.id === selectedParticipant.id) {
        return {
          ...p,
          projectStatus: {
            ...p.projectStatus,
            [addProjectForm.selectedSubProject]: {
              status: addProjectForm.status,
              participantProjectId: addProjectForm.participantProjectId,
              participantSubProjectId: addProjectForm.participantSubProjectId,
              terminationReason: addProjectForm.terminationReason,
              consentVersions: addProjectForm.consentVersions,
              joinDate: addProjectForm.joinDate
            }
          }
        };
      }
      return p;
    });
    
    setParticipants(updatedParticipants);
    
    // 更新選中的參與者
    const updatedSelectedParticipant = {
      ...selectedParticipant,
      projectStatus: {
        ...selectedParticipant.projectStatus,
        [addProjectForm.selectedSubProject]: {
          status: addProjectForm.status,
          participantProjectId: addProjectForm.participantProjectId,
          participantSubProjectId: addProjectForm.participantSubProjectId,
          terminationReason: addProjectForm.terminationReason,
          consentVersions: addProjectForm.consentVersions,
          joinDate: addProjectForm.joinDate
        }
      }
    };
    setSelectedParticipant(updatedSelectedParticipant);
    
    setToastMessage({
      show: true,
      type: 'success',
      message: `已為「${selectedParticipant.name}」新增計畫`
    });
    
    setShowAddProjectToParticipant(false);
    setAddProjectForm({
      selectedSubProject: '',
      participantProjectId: '',
      participantSubProjectId: '',
      status: '進行中',
      terminationReason: '',
      consentVersions: [],
      joinDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteProject = (project) => {
    if (hasParticipants(project.projectName, project.subProjectName, project.subProjectCode)) {
      // 使用更好的提示方式而不是 alert
      setToastMessage({
        show: true,
        type: 'error',
        message: '無法刪除，已有參與者正在此子計畫中。'
      });
      return;
    }
    
    setConfirmDelete({
      isOpen: true,
      type: 'subproject',
      data: project
    });
  };

  const confirmDeleteSubProject = () => {
    const project = confirmDelete.data;
    setProjects(projects.filter(p => p.id !== project.id));
    
    if (selectedProject && selectedProject.id === project.id) {
      setSelectedProject(null);
    }
    
    // 顯示成功刪除的提示
    setToastMessage({
      show: true,
      type: 'success',
      message: `子計畫「${project.subProjectName}」已成功刪除`
    });
    
    setConfirmDelete({ isOpen: false, type: '', data: null });
  };

  const confirmDeleteParticipantProject = () => {
    const { participantId, projectKey } = confirmDelete.data;
    
    const updatedParticipants = participants.map(p => {
      if (p.id === participantId) {
        const newProjectStatus = { ...p.projectStatus };
        delete newProjectStatus[projectKey];
        return {
          ...p,
          projectStatus: newProjectStatus
        };
      }
      return p;
    });
    
    setParticipants(updatedParticipants);
    
    // 更新選中的參與者
    if (selectedParticipant && selectedParticipant.id === participantId) {
      const newProjectStatus = { ...selectedParticipant.projectStatus };
      delete newProjectStatus[projectKey];
      setSelectedParticipant({
        ...selectedParticipant,
        projectStatus: newProjectStatus
      });
    }
    
    setToastMessage({
      show: true,
      type: 'success',
      message: '參與計畫記錄已刪除'
    });
    
    setConfirmDelete({ isOpen: false, type: '', data: null });
  };

  const handleUpdateProjectDescription = (projectId, newDescription) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, description: newDescription } : p
    ));
    setEditingProjectDescription(false);
  };

  const resetFormData = () => {
    setFormData({
      uuid: '',
      participantId: '',
      selectedSubProject: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      birthDate: '',
      gender: ''
    });
  };

  const resetProjectFormData = () => {
    setProjectFormData({
      projectName: '',
      subProjectName: '',
      subProjectCode: '',
      researcherName: '',
      researcherEmail: '',
      description: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Toast 提示 */}
      <Toast
        show={toastMessage.show}
        type={toastMessage.type}
        message={toastMessage.message}
        onClose={() => setToastMessage({ show: false, type: '', message: '' })}
      />
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">心理學實驗參與者管理系統</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setCurrentView('participants')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentView === 'participants'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="inline-block mr-2" size={20} />
            參與者管理
          </button>
          <button
            onClick={() => setCurrentView('researchers')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentView === 'researchers'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="inline-block mr-2" size={20} />
            計畫管理
          </button>
        </div>

        {/* 參與者管理頁面 */}
        {currentView === 'participants' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 參與者列表 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">參與者列表</h2>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="新增參與者"
                  >
                    <UserPlus size={20} />
                  </button>
                </div>
                
                {/* 搜尋欄位 */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="搜尋參與者..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* 篩選器 */}
                <div className="mb-4 space-y-2">
                  <div>
                    <label className="text-sm text-gray-600">計畫篩選</label>
                    <select
                      value={filterProject}
                      onChange={(e) => setFilterProject(e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">所有計畫</option>
                      {Array.from(new Set(projects.map(p => p.projectName))).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">子計畫篩選</label>
                    <select
                      value={filterSubProject}
                      onChange={(e) => setFilterSubProject(e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">所有子計畫</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.subProjectName}>{p.subProjectName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* 參與者列表 */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredParticipants.map(participant => (
                    <ParticipantListItem
                      key={participant.id}
                      participant={participant}
                      isSelected={selectedParticipant?.id === participant.id}
                      onClick={() => setSelectedParticipant(participant)}
                    />
                  ))}
                  
                  {filteredParticipants.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <User size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>找不到符合條件的參與者</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 參與者詳細資訊 */}
            {selectedParticipant && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold">{selectedParticipant.name}</h2>
                      <p className="text-gray-600 mt-1">參與者編號：{selectedParticipant.participantId}</p>
                      <p className="text-sm text-blue-600 font-mono">UUID：{selectedParticipant.uuid}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setFormData({
                            ...selectedParticipant,
                            selectedSubProject: Object.keys(selectedParticipant.projectStatus || {})[0] || ''
                          });
                          setEditingId(selectedParticipant.id);
                          setShowAddForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="編輯參與者"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => setShowAddProjectToParticipant(true)}
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
                        <span className="font-medium">{selectedParticipant.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="font-medium">{selectedParticipant.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home size={16} className="text-gray-400" />
                        <span className="font-medium">{selectedParticipant.address}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">生日：{selectedParticipant.birthDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="font-medium">性別：{selectedParticipant.gender}</span>
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
                      {Object.entries(selectedParticipant.projectStatus || {}).map(([projectKey, projectData]) => (
                        <ProjectStatusItem
                          key={projectKey}
                          projectKey={projectKey}
                          projectData={projectData}
                          participantId={selectedParticipant.id}
                          onUpdate={(participantId, projectKey, field, value) => {
                            setParticipants(participants.map(p => {
                              if (p.id === participantId) {
                                return {
                                  ...p,
                                  projectStatus: {
                                    ...p.projectStatus,
                                    [projectKey]: {
                                      ...p.projectStatus[projectKey],
                                      [field]: value
                                    }
                                  }
                                };
                              }
                              return p;
                            }));
                            
                            // 更新選中的參與者
                            if (selectedParticipant.id === participantId) {
                              setSelectedParticipant({
                                ...selectedParticipant,
                                projectStatus: {
                                  ...selectedParticipant.projectStatus,
                                  [projectKey]: {
                                    ...selectedParticipant.projectStatus[projectKey],
                                    [field]: value
                                  }
                                }
                              });
                            }
                          }}
                          onDelete={(projectKey) => {
                            setConfirmDelete({
                              isOpen: true,
                              type: 'project',
                              data: { participantId: selectedParticipant.id, projectKey }
                            });
                          }}
                          isExpanded={expandedProjects[projectKey]}
                          onToggle={() => setExpandedProjects({ ...expandedProjects, [projectKey]: !expandedProjects[projectKey] })}
                        />
                      ))}
                      
                      {Object.keys(selectedParticipant.projectStatus || {}).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                          <p>尚未參與任何計畫</p>
                          <button
                            onClick={() => setShowAddProjectToParticipant(true)}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          >
                            新增計畫
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 沒有選中參與者時的提示 */}
            {!selectedParticipant && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6 h-96 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Users size={64} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">請選擇一個參與者查看詳細資訊</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 參與者管理頁面 */}
        {currentView === 'participants' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 參與者列表 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">參與者列表</h2>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="新增參與者"
                  >
                    <UserPlus size={20} />
                  </button>
                </div>
                
                {/* 搜尋欄位 */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="搜尋參與者..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* 篩選器 */}
                <div className="mb-4 space-y-2">
                  <div>
                    <label className="text-sm text-gray-600">計畫篩選</label>
                    <select
                      value={filterProject}
                      onChange={(e) => setFilterProject(e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">所有計畫</option>
                      {Array.from(new Set(projects.map(p => p.projectName))).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">子計畫篩選</label>
                    <select
                      value={filterSubProject}
                      onChange={(e) => setFilterSubProject(e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">所有子計畫</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.subProjectName}>{p.subProjectName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* 參與者列表 */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredParticipants.map(participant => (
                    <ParticipantListItem
                      key={participant.id}
                      participant={participant}
                      isSelected={selectedParticipant?.id === participant.id}
                      onClick={() => setSelectedParticipant(participant)}
                    />
                  ))}
                  
                  {filteredParticipants.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <User size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>找不到符合條件的參與者</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 參與者詳細資訊 */}
            {selectedParticipant && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold">{selectedParticipant.name}</h2>
                      <p className="text-gray-600 mt-1">參與者編號：{selectedParticipant.participantId}</p>
                      <p className="text-sm text-blue-600 font-mono">UUID：{selectedParticipant.uuid}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setFormData({
                            ...selectedParticipant,
                            selectedSubProject: Object.keys(selectedParticipant.projectStatus || {})[0] || ''
                          });
                          setEditingId(selectedParticipant.id);
                          setShowAddForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="編輯參與者"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => setShowAddProjectToParticipant(true)}
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
                        <span className="font-medium">{selectedParticipant.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="font-medium">{selectedParticipant.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home size={16} className="text-gray-400" />
                        <span className="font-medium">{selectedParticipant.address}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">生日：{selectedParticipant.birthDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="font-medium">性別：{selectedParticipant.gender}</span>
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
                      {Object.entries(selectedParticipant.projectStatus || {}).map(([projectKey, projectData]) => (
                        <ProjectStatusItem
                          key={projectKey}
                          projectKey={projectKey}
                          projectData={projectData}
                          participantId={selectedParticipant.id}
                          onUpdate={(participantId, projectKey, field, value) => {
                            setParticipants(participants.map(p => {
                              if (p.id === participantId) {
                                return {
                                  ...p,
                                  projectStatus: {
                                    ...p.projectStatus,
                                    [projectKey]: {
                                      ...p.projectStatus[projectKey],
                                      [field]: value
                                    }
                                  }
                                };
                              }
                              return p;
                            }));
                            
                            // 更新選中的參與者
                            if (selectedParticipant.id === participantId) {
                              setSelectedParticipant({
                                ...selectedParticipant,
                                projectStatus: {
                                  ...selectedParticipant.projectStatus,
                                  [projectKey]: {
                                    ...selectedParticipant.projectStatus[projectKey],
                                    [field]: value
                                  }
                                }
                              });
                            }
                          }}
                          onDelete={(projectKey) => {
                            setConfirmDelete({
                              isOpen: true,
                              type: 'project',
                              data: { participantId: selectedParticipant.id, projectKey }
                            });
                          }}
                          isExpanded={expandedProjects[projectKey]}
                          onToggle={() => setExpandedProjects({ ...expandedProjects, [projectKey]: !expandedProjects[projectKey] })}
                        />
                      ))}
                      
                      {Object.keys(selectedParticipant.projectStatus || {}).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                          <p>尚未參與任何計畫</p>
                          <button
                            onClick={() => setShowAddProjectToParticipant(true)}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          >
                            新增計畫
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 沒有選中參與者時的提示 */}
            {!selectedParticipant && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6 h-96 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Users size={64} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">請選擇一個參與者查看詳細資訊</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 計畫管理頁面 */}
        {currentView === 'researchers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">計畫列表</h2>
                  <button
                    onClick={() => setShowAddProjectForm(true)}
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
                          const stats = getProjectStats(project.projectName, project.subProjectName, project.subProjectCode);
                          const canDelete = !hasParticipants(project.projectName, project.subProjectName, project.subProjectCode);
                          
                          return (
                            <div
                              key={project.id}
                              className={`p-3 rounded cursor-pointer transition-colors ${
                                selectedProject?.id === project.id
                                  ? 'bg-blue-100 border border-blue-300'
                                  : 'bg-gray-50 hover:bg-gray-100'
                              }`}
                              onClick={() => setSelectedProject(project)}
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
                                      handleDeleteProject(project);
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
            </div>

            {selectedProject && (
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">計畫資訊</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedProject.projectName}</h3>
                      <p className="text-gray-600 mt-1">
                        子計畫：{selectedProject.subProjectName}（{selectedProject.subProjectCode}）
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700">負責人</h4>
                        <p className="text-gray-900">{selectedProject.researcherName}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">聯絡信箱</h4>
                        <p className="text-gray-900">{selectedProject.researcherEmail}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">計畫描述</h4>
                        <button
                          onClick={() => setEditingProjectDescription(true)}
                          className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                      {editingProjectDescription ? (
                        <div>
                          <textarea
                            value={selectedProject.description}
                            onChange={(e) => setSelectedProject({...selectedProject, description: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleUpdateProjectDescription(selectedProject.id, selectedProject.description)}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => {
                                setEditingProjectDescription(false);
                                setSelectedProject(projects.find(p => p.id === selectedProject.id));
                              }}
                              className="px-3 py-1 border border-gray-300 rounded text-sm"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 leading-relaxed">{selectedProject.description}</p>
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
                    {(() => {
                      const stats = getProjectStats(selectedProject.projectName, selectedProject.subProjectName, selectedProject.subProjectCode);
                      return (
                        <>
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
                        </>
                      );
                    })()
                    }
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users size={20} />
                    子計畫參與者
                  </h3>
                  <div className="space-y-3">
                    {getProjectParticipants(selectedProject.projectName, selectedProject.subProjectName, selectedProject.subProjectCode).map(participant => {
                      const projectKey = `${selectedProject.projectName}-${selectedProject.subProjectName}（${selectedProject.subProjectCode}）`;
                      const isExpanded = expandedParticipants[participant.id];
                      const projectData = participant.projectStatus[projectKey];
                      
                      return (
                        <div key={participant.id} className="border rounded-lg overflow-hidden">
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedParticipants({ ...expandedParticipants, [participant.id]: !isExpanded })}
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
            )}
          </div>
        )}

        {/* 參與者管理頁面 */}
        {currentView === 'participants' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 參與者列表 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">參與者列表</h2>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="新增參與者"
                  >
                    <UserPlus size={20} />
                  </button>
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
                          checked={addProjectForm.consentVersions.includes(version)}
                          onChange={(e) => {
                            const newVersions = e.target.checked
                              ? [...addProjectForm.consentVersions, version]
                              : addProjectForm.consentVersions.filter(v => v !== version);
                            setAddProjectForm({...addProjectForm, consentVersions: newVersions});
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{version}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* 終止原因 */}
                {addProjectForm.status === '終止' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終止原因
                    </label>
                    <textarea
                      value={addProjectForm.terminationReason}
                      onChange={(e) => setAddProjectForm({...addProjectForm, terminationReason: e.target.value})}
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
                  onClick={() => {
                    setShowAddProjectToParticipant(false);
                    setAddProjectForm({
                      selectedSubProject: '',
                      participantProjectId: '',
                      participantSubProjectId: '',
                      status: '進行中',
                      terminationReason: '',
                      consentVersions: [],
                      joinDate: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <X size={20} />
                  取消
                </button>
                <button
                  onClick={handleAddProjectToParticipant}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                >
                  <Save size={20} />
                  新增
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新增參與者 Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">
                {editingId ? '編輯參與者' : '新增參與者'}
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
                  {!editingId && (
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
                    參與者編號 {!editingId && '*'}
                  </label>
                  <input
                    type="text"
                    value={formData.participantId}
                    onChange={(e) => setFormData({...formData, participantId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：AGE-001"
                    required={!editingId}
                    disabled={editingId}
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
                {!editingId && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      💡 找不到需要的子計畫？
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setShowAddProjectForm(true);
                      }}
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
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    resetFormData();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <X size={20} />
                  取消
                </button>
                <button
                  onClick={editingId ? handleUpdateParticipant : handleAddParticipant}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                >
                  <Save size={20} />
                  {editingId ? '更新' : '新增'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 新增計畫到參與者 Modal */}
        {showAddProjectToParticipant && selectedParticipant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-2xl font-semibold mb-4">
                為 {selectedParticipant.name} 新增計畫
              </h2>
              
              <div className="space-y-4">
                {/* 選擇子計畫 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    子計畫 *
                  </label>
                  <select
                    value={addProjectForm.selectedSubProject}
                    onChange={(e) => setAddProjectForm({...addProjectForm, selectedSubProject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">選擇子計畫</option>
                    {getAvailableSubProjects()
                      .filter(project => !selectedParticipant.projectStatus?.[project.value])
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
                      value={addProjectForm.participantProjectId}
                      onChange={(e) => setAddProjectForm({...addProjectForm, participantProjectId: e.target.value})}
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
                      value={addProjectForm.participantSubProjectId}
                      onChange={(e) => setAddProjectForm({...addProjectForm, participantSubProjectId: e.target.value})}
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
                      value={addProjectForm.status}
                      onChange={(e) => setAddProjectForm({...addProjectForm, status: e.target.value})}
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
                      value={addProjectForm.joinDate}
                      onChange={(e) => setAddProjectForm({...addProjectForm, joinDate: e.target.value})}
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
                          checked={addProjectForm.consentVersions.includes(version)}
                          onChange={(e) => {
                            const newVersions = e.target.checked
                              ? [...addProjectForm.consentVersions, version]
                              : addProjectForm.consentVersions.filter(v => v !== version);
                            setAddProjectForm({...addProjectForm, consentVersions: newVersions});
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{version}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* 終止原因 */}
                {addProjectForm.status === '終止' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終止原因
                    </label>
                    <textarea
                      value={addProjectForm.terminationReason}
                      onChange={(e) => setAddProjectForm({...addProjectForm, terminationReason: e.target.value})}
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
                  onClick={() => {
                    setShowAddProjectToParticipant(false);
                    setAddProjectForm({
                      selectedSubProject: '',
                      participantProjectId: '',
                      participantSubProjectId: '',
                      status: '進行中',
                      terminationReason: '',
                      consentVersions: [],
                      joinDate: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <X size={20} />
                  取消
                </button>
                <button
                  onClick={handleAddProjectToParticipant}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                >
                  <Save size={20} />
                  新增
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新增計畫 Modal - 按照新的欄位順序和命名 */}搜尋欄位 */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="搜尋參與者..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* 篩選器 */}
                <div className="mb-4 space-y-2">
                  <div>
                    <label className="text-sm text-gray-600">計畫篩選</label>
                    <select
                      value={filterProject}
                      onChange={(e) => setFilterProject(e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">所有計畫</option>
                      {Array.from(new Set(projects.map(p => p.projectName))).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">子計畫篩選</label>
                    <select
                      value={filterSubProject}
                      onChange={(e) => setFilterSubProject(e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">所有子計畫</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.subProjectName}>{p.subProjectName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* 參與者列表 */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredParticipants.map(participant => (
                    <ParticipantListItem
                      key={participant.id}
                      participant={participant}
                      isSelected={selectedParticipant?.id === participant.id}
                      onClick={() => setSelectedParticipant(participant)}
                    />
                  ))}
                  
                  {filteredParticipants.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <User size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>找不到符合條件的參與者</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 參與者詳細資訊 */}
            {selectedParticipant && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold">{selectedParticipant.name}</h2>
                      <p className="text-gray-600 mt-1">參與者編號：{selectedParticipant.participantId}</p>
                      <p className="text-sm text-blue-600 font-mono">UUID：{selectedParticipant.uuid}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setFormData({
                            ...selectedParticipant,
                            selectedSubProject: Object.keys(selectedParticipant.projectStatus || {})[0] || ''
                          });
                          setEditingId(selectedParticipant.id);
                          setShowAddForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="編輯參與者"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => setShowAddProjectToParticipant(true)}
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
                        <span className="font-medium">{selectedParticipant.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="font-medium">{selectedParticipant.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home size={16} className="text-gray-400" />
                        <span className="font-medium">{selectedParticipant.address}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">生日：{selectedParticipant.birthDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="font-medium">性別：{selectedParticipant.gender}</span>
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
                      {Object.entries(selectedParticipant.projectStatus || {}).map(([projectKey, projectData]) => (
                        <ProjectStatusItem
                          key={projectKey}
                          projectKey={projectKey}
                          projectData={projectData}
                          participantId={selectedParticipant.id}
                          onUpdate={(participantId, projectKey, field, value) => {
                            setParticipants(participants.map(p => {
                              if (p.id === participantId) {
                                return {
                                  ...p,
                                  projectStatus: {
                                    ...p.projectStatus,
                                    [projectKey]: {
                                      ...p.projectStatus[projectKey],
                                      [field]: value
                                    }
                                  }
                                };
                              }
                              return p;
                            }));
                            
                            // 更新選中的參與者
                            if (selectedParticipant.id === participantId) {
                              setSelectedParticipant({
                                ...selectedParticipant,
                                projectStatus: {
                                  ...selectedParticipant.projectStatus,
                                  [projectKey]: {
                                    ...selectedParticipant.projectStatus[projectKey],
                                    [field]: value
                                  }
                                }
                              });
                            }
                          }}
                          onDelete={(projectKey) => {
                            setConfirmDelete({
                              isOpen: true,
                              type: 'project',
                              data: { participantId: selectedParticipant.id, projectKey }
                            });
                          }}
                          isExpanded={expandedProjects[projectKey]}
                          onToggle={() => setExpandedProjects({ ...expandedProjects, [projectKey]: !expandedProjects[projectKey] })}
                        />
                      ))}
                      
                      {Object.keys(selectedParticipant.projectStatus || {}).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                          <p>尚未參與任何計畫</p>
                          <button
                            onClick={() => setShowAddProjectToParticipant(true)}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          >
                            新增計畫
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 沒有選中參與者時的提示 */}
            {!selectedParticipant && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6 h-96 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Users size={64} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">請選擇一個參與者查看詳細資訊</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 新增計畫 Modal - 按照新的欄位順序和命名 */}
        {showAddProjectForm && (
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
                    value={projectFormData.projectName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setProjectFormData({...projectFormData, projectName: value});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：認知行為研究計畫"
                    required
                  />
                  {projects.find(p => p.projectName === projectFormData.projectName) && projectFormData.projectName !== '' && (
                    <p className="text-sm text-blue-600 mt-1">
                      💡 將新增為「{projectFormData.projectName}」的子計畫
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
                      value={projectFormData.subProjectName}
                      onChange={(e) => setProjectFormData({...projectFormData, subProjectName: e.target.value})}
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
                      value={projectFormData.subProjectCode}
                      onChange={(e) => setProjectFormData({...projectFormData, subProjectCode: e.target.value})}
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
                      value={projectFormData.researcherName}
                      onChange={(e) => setProjectFormData({...projectFormData, researcherName: e.target.value})}
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
                      value={projectFormData.researcherEmail}
                      onChange={(e) => setProjectFormData({...projectFormData, researcherEmail: e.target.value})}
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
                    value={projectFormData.description}
                    onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
              </div>

              {/* 按鈕區域 - 不變 */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddProjectForm(false);
                    resetProjectFormData();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <X size={20} />
                  取消
                </button>
                <button
                  onClick={handleAddProject}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                >
                  <Save size={20} />
                  新增
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新增參與者 Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">
                {editingId ? '編輯參與者' : '新增參與者'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UUID</label>
                  <input
                    type="text"
                    value={formData.uuid}
                    onChange={(e) => setFormData({...formData, uuid: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="留空則自動生成"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  {!editingId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">子計畫 *</label>
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
                          <option key={project.value} value={project.value}>{project.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">參與者編號 {!editingId && '*'}</label>
                  <input
                    type="text"
                    value={formData.participantId}
                    onChange={(e) => setFormData({...formData, participantId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：AGE-001"
                    required={!editingId}
                    disabled={editingId}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">生日</label>
                    <input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">選擇性別</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                </div>
                
                {!editingId && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">💡 找不到需要的子計畫？</p>
                    <button type="button" onClick={() => { setShowAddForm(false); setShowAddProjectForm(true); }} className="text-blue-600 hover:text-blue-800 text-sm font-medium">+ 快速新增子計畫</button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setShowAddForm(false); setEditingId(null); resetFormData(); }} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
                  <X size={20} /> 取消
                </button>
                <button onClick={editingId ? handleUpdateParticipant : handleAddParticipant} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2">
                  <Save size={20} /> {editingId ? '更新' : '新增'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 新增計畫到參與者 Modal */}
        {showAddProjectToParticipant && selectedParticipant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-2xl font-semibold mb-4">為 {selectedParticipant.name} 新增計畫</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">子計畫 *</label>
                  <select value={addProjectForm.selectedSubProject} onChange={(e) => setAddProjectForm({...addProjectForm, selectedSubProject: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">選擇子計畫</option>
                    {getAvailableSubProjects().filter(project => !selectedParticipant.projectStatus?.[project.value]).map(project => (
                      <option key={project.value} value={project.value}>{project.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">計畫編號</label>
                    <input type="text" value={addProjectForm.participantProjectId} onChange={(e) => setAddProjectForm({...addProjectForm, participantProjectId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="P001-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">子計畫編號</label>
                    <input type="text" value={addProjectForm.participantSubProjectId} onChange={(e) => setAddProjectForm({...addProjectForm, participantSubProjectId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="S001-001" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
                    <select value={addProjectForm.status} onChange={(e) => setAddProjectForm({...addProjectForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="進行中">進行中</option>
                      <option value="已完成">已完成</option>
                      <option value="終止">終止</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">參與日期</label>
                    <input type="date" value={addProjectForm.joinDate} onChange={(e) => setAddProjectForm({...addProjectForm, joinDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">同意書版本</label>
                  <div className="flex flex-wrap gap-2">
                    {['v1.0', 'v1.1', 'v2.0', 'v2.1'].map(version => (
                      <label key={version} className="flex items-center gap-1">
                        <input type="checkbox" checked={addProjectForm.consentVersions.includes(version)} onChange={(e) => {
                          const newVersions = e.target.checked ? [...addProjectForm.consentVersions, version] : addProjectForm.consentVersions.filter(v => v !== version);
                          setAddProjectForm({...addProjectForm, consentVersions: newVersions});
                        }} className="rounded border-gray-300" />
                        <span className="text-sm">{version}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {addProjectForm.status === '終止' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">終止原因</label>
                    <textarea value={addProjectForm.terminationReason} onChange={(e) => setAddProjectForm({...addProjectForm, terminationReason: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="請填寫終止原因" />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setShowAddProjectToParticipant(false); setAddProjectForm({ selectedSubProject: '', participantProjectId: '', participantSubProjectId: '', status: '進行中', terminationReason: '', consentVersions: [], joinDate: new Date().toISOString().split('T')[0] }); }} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
                  <X size={20} /> 取消
                </button>
                <button onClick={handleAddProjectToParticipant} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2">
                  <Save size={20} /> 新增
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 確認刪除 Modal */}
        <ConfirmDeleteModal
          isOpen={confirmDelete.isOpen}
          onClose={() => setConfirmDelete({ isOpen: false, type: '', data: null })}
          onConfirm={() => {
            if (confirmDelete.type === 'project') {
              confirmDeleteParticipantProject();
            } else if (confirmDelete.type === 'subproject') {
              confirmDeleteSubProject();
            }
          }}
          title={
            confirmDelete.type === 'project' ? '刪除參與計畫' :
            confirmDelete.type === 'subproject' ? '刪除子計畫' : '確認刪除'
          }
          message={
            confirmDelete.type === 'project' ? '確定要刪除此參與計畫紀錄嗎？此操作無法復原。' :
            confirmDelete.type === 'subproject' ? `確定要刪除「${confirmDelete.data?.subProjectName || ''}」子計畫嗎？此操作無法復原。` : '確定要執行此刪除操作嗎？'
          }
        />
      </div>
    </div>
  );
};

export default ParticipantManagementApp;