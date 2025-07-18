import React, { useState } from 'react';
import { Users, FileText } from 'lucide-react';

const App = () => {
  const [currentView, setCurrentView] = useState('participants');

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

        {/* 參與者管理頁面 */}
        {currentView === 'participants' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">參與者管理頁面</h2>
            <p>參與者管理功能測試中...</p>
          </div>
        )}

        {/* 計畫管理頁面 */}
        {currentView === 'researchers' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">計畫管理頁面</h2>
            <p>計畫管理功能測試中...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
