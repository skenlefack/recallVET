FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Fix line endings (Windows CRLF → LF) and make entrypoint executable
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

# Create uploads directory
RUN mkdir -p uploads/logos

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
