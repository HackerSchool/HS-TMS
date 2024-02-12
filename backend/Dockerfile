FROM node:20

# Install the PostgreSQL client tools
RUN apt-get update && apt-get install -y postgresql-client-15

# Create app directory
WORKDIR /usr/src/app/backend

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY .env* .
COPY init-demo.sql .

# Setup pdfmake VFS
RUN mkdir node_modules/pdfmake/report
RUN mkdir node_modules/pdfmake/report/assets
COPY src/modules/report/assets node_modules/pdfmake/report/assets
RUN cd node_modules/pdfmake && node build-vfs.js "./report/assets" "./build/vfs.js"

EXPOSE 3000
CMD [ "npm", "start" ]