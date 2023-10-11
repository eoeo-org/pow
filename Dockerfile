# syntax=docker/dockerfile:1

FROM ghcr.io/jqlang/jq:1.7@sha256:12f998e5a6f3f6916f744ba6f01549f156f624b42f7564e67ec6dd4733973146 as jq-base

FROM quay.io/curl/curl-base:8.4.0@sha256:36f04935213478584f0232e3e6d226a8b803cd98477bd20f89aec913c2450532 as curl-base
ENV PATH="/copied/bin:$PATH"
WORKDIR /dist
COPY --from=jq-base /jq /copied/bin/jq
COPY package.json ./
RUN curl -fsSL --compressed https://get.pnpm.io/install.sh | sed '/setup --force/d' | sed 's|chmod +x "$tmp_dir/pnpm"|install "$tmp_dir/pnpm" pnpm|' | env PNPM_VERSION=$(cat package.json  | jq -r .packageManager | grep -oE '[0-9]+\.[0-9]+\.[0-9]+') sh -

FROM ubuntu:rolling@sha256:f1090cfa89ab321a6d670e79652f61593502591f2fc7452fb0b7c6da575729c4 as depender
ENV SHELL="bash"
ARG NODE_ENV="production"
RUN mkdir /pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /package
COPY --from=curl-base /dist /copied-bin
COPY .npmrc package.json ./
RUN /copied-bin/pnpm setup --force \
    && pnpm config set store-dir /.pnpm-store
RUN --mount=type=cache,target=/.pnpm-store \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    pnpm install --frozen-lockfile

FROM depender as builder
ARG NODE_ENV="development"
RUN --mount=type=cache,target=/.pnpm-store \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    pnpm install --frozen-lockfile
RUN --mount=type=bind,source=src/,target=src/ \
    --mount=type=bind,source=.swcrc,target=.swcrc \
    pnpm build

FROM gcr.io/distroless/cc-debian12:nonroot@sha256:0a944ba09780b6a4e7a8f30287f88a70d7914ad2ba878233ff8cfffb7479158c
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV="production"
WORKDIR /app
COPY --from=depender /pnpm /pnpm
COPY --from=builder /package/dist/ ./dist
COPY .npmrc package.json ./
COPY --from=depender /package/node_modules ./node_modules
ENTRYPOINT [ "pnpm", "--shell-emulator" ]
CMD [ "start" ]
