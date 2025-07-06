import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, Edit, Save, X, ChevronDown, ChevronUp, Calendar, Phone, Mail, Home, User, Users, FileText, BarChart3, Activity, Plus, FolderPlus, Filter } from 'lucide-react';

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
const ProjectStatusItem = ({ projectKey, projectData, participantId, onUpdate, isExpanded, onToggle }) => {
  const [projectId, subProject] = projectKey.split('-');
  
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
                <span className="font-medium">{projectId}</span>
                <span className="mx-2">-</span>
                <span>{subProject}</span>
              </div>
              <span className="text-sm text-gray-500">參與日期: {projectData.joinDate || '未記錄'}</span>
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

// 主要應用程式元件
const ParticipantManagementApp = () => {
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

  const [formData, setFormData] = useState({
    uuid: '',
    projectId: '',
    subProjectId: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    birthDate: '',
    gender: ''
  });

  const [projectFormData, setProjectFormData] = useState({
    projectId: '',
    subProjectId: '',
    projectName: '',
    researcherName: '',
    researcherEmail: '',
    description: ''
  });

  const [addProjectForm, setAddProjectForm] = useState({
    projectId: '',
    subProjectId: '',
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

  useEffect(() => {
    // 載入示例數據
    const sampleParticipants = [
      {
        id: 1,
        uuid: generateUUID(),
        projectId: 'PROJ001',
        subProjectId: '空間距離判斷',
        name: '王小明',
        phone: '0912-345-678',
        email: 'wang@example.com',
        address: '台北市大安區羅斯福路四段1號',
        birthDate: '1990-05-15',
        gender: '男',
        projectStatus: {
          'PROJ001-空間距離判斷': {
            status: '進行中',
            participantProjectId: 'P001-001',
            participantSubProjectId: 'S001-001',
            terminationReason: '',
            consentVersions: ['v1.0', 'v1.1'],
            joinDate: '2024-01-15'
          },
          'PROJ001-臉孔辨識': {
            status: '已完成',
            participantProjectId: 'P001-001',
            participantSubProjectId: 'S002-001',
            terminationReason: '',
            consentVersions: ['v1.0'],
            joinDate: '2024-02-20'
          }
        }
      },
      {
        id: 2,
        uuid: generateUUID(),
        projectId: 'PROJ001',
        subProjectId: '臉孔辨識',
        name: '李美華',
        phone: '0923-456-789',
        email: 'lee@example.com',
        address: '台北市信義區松仁路100號',
        birthDate: '1988-12-20',
        gender: '女',
        projectStatus: {
          'PROJ001-臉孔辨識': {
            status: '進行中',
            participantProjectId: 'P001-002',
            participantSubProjectId: 'S002-002',
            terminationReason: '',
            consentVersions: ['v1.0'],
            joinDate: '2024-03-01'
          }
        }
      },
      {
        id: 3,
        uuid: generateUUID(),
        projectId: 'PROJ002',
        subProjectId: '語言發展評估',
        name: '張志豪',
        phone: '0934-567-890',
        email: 'zhang@example.com',
        address: '台北市中正區重慶南路一段122號',
        birthDate: '1992-08-10',
        gender: '男',
        projectStatus: {
          'PROJ002-語言發展評估': {
            status: '終止',
            participantProjectId: 'P002-001',
            participantSubProjectId: 'S004-001',
            terminationReason: '個人因素無法繼續參與',
            consentVersions: ['v2.0'],
            joinDate: '2024-01-10'
          }
        }
      }
    ];

    const sampleProjects = [
      {
        id: 1,
        projectId: 'PROJ001',
        subProjectId: '空間距離判斷',
        projectName: '認知行為研究計畫',
        researcherName: '王博士',
        researcherEmail: 'dr.wang@psychology.edu',
        description: '本研究旨在探討空間距離判斷能力與認知功能的關係，透過虛擬實境技術評估參與者的空間認知表現。'
      },
      {
        id: 2,
        projectId: 'PROJ001',
        subProjectId: '臉孔辨識',
        projectName: '認知行為研究計畫',
        researcherName: '廖教授',
        researcherEmail: 'prof.liao@psychology.edu',
        description: '探討人類臉孔辨識的神經機制，使用腦電圖記錄參與者在不同臉孔刺激下的大腦反應。'
      },
      {
        id: 3,
        projectId: 'PROJ001',
        subProjectId: '注意力分配',
        projectName: '認知行為研究計畫',
        researcherName: '林博士',
        researcherEmail: 'dr.lin@psychology.edu',
        description: '研究多重任務情境下的注意力分配策略，評估認知負荷對任務表現的影響。'
      },
      {
        id: 4,
        projectId: 'PROJ002',
        subProjectId: '語言發展評估',
        projectName: '兒童發展追蹤研究',
        researcherName: '陳教授',
        researcherEmail: 'prof.chen@psychology.edu',
        description: '長期追蹤兒童語言能力的發展軌跡，建立本土化的語言發展常模。'
      }
    ];

    setParticipants(sampleParticipants);
    setProjects(sampleProjects);
  }, []);

  // Helper functions
  const getAvailableProjects = () => {
    const projectMap = {};
    projects.forEach(project => {
      if (!projectMap[project.projectId]) {
        projectMap[project.projectId] = [];
      }
      projectMap[project.projectId].push(project.subProjectId);
    });
    return projectMap;
  };

  const getProjectStats = (projectId, subProjectId) => {
    const projectKey = `${projectId}-${subProjectId}`;
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

  const getProjectParticipants = (projectId, subProjectId) => {
    const projectKey = `${projectId}-${subProjectId}`;
    return participants.filter(p => p.projectStatus && p.projectStatus[projectKey]);
  };

  const filteredParticipants = participants.filter(participant => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      participant.name.toLowerCase().includes(searchLower) ||
      participant.phone.includes(searchTerm) ||
      participant.email.toLowerCase().includes(searchLower) ||
      participant.uuid.toLowerCase().includes(searchLower) ||
      participant.subProjectId.toLowerCase().includes(searchLower)
    );
    
    const matchesProjectFilter = !filterProject || 
      Object.keys(participant.projectStatus || {}).some(key => key.startsWith(filterProject));
    
    const matchesSubProjectFilter = !filterSubProject || 
      Object.keys(participant.projectStatus || {}).some(key => key.includes(filterSubProject));
    
    return matchesSearch && matchesProjectFilter && matchesSubProjectFilter;
  });

  const groupProjectsByProjectId = () => {
    const grouped = {};
    projects.forEach(project => {
      if (!grouped[project.projectId]) {
        grouped[project.projectId] = [];
      }
      grouped[project.projectId].push(project);
    });
    return grouped;
  };

  // Handlers
  const handleAddParticipant = () => {
    if (!formData.name || !formData.projectId || !formData.subProjectId) {
      alert('請填寫必要欄位：姓名、計畫編號、子計畫編號');
      return;
    }

    const projectKey = `${formData.projectId}-${formData.subProjectId}`;
    const newParticipant = {
      ...formData,
      id: Date.now(),
      uuid: formData.uuid || generateUUID(),
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
    resetFormData();
    setShowAddForm(false);
  };

  const handleAddProject = () => {
    if (!projectFormData.projectId || !projectFormData.subProjectId || !projectFormData.projectName || !projectFormData.researcherName) {
      alert('請填寫必要欄位');
      return;
    }

    const newProject = {
      ...projectFormData,
      id: Date.now()
    };

    setProjects([...projects, newProject]);
    resetProjectFormData();
    setShowAddProjectForm(false);
  };

  const handleUpdateProjectStatus = (participantId, projectKey, field, value) => {
    setParticipants(participants.map(p => {
      if (p.id === participantId) {
        const updatedStatus = {
          ...p.projectStatus[projectKey],
          [field]: value
        };
        
        if (field === 'status' && value !== '終止') {
          updatedStatus.terminationReason = '';
        }
        
        const updatedParticipant = {
          ...p,
          projectStatus: {
            ...p.projectStatus,
            [projectKey]: updatedStatus
          }
        };
        
        if (selectedParticipant && selectedParticipant.id === participantId) {
          setSelectedParticipant(updatedParticipant);
        }
        
        return updatedParticipant;
      }
      return p;
    }));
  };

  const handleAddProjectToParticipant = () => {
    if (!addProjectForm.projectId || !addProjectForm.subProjectId) {
      alert('請選擇計畫和子計畫');
      return;
    }

    const projectKey = `${addProjectForm.projectId}-${addProjectForm.subProjectId}`;
    
    let participantProjectId = addProjectForm.participantProjectId;
    if (!participantProjectId) {
      const existingProjects = Object.entries(selectedParticipant.projectStatus || {})
        .filter(([key]) => key.startsWith(addProjectForm.projectId));
      if (existingProjects.length > 0) {
        participantProjectId = existingProjects[0][1].participantProjectId;
      }
    }
    
    setParticipants(participants.map(p => {
      if (p.id === selectedParticipant.id) {
        const updatedParticipant = {
          ...p,
          projectStatus: {
            ...p.projectStatus,
            [projectKey]: {
              status: addProjectForm.status,
              participantProjectId: participantProjectId,
              participantSubProjectId: addProjectForm.participantSubProjectId,
              terminationReason: addProjectForm.terminationReason,
              consentVersions: addProjectForm.consentVersions,
              joinDate: addProjectForm.joinDate
            }
          }
        };
        setSelectedParticipant(updatedParticipant);
        return updatedParticipant;
      }
      return p;
    }));

    resetAddProjectForm();
    setShowAddProjectToParticipant(false);
  };

  const handleDeleteParticipant = (id) => {
    if (window.confirm('確定要刪除此參與者資料嗎？')) {
      setParticipants(participants.filter(p => p.id !== id));
      setSelectedParticipant(null);
    }
  };

  const handleEditParticipant = (participant) => {
    setEditingId(participant.id);
    setFormData(participant);
  };

  const handleSaveEdit = () => {
    setParticipants(participants.map(p => 
      p.id === editingId ? { ...formData, id: editingId } : p
    ));
    setEditingId(null);
    resetFormData();
    if (selectedParticipant && selectedParticipant.id === editingId) {
      setSelectedParticipant({ ...formData, id: editingId });
    }
  };

  const handleUpdateProjectDescription = (projectId, newDescription) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, description: newDescription } : p
    ));
    setEditingProjectDescription(false);
  };

  // Reset functions
  const resetFormData = () => {
    setFormData({
      uuid: '',
      projectId: '',
      subProjectId: '',
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
      projectId: '',
      subProjectId: '',
      projectName: '',
      researcherName: '',
      researcherEmail: '',
      description: ''
    });
  };

  const resetAddProjectForm = () => {
    setAddProjectForm({
      projectId: '',
      subProjectId: '',
      participantProjectId: '',
      participantSubProjectId: '',
      status: '進行中',
      terminationReason: '',
      consentVersions: [],
      joinDate: new Date().toISOString().split('T')[0]
    });
  };

  // Render functions
  const renderParticipantsView = () => (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="搜尋參與者（姓名、電話、Email、UUID、子計畫編號）"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <UserPlus size={20} />
              新增參與者
            </button>
          </div>
          
          <div className="flex gap-4 items-center">
            <Filter size={20} className="text-gray-500" />
            <div className="flex gap-4 flex-1">
              <select
                value={filterProject}
                onChange={(e) => {
                  setFilterProject(e.target.value);
                  setFilterSubProject('');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有計畫</option>
                {Object.keys(getAvailableProjects()).map(proj => (
                  <option key={proj} value={proj}>{proj}</option>
                ))}
              </select>
              
              <select
                value={filterSubProject}
                onChange={(e) => setFilterSubProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!filterProject}
              >
                <option value="">所有子計畫</option>
                {filterProject && getAvailableProjects()[filterProject]?.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">參與者列表</h2>
          <div className="space-y-2">
            {filteredParticipants.map(participant => (
              <ParticipantListItem
                key={participant.id}
                participant={participant}
                isSelected={selectedParticipant?.id === participant.id}
                onClick={() => setSelectedParticipant(participant)}
              />
            ))}
          </div>
        </div>

        {selectedParticipant && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">參與者詳細資料</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditParticipant(selectedParticipant)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDeleteParticipant(selectedParticipant.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">UUID</label>
                <p className="font-mono text-sm">{selectedParticipant.uuid}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">參與計畫狀態</h3>
                  <button
                    onClick={() => setShowAddProjectToParticipant(true)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    新增計畫
                  </button>
                </div>
                <div className="space-y-4">
                  {Object.entries(selectedParticipant.projectStatus || {}).map(([key, projectData]) => (
                    <ProjectStatusItem
                      key={key}
                      projectKey={key}
                      projectData={projectData}
                      participantId={selectedParticipant.id}
                      onUpdate={handleUpdateProjectStatus}
                      isExpanded={expandedProjects[key]}
                      onToggle={() => setExpandedProjects({ ...expandedProjects, [key]: !expandedProjects[key] })}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User size={20} />
                  個人資料
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">姓名</span>
                      <p className="font-medium">{selectedParticipant.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">性別</span>
                      <p className="font-medium">{selectedParticipant.gender}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">電話</span>
                    <p className="font-medium">{selectedParticipant.phone}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Email</span>
                    <p className="font-medium">{selectedParticipant.email}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">地址</span>
                    <p className="font-medium">{selectedParticipant.address}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">出生日期</span>
                    <p className="font-medium">{selectedParticipant.birthDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const renderProjectsView = () => (
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
            {Object.entries(groupProjectsByProjectId()).map(([projectId, projectList]) => (
              <div key={projectId} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">
                  {projectList[0].projectName}
                </h3>
                <div className="space-y-2">
                  {projectList.map((project, index) => {
                    const stats = getProjectStats(project.projectId, project.subProjectId);
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
                            <p className="font-medium">子計畫 {index + 1}：{project.subProjectId}</p>
                            <p className="text-sm text-gray-600 mt-1">負責人：{project.researcherName}</p>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">{stats.total} 人</span>
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
                  子計畫：{selectedProject.subProjectId}
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
                const stats = getProjectStats(selectedProject.projectId, selectedProject.subProjectId);
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
              })()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users size={20} />
              子計畫參與者
            </h3>
            <div className="space-y-3">
              {getProjectParticipants(selectedProject.projectId, selectedProject.subProjectId).map(participant => {
                const projectKey = `${selectedProject.projectId}-${selectedProject.subProjectId}`;
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
                            <span>參與者編號：{participant.uuid.substring(0, 8)}</span>
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
                        
                        <div className="mb-3">
                          <label className="text-xs text-gray-600">狀態</label>
                          <select
                            value={projectData.status}
                            onChange={(e) => handleUpdateProjectStatus(participant.id, projectKey, 'status', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                          >
                            <option value="進行中">進行中</option>
                            <option value="已完成">已完成</option>
                            <option value="終止">終止</option>
                          </select>
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
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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

        {currentView === 'participants' && renderParticipantsView()}
        {currentView === 'researchers' && renderProjectsView()}

        {/* 新增參與者 Modal */}
        {(showAddForm || editingId) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">
                {editingId ? '編輯參與者' : '新增參與者'}
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UUID（選填，留空自動生成）
                    </label>
                    <input
                      type="text"
                      value={formData.uuid}
                      onChange={(e) => setFormData({...formData, uuid: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="自動生成"
                    />
                  </div>
                  
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      計畫編號 *
                    </label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({...formData, projectId: e.target.value, subProjectId: ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">選擇計畫</option>
                      {Object.keys(getAvailableProjects()).map(proj => (
                        <option key={proj} value={proj}>{proj}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      子計畫編號 *
                    </label>
                    <select
                      value={formData.subProjectId}
                      onChange={(e) => setFormData({...formData, subProjectId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!formData.projectId}
                    >
                      <option value="">選擇子計畫</option>
                      {formData.projectId && getAvailableProjects()[formData.projectId]?.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      出生日期
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
              </div>

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
                  onClick={editingId ? handleSaveEdit : handleAddParticipant}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                >
                  <Save size={20} />
                  {editingId ? '保存' : '新增'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新增計畫 Modal */}
        {showAddProjectForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">新增計畫</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      計畫編號 *
                    </label>
                    <input
                      type="text"
                      value={projectFormData.projectId}
                      onChange={(e) => setProjectFormData({...projectFormData, projectId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：PROJ004"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      子計畫編號 *
                    </label>
                    <input
                      type="text"
                      value={projectFormData.subProjectId}
                      onChange={(e) => setProjectFormData({...projectFormData, subProjectId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：記憶測試"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    計畫名稱 *
                  </label>
                  <input
                    type="text"
                    value={projectFormData.projectName}
                    onChange={(e) => setProjectFormData({...projectFormData, projectName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

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

        {/* 新增計畫到參與者 Modal */}
        {showAddProjectToParticipant && selectedParticipant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
              <h2 className="text-xl font-semibold mb-4">
                為 {selectedParticipant.name} 新增計畫
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      參與計畫 *
                    </label>
                    <select
                      value={addProjectForm.projectId}
                      onChange={(e) => {
                        const projectId = e.target.value;
                        setAddProjectForm({
                          ...addProjectForm, 
                          projectId: projectId, 
                          subProjectId: '',
                          participantProjectId: (() => {
                            const existingProjects = Object.entries(selectedParticipant.projectStatus || {})
                              .filter(([key]) => key.startsWith(projectId));
                            if (existingProjects.length > 0) {
                              return existingProjects[0][1].participantProjectId;
                            }
                            return '';
                          })()
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">選擇計畫</option>
                      {Object.keys(getAvailableProjects()).map(proj => (
                        <option key={proj} value={proj}>{proj}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      子計畫 *
                    </label>
                    <select
                      value={addProjectForm.subProjectId}
                      onChange={(e) => setAddProjectForm({...addProjectForm, subProjectId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!addProjectForm.projectId}
                    >
                      <option value="">選擇子計畫</option>
                      {addProjectForm.projectId && getAvailableProjects()[addProjectForm.projectId]?.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
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
                      placeholder="輸入參與者的計畫編號"
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
                      placeholder="輸入參與者的子計畫編號"
                    />
                  </div>
                </div>
                
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    同意書版本
                  </label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {['v1.0', 'v1.1', 'v2.0', 'v2.1'].map(version => (
                      <label key={version} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addProjectForm.consentVersions.includes(version)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAddProjectForm({
                                ...addProjectForm,
                                consentVersions: [...addProjectForm.consentVersions, version]
                              });
                            } else {
                              setAddProjectForm({
                                ...addProjectForm,
                                consentVersions: addProjectForm.consentVersions.filter(v => v !== version)
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{version}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddProjectToParticipant(false);
                    resetAddProjectForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddProjectToParticipant}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  新增
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default ParticipantManagementApp;