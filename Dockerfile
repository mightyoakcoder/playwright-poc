# Get the latest version of Playwright
FROM mcr.microsoft.com/playwright:v1.44.1-jammy

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY . /app/
RUN npm ci && npm run tests:api


