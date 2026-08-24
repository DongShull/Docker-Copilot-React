# 构建阶段 - Build Stage
FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制项目文件
COPY . .

# 构建应用
RUN npm test && VITE_BASE_PATH=/ npm run build

# ============================================
# 运行阶段 - Production Stage
FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32

# 设置工作目录
WORKDIR /app

# 从构建阶段复制构建结果
COPY --chown=node:node --from=builder /app/dist ./dist

# 复制配置脚本
COPY --chown=node:node docker-config.sh server.mjs /app/
RUN chmod 0555 /app/docker-config.sh /app/server.mjs

USER node

# 暴露端口
EXPOSE 12713

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:12713/ || exit 1

# 使用配置脚本启动应用
CMD ["/app/docker-config.sh"]
