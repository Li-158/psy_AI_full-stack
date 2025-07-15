import React from 'react';
import { Search, UserPlus, User } from 'lucide-react';
import ParticipantListItem from './ParticipantListItem';

const ParticipantsList = ({ 
  participants, 
  selectedParticipant, 
  onSelectParticipant, 
  searchTerm, 
  onSearchChange,
  filterProject,
  onFilterProjectChange,
  filterSubProject,
  onFilterSubProjectChange,
  projects,
  onAddParticipant
}) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">參與者列表</h2>
        <button
          onClick={onAddParticipant}
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
            onChange={(e) => onSearchChange(e.target.value)}
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
            onChange={(e) => onFilterProjectChange(e.target.value)}
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
            onChange={(e) => onFilterSubProjectChange(e.target.value)}
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
            onClick={() => onSelectParticipant(participant)}
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
  );
};

export default ParticipantsList;
