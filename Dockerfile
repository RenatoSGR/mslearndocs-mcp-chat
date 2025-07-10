# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Set environment variables (to be passed at runtime)
ENV AZURE_OPENAI_ENDPOINT=""
ENV AZURE_OPENAI_KEY=""
ENV AZURE_OPENAI_DEPLOYMENT_NAME=""

# Start the Next.js app
CMD ["npm", "run", "start"]