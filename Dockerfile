FROM node:20-bullseye-slim AS base
WORKDIR /app

# better-sqlite3 needs build tools to compile its native addon
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 4000
CMD ["npm", "start"]
