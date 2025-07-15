import React from 'react';

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

export default ParticipantListItem;
