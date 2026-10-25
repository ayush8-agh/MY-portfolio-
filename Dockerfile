# Use official lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package and server files
COPY package.json dev-server.js ./
COPY css/ ./css/
COPY data/ ./data/
COPY js/ ./js/
COPY netlify/ ./netlify/
COPY api/ ./api/
COPY index.html admin.html profile_avatar.png robot_hero.png ./

# Expose default port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["node", "dev-server.js"]
