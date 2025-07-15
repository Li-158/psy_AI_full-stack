# 前端重構說明

## 重構內容

已將原本龐大的 App.js 檔案重構為更小、更易維護的組件結構。

## 新的檔案結構

```
src/
├── App.js                           # 主應用程式（精簡版）
├── components/
│   ├── common/                      # 通用組件
│   │   ├── Toast.js                # Toast 提示組件
│   │   └── ConfirmDeleteModal.js   # 確認刪除對話框
│   ├── participants/                # 參與者相關組件
│   │   ├── ParticipantsList.js     # 參與者列表
│   │   ├── ParticipantListItem.js  # 參與者列表項目
│   │   ├── ParticipantDetail.js    # 參與者詳細資訊
│   │   └── ProjectStatusItem.js    # 計畫狀態項目
│   ├── projects/                    # 計畫相關組件
│   │   ├── ProjectsList.js         # 計畫列表
│   │   └── ProjectDetail.js        # 計畫詳細資訊
│   └── modals/                      # 彈出視窗組件
│       ├── AddParticipantModal.js   # 新增/編輯參與者
│       ├── AddProjectModal.js       # 新增計畫
│       └── AddProjectToParticipantModal.js  # 為參與者新增計畫
└── utils/
    └── sampleData.js               # 示例數據和工具函數
```

## 主要改進

1. **程式碼重複問題已解決**
   - 移除了原本的重複程式碼區塊
   - 將共用邏輯提取到獨立的組件中

2. **檔案大小優化**
   - 原本的 App.js 從 3000+ 行減少到約 600 行
   - 每個組件檔案都控制在合理的大小範圍內

3. **可維護性提升**
   - 清晰的組件結構，易於定位和修改功能
   - 組件職責單一，降低耦合度
   - 更容易進行單元測試

## 組件說明

### 通用組件 (common/)
- **Toast.js**: 全局提示訊息組件，支援成功、錯誤、資訊等類型
- **ConfirmDeleteModal.js**: 通用的確認刪除對話框

### 參與者組件 (participants/)
- **ParticipantsList.js**: 管理參與者列表的顯示、搜尋和篩選
- **ParticipantListItem.js**: 單個參與者的列表項目顯示
- **ParticipantDetail.js**: 顯示選中參與者的詳細資訊
- **ProjectStatusItem.js**: 參與者參與計畫的狀態管理

### 計畫組件 (projects/)
- **ProjectsList.js**: 顯示所有計畫的列表
- **ProjectDetail.js**: 顯示選中計畫的詳細資訊和參與者統計

### 彈出視窗組件 (modals/)
- **AddParticipantModal.js**: 新增或編輯參與者資訊
- **AddProjectModal.js**: 新增新的計畫
- **AddProjectToParticipantModal.js**: 為現有參與者新增計畫參與記錄

## 使用方式

重構後的程式碼保持了原有的所有功能，使用方式不變。主要的改變都在內部結構上，對使用者界面沒有影響。

## 未來建議

1. 考慮使用狀態管理工具（如 Redux 或 Context API）來管理全局狀態
2. 將 API 呼叫邏輯提取到獨立的 service 層
3. 添加 PropTypes 或 TypeScript 來增強類型安全
4. 實現懶加載以優化初始載入時間
5. 添加單元測試以確保組件功能正確
