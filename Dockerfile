# Use Node.js 16 base image (use node:16 or another LTS version)
FROM node:21

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Install specific global npm version if necessary
RUN npm install -g npm@10.8.1

# Remove this step as `shape` is likely part of package.json dependencies
# If it's not, you should add it to your `package.json`
# RUN npm install shape

# Copy the rest of the application
COPY . .

# Copy the .env.example file to .env (adjust this if you're copying an actual .env file)
COPY .env.example .env

# Build the Next.js application
RUN npm run build

# Expose the port Next.js is running on (default is 3000)
EXPOSE 3000

# Command to run the application
CMD ["npm", "run","dev"]
