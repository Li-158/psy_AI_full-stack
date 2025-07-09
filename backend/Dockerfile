FROM node:18-alpine AS builder

WORKDIR /app

# 安裝構建依賴
RUN apk add --no-cache python3 make g++

# 複製 package 檔案
COPY package*.json ./
COPY tsconfig.json ./

# 安裝所有依賴（包括開發依賴）
RUN npm ci

# 複製源代碼
COPY src ./src

# 構建 TypeScript
RUN npm run build

# 生產階段
FROM node:18-alpine

WORKDIR /app

# 安裝運行時依賴
RUN apk add --no-cache python3 make g++

# 複製 package 檔案
COPY package*.json ./

# 只安裝生產依賴
RUN npm ci --only=production && \
    npm cache clean --force

# 從構建階段複製編譯後的代碼
COPY --from=builder /app/dist ./dist

# 複製其他必要文件
COPY .env* ./

# 設置環境變數
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# 啟動應用
CMD ["node", "dist/server.js"]
