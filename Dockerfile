# Use official Node.js LTS image
FROM node:20-alpine

# Install additional packages that might be needed
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy package files and install dependencies
COPY package.json ./

# Install dependencies - include dev dependencies for build
RUN npm install && npm cache clean --force

# Copy the rest of the application code and set proper ownership
COPY --chown=nextjs:nodejs . .

# Ensure all executables have proper permissions
RUN chmod -R 755 node_modules/.bin/

# Build the Next.js app as root (to ensure permissions)
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm prune --production

# Expose port 3000
EXPOSE 3000

# Set environment variables (to be passed at runtime)
ENV AZURE_OPENAI_ENDPOINT=""
ENV AZURE_OPENAI_KEY=""
ENV AZURE_OPENAI_DEPLOYMENT_NAME=""
ENV NODE_ENV=production

# Change to non-root user for runtime
USER nextjs

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the Next.js app
CMD ["npm", "run", "start"]