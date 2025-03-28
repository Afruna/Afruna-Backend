ARG NODE_VERSION=18.17.1

FROM node:${NODE_VERSION}-alpine

# Add tool which will fix init process
# RUN apk add dumb-init

# Optimise for production
ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

# Copy app files
COPY --chown=node:node . /usr/src/app

# Install only production dependencies
RUN npm install

# friends don’t let friends run containers as root!
USER node

# Make port 8080 accessible outside of container
EXPOSE 8080
CMD ["npm", "start" ]