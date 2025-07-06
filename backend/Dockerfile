FROM node:18-alpine

WORKDIR /app

# 複製 package files
COPY package*.json ./

# 安裝所有依賴（包括開發依賴用於編譯）
RUN npm ci

# 複製源碼
COPY . .

# 編譯 TypeScript
RUN npm run build

# 清理開發依賴，只保留生產依賴
RUN npm ci --only=production && npm cache clean --force

# 暴露端口
EXPOSE 3001

# 啟動應用
CMD ["npm", "start"]
