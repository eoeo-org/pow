# syntax=docker/dockerfile:1.12.1@sha256:93bfd3b68c109427185cd78b4779fc82b484b0b7618e36d0f104d4d801e66d25

# ビルド時にベースとするイメージを定義
FROM buildpack-deps:bookworm@sha256:08d61da2eb4b661e95088f6999704803985f9bd7be23b3c5d7acce26cd2d521b AS base-build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# jqのバイナリを取得する => /jq
FROM ghcr.io/jqlang/jq:1.7@sha256:12f998e5a6f3f6916f744ba6f01549f156f624b42f7564e67ec6dd4733973146 AS fetch-jq

# pnpmを取得する => /pnpm/
FROM quay.io/curl/curl-base:8.11.1@sha256:e4944acb33bc89f4ee28246f84e6ff8f967bb62f63db79f9b577e1b1f2d8f006 AS fetch-pnpm
ENV SHELL="/bin/sh"
ENV ENV="/tmp/env"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /dist
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,from=fetch-jq,source=/jq,target=/mounted-bin/jq \
    curl -fsSL --compressed https://get.pnpm.io/install.sh | env PNPM_VERSION=$(cat package.json  | /mounted-bin/jq -r .packageManager | grep -oE '[0-9]+\.[0-9]+\.[0-9]+') sh -

# .npmrcに設定を追記する => /_/.npmrc
FROM base-build AS change-npmrc
WORKDIR /_
COPY --link .npmrc ./
RUN echo "store-dir=/.pnpm-store" >> .npmrc

# Node.jsと依存パッケージを取得する => /pnpm/,/.pnpm-store/,/_/node_modules/
FROM base-build AS fetch-deps
WORKDIR /_
COPY --link --from=fetch-pnpm /pnpm/ /pnpm/
ARG TARGETPLATFORM
RUN --mount=type=cache,id=pnpm-$TARGETPLATFORM,target=/.pnpm-store/ \
    --mount=type=bind,from=change-npmrc,source=/_/.npmrc,target=.npmrc \
    pnpm install -g node-gyp
RUN --mount=type=cache,id=pnpm-$TARGETPLATFORM,target=/.pnpm-store/ \
    --mount=type=bind,from=change-npmrc,source=/_/.npmrc,target=.npmrc \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    PRISMA_SKIP_POSTINSTALL_GENERATE=true pnpm fetch

# dev用の依存パッケージをインストールする => /_/node_modules/
FROM --platform=$BUILDPLATFORM base-build AS dev-deps
WORKDIR /_
COPY --link --from=fetch-deps /_/node_modules/ ./node_modules/
ARG BUILDPLATFORM
RUN --mount=type=cache,id=pnpm-$BUILDPLATFORM,target=/.pnpm-store/ \
    --mount=type=bind,from=fetch-deps,source=/pnpm/,target=/pnpm/ \
    --mount=type=bind,from=change-npmrc,source=/_/.npmrc,target=.npmrc \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=.husky/install.mjs,target=.husky/install.mjs \
    pnpm install --frozen-lockfile --offline

# ビルドする => /_/node_modules/.prisma/client/,/_/dist/
FROM --platform=$BUILDPLATFORM base-build AS build
WORKDIR /_
COPY --link --from=dev-deps /_/node_modules/ ./node_modules/
RUN --mount=type=bind,from=fetch-deps,source=/pnpm/,target=/pnpm/ \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,from=change-npmrc,source=/_/.npmrc,target=.npmrc \
    --mount=type=bind,source=src/,target=src/,readwrite \
    --mount=type=bind,source=.swcrc,target=.swcrc \
    --mount=type=bind,source=prisma/schema.prisma,target=prisma/schema.prisma \
    pnpm db:generate && pnpm build

# prod用の依存パッケージをインストールする => /_/node_modules/
FROM base-build AS prod-deps
WORKDIR /_
COPY --link --from=fetch-deps /_/node_modules/ ./node_modules/
ARG NODE_ENV="production"
ARG TARGETPLATFORM
RUN --mount=type=cache,id=pnpm-$TARGETPLATFORM,target=/.pnpm-store/ \
    --mount=type=bind,from=fetch-deps,source=/pnpm/,target=/pnpm/ \
    --mount=type=bind,from=change-npmrc,source=/_/.npmrc,target=.npmrc \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=.husky/install.mjs,target=.husky/install.mjs \
    pnpm install --frozen-lockfile --offline

FROM gcr.io/distroless/cc-debian12:nonroot@sha256:594b5200fd1f06d17a877ebee16d4af84a9a7ab83c898632a2d5609c0593cbab AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV="production"
WORKDIR /app
COPY --link --from=fetch-deps /pnpm/ /pnpm/
COPY --link --from=build /_/dist/ ./dist/
COPY --link --from=prod-deps /_/node_modules/ ./node_modules/
COPY --link .npmrc package.json ./
ENTRYPOINT [ "pnpm", "--shell-emulator" ]
CMD [ "start" ]
