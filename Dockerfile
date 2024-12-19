# Base image
FROM node:22.3 AS build

# Create app directory
WORKDIR /usr/src/app

# Copy shared files into the container
COPY / /usr/local/tmp/server

WORKDIR /usr/local/tmp/server
RUN npm install

# Only build in the build stage
RUN npm run build

FROM node:22.3 AS run

# Copy everything from build stage
COPY --from=build /usr/local/tmp/server /usr/banking/server/
COPY --from=build /usr/local/tmp/server/dist /usr/banking/server/dist

# Add wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Set working directory
WORKDIR /usr/banking/server/

# Expose the port
EXPOSE 3000

# Create a startup script
RUN echo '#!/bin/bash\n\
/wait-for-it.sh postgres:5432 -t 60 -- npm run seed\n\
node dist/main' > /usr/banking/server/seed.sh

RUN chmod +x /usr/banking/server/seed.sh

# Use the startup script as the CMD
CMD ["/usr/banking/server/seed.sh"]