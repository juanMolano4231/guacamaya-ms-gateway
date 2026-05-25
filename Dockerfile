FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY src/ ./src/
COPY .env.example .env.example

EXPOSE 3000

CMD ["node", "src/index.js"]
