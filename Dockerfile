# syntax=docker/dockerfile:1

FROM ubuntu:rolling@sha256:7a520eeb6c18bc6d32a21bb7edcf673a7830813c169645d51c949cecb62387d0 as depender

ARG APT_MIRROR="ftp.jaist.ac.jp/pub/Linux"
RUN sed -i "s@archive.ubuntu.com@${APT_MIRROR}@g" /etc/apt/sources.list
RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt update && apt-get -y --no-install-recommends install ca-certificates curl jq
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG NODE_ENV="production"
RUN mkdir /pnpm
WORKDIR /package
COPY .npmrc package.json ./
RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=$(cat package.json  | jq -r .packageManager | grep -oP '\d+\.\d+\.\d+') bash - \
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

FROM gcr.io/distroless/cc-debian11:nonroot@sha256:880bcf2ca034ab5e8ae76df0bd50d700e54eb44e948877244b130e3fcd5a1d66

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
