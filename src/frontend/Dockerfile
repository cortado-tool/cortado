FROM node:18.13.0-alpine

WORKDIR /app

# Сначала только манифесты — чтобы кешировались зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Потом исходники
COPY . .

EXPOSE 4444
CMD ["npm", "start"]
