FROM node:22-slim
WORKDIR /app
COPY worker/package.json worker/index.ts ./worker/
COPY src/lib/audit/ ./src/lib/audit/
COPY package.json tsconfig.json ./
RUN cd worker && npm install
EXPOSE 3002
CMD ["npx", "--prefix", "worker", "tsx", "worker/index.ts"]
