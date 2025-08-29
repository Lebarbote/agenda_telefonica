FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json* ./

# Omit dev dependency
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000

CMD ["npm", "start"]
