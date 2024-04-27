# syntax=docker/dockerfile:1

# provided for convenience
FROM oven/bun:alpine

# Config Bun
ENV PATH="~/.bun/bin:${PATH}"
RUN ln -s /usr/local/bin/bun /usr/local/bin/node

# Update packages
RUN apk update && \
    apk add --no-cache git \
    && rm -rf /var/cache/apk/*

RUN bun -v
