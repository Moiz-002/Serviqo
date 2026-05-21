FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (use package-lock if present)
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Optional: set a default port (app uses process.env.PORT)
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]