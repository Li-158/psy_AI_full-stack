# 建構階段
FROM node:18-alpine as build

WORKDIR /app

# 複製 package.json 並安裝依賴
COPY package*.json ./
RUN npm ci --only=production

# 複製源代碼
COPY . .

# 建構應用
RUN npm run build

# 生產階段
FROM nginx:alpine

# 複製建構的檔案到 nginx
COPY --from=build /app/build /usr/share/nginx/html

# 複製 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
