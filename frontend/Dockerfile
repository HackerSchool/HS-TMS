FROM node:16

# Create app directory
WORKDIR /usr/src/app/frontend

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY ./.eslintrc.cjs .
COPY ./index.html .
COPY ./vite*.js .

EXPOSE 5173
CMD [ "npm", "run", "dev" ]