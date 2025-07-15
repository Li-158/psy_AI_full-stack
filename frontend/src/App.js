import React, { useState, useEffect } from 'react';
import { Users, FileText } from 'lucide-react';

// Common Components
import Toast from './components/common/Toast';
import ConfirmDeleteModal from './components/common/ConfirmDeleteModal';

// Participant Components
import ParticipantsList from './components/participants/ParticipantsList';
import ParticipantDetail from './components/participants/ParticipantDetail';

// Project Components
import ProjectsList from './components/projects/ProjectsList';
import ProjectDetail from './components/projects/ProjectDetail';

// Modal Components
import AddParticipantModal from './components/modals/AddParticipantModal';
import AddProjectModal from './components/modals/AddProjectModal';
import AddProjectToParticipantModal from './components/modals/AddProjectToParticipantModal';

// Utils
import { generateUUID, sampleParticipants, sampleProjects } from './utils/sampleData';

const ParticipantManagementApp = () => {
  // State Management
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

  // Load sample data
  useEffect(() => {
    setParticipants(sampleParticipants);
    setProjects(sampleProjects);
  }, []);

  // Helper functions
  const hasParticipants = (projectName, subProjectName, subProjectCode) => {
    const projectKey = `${projectName}-${subProjectName}（${subProjectCode}）`;
    return participants.some(p => p.projectStatus && p.projectStatus[projectKey]);
  };

  // Handlers for Participants
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
    
    setToastMessage({
      show: true,
      type: 'success',
      message: `參與者「${formData.name}」已成功新增`
    });
    
    resetFormData();
    setShowAddForm(false);
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

  const handleUpdateProjectStatus = (participantId, projectKey, field, value) => {
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
    
    if (selectedParticipant && selectedParticipant.id === participantId) {
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

  // Handlers for Projects
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
    
    setToastMessage({
      show: true,
      type: 'success',
      message: `子計畫「${projectFormData.subProjectName}」已成功新增`
    });
    
    resetProjectFormData();
    setShowAddProjectForm(false);
  };

  const handleDeleteProject = (project) => {
    if (hasParticipants(project.projectName, project.subProjectName, project.subProjectCode)) {
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

  const handleUpdateProjectDescription = (projectId, newDescription) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, description: newDescription } : p
    ));
    setEditingProjectDescription(false);
  };

  // Delete Handlers
  const confirmDeleteSubProject = () => {
    const project = confirmDelete.data;
    setProjects(projects.filter(p => p.id !== project.id));
    
    if (selectedProject && selectedProject.id === project.id) {
      setSelectedProject(null);
    }
    
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

  // Reset Functions
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
            <div className="lg:col-span-1">
              <ParticipantsList
                participants={participants}
                selectedParticipant={selectedParticipant}
                onSelectParticipant={setSelectedParticipant}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterProject={filterProject}
                onFilterProjectChange={setFilterProject}
                filterSubProject={filterSubProject}
                onFilterSubProjectChange={setFilterSubProject}
                projects={projects}
                onAddParticipant={() => setShowAddForm(true)}
              />
            </div>
            
            <div className="lg:col-span-2">
              <ParticipantDetail
                participant={selectedParticipant}
                onEdit={() => {
                  setFormData({
                    ...selectedParticipant,
                    selectedSubProject: Object.keys(selectedParticipant.projectStatus || {})[0] || ''
                  });
                  setEditingId(selectedParticipant.id);
                  setShowAddForm(true);
                }}
                onAddProject={() => setShowAddProjectToParticipant(true)}
                onUpdateProjectStatus={handleUpdateProjectStatus}
                onDeleteProject={(projectKey) => {
                  setConfirmDelete({
                    isOpen: true,
                    type: 'project',
                    data: { participantId: selectedParticipant.id, projectKey }
                  });
                }}
                expandedProjects={expandedProjects}
                onToggleProject={(projectKey) => setExpandedProjects({ 
                  ...expandedProjects, 
                  [projectKey]: !expandedProjects[projectKey] 
                })}
              />
            </div>
          </div>
        )}

        {/* 計畫管理頁面 */}
        {currentView === 'researchers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ProjectsList
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
                onAddProject={() => setShowAddProjectForm(true)}
                onDeleteProject={handleDeleteProject}
              />
            </div>

            {selectedProject && (
              <div className="lg:col-span-2">
                <ProjectDetail
                  project={selectedProject}
                  participants={participants}
                  editingDescription={editingProjectDescription}
                  onEditDescription={() => setEditingProjectDescription(true)}
                  onUpdateDescription={(project, save) => {
                    if (save) {
                      handleUpdateProjectDescription(project.id, project.description);
                    } else {
                      setSelectedProject(project);
                    }
                  }}
                  onCancelEdit={() => {
                    setEditingProjectDescription(false);
                    setSelectedProject(projects.find(p => p.id === selectedProject.id));
                  }}
                  expandedParticipants={expandedParticipants}
                  onToggleParticipant={(participantId) => setExpandedParticipants({ 
                    ...expandedParticipants, 
                    [participantId]: !expandedParticipants[participantId] 
                  })}
                />
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <AddParticipantModal
          isOpen={showAddForm}
          isEditing={!!editingId}
          formData={formData}
          setFormData={setFormData}
          projects={projects}
          onSubmit={editingId ? handleUpdateParticipant : handleAddParticipant}
          onClose={() => {
            setShowAddForm(false);
            setEditingId(null);
            resetFormData();
          }}
          onGoToAddProject={() => {
            setShowAddForm(false);
            setShowAddProjectForm(true);
          }}
        />

        <AddProjectModal
          isOpen={showAddProjectForm}
          formData={projectFormData}
          setFormData={setProjectFormData}
          projects={projects}
          onSubmit={handleAddProject}
          onClose={() => {
            setShowAddProjectForm(false);
            resetProjectFormData();
          }}
        />

        <AddProjectToParticipantModal
          isOpen={showAddProjectToParticipant}
          participant={selectedParticipant}
          formData={addProjectForm}
          setFormData={setAddProjectForm}
          projects={projects}
          onSubmit={handleAddProjectToParticipant}
          onClose={() => {
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
        />

        <ConfirmDeleteModal
          isOpen={confirmDelete.isOpen}
          onClose={() => setConfirmDelete({ isOpen: false, type: '', data: null })}
          onConfirm={confirmDelete.type === 'subproject' ? confirmDeleteSubProject : confirmDeleteParticipantProject}
          title={confirmDelete.type === 'subproject' ? '確認刪除子計畫' : '確認刪除參與計畫'}
          message={
            confirmDelete.type === 'subproject'
              ? `確定要刪除「${confirmDelete.data?.subProjectName}」子計畫嗎？此操作無法復原。`
              : '確定要刪除此參與計畫記錄嗎？此操作無法復原。'
          }
        />
      </div>
    </div>
  );
};

export default ParticipantManagementApp;
