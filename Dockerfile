# Use Node.js 16 base image
FROM node:21

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev
RUN npm install -g npm@10.8.1
RUN npm install shape

# Copy the rest of the application
COPY . .
WORKDIR /usr/src/app
COPY .env.example .env


# Build the Next.js application
RUN npm run build

# Expose the port Next.js is running on (default is 3000)
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
