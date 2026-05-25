FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install ALL deps (including devDeps like typescript) for the build step
RUN npm ci

COPY . .

# Build TypeScript → dist/
RUN npm run build

# Remove devDependencies after build to keep image lean
RUN npm prune --production

RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "dist/index.js"]
