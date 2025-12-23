FROM node:22-slim AS build

WORKDIR /opt

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Build-time argument to control whether to install alpha prerelease packages
ARG INSTALL_ALPHA=true

# Install alpha packages like CI (if requested), then perform a clean install
RUN if [ "$INSTALL_ALPHA" = "true" ]; then \
			npm i podverse-helpers@alpha --save && \
			npm i podverse-external-services@alpha --save && \
			npm i podverse-orm@alpha --save && \
			npm i podverse-parser@alpha --save && \
			npm i podverse-mq@alpha --save ; \
		fi && \
		npm clean-install

# Copy the rest of the repository and build
COPY . .
RUN npm run build:prod

FROM node:22-slim AS runtime
WORKDIR /opt

# Copy built app and node_modules from build stage
COPY --from=build /opt ./

ENV NODE_ENV=production
EXPOSE 1234

# Default command — start the compiled server
CMD ["node", "dist/index.js"]
