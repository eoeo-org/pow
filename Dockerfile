# syntax=docker/dockerfile:1.6.0@sha256:ac85f380a63b13dfcefa89046420e1781752bab202122f8f50032edf31be0021

FROM ghcr.io/jqlang/jq:1.7@sha256:12f998e5a6f3f6916f744ba6f01549f156f624b42f7564e67ec6dd4733973146 as fetch-jq

FROM quay.io/curl/curl-base:8.6.0@sha256:a449217fb65f736674ae7d42d42b8eeb8b744d27b935bbc4b04ea82edb370d4c as fetch-pnpm
ENV SHELL="sh"
ENV ENV="/tmp/env"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /dist
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,from=fetch-jq,source=/jq,target=/mounted-bin/jq \
    curl -fsSL --compressed https://get.pnpm.io/install.sh | env PNPM_VERSION=$(cat package.json  | /mounted-bin/jq -r .packageManager | grep -oE '[0-9]+\.[0-9]+\.[0-9]+') sh -

FROM ubuntu:devel@sha256:442db92241e35a5b9d75afd7f958747011294dc65e2c41f88bcf6d77386860bc as fetch-deps
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /package
COPY --link --from=fetch-pnpm /pnpm/ /pnpm/
RUN pnpm config set store-dir /.pnpm-store
COPY --link .npmrc ./
RUN --mount=type=cache,id=pnpm-$TARGETPLATFORM,target=/.pnpm-store \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    pnpm fetch
COPY --link package.json ./

FROM fetch-deps as dev-deps
RUN --mount=type=cache,id=pnpm-$TARGETPLATFORM,target=/.pnpm-store \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=.husky/install.mjs,target=.husky/install.mjs \
    pnpm install --frozen-lockfile --offline

FROM ubuntu:devel@sha256:442db92241e35a5b9d75afd7f958747011294dc65e2c41f88bcf6d77386860bc as builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /package
RUN --mount=type=bind,from=fetch-deps,source=/pnpm/,target=/pnpm/ \
    --mount=type=bind,from=dev-deps,source=/package/node_modules/,target=node_modules/ \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=.npmrc,target=.npmrc \
    --mount=type=bind,source=src/,target=src/ \
    --mount=type=bind,source=.swcrc,target=.swcrc \
    pnpm build

FROM fetch-deps as prod-deps
ARG NODE_ENV="production"
RUN --mount=type=cache,id=pnpm-$TARGETPLATFORM,target=/.pnpm-store \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=.husky/install.mjs,target=.husky/install.mjs \
    pnpm install --frozen-lockfile --offline

FROM gcr.io/distroless/cc-debian12:nonroot@sha256:86bd488d212a31d16e5e49e625514a8e81b2d4ee6aff73b9f15059f51857f9a2
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV="production"
WORKDIR /app
COPY --link --from=fetch-deps /pnpm/ /pnpm/
COPY --link --from=builder /package/dist/ ./dist/
COPY --from=prod-deps /package/node_modules/ ./node_modules/
COPY --link .npmrc package.json ./
ENTRYPOINT [ "pnpm", "--shell-emulator" ]
CMD [ "start" ]
