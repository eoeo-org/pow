# syntax=docker/dockerfile:1

FROM ubuntu:rolling@sha256:f1090cfa89ab321a6d670e79652f61593502591f2fc7452fb0b7c6da575729c4 as depender

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
RUN curl -fsSL --compressed https://get.pnpm.io/install.sh | env PNPM_VERSION=$(cat package.json  | jq -r .packageManager | grep -oP '\d+\.\d+\.\d+') bash - \
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

FROM gcr.io/distroless/cc-debian11:nonroot@sha256:cd785cd7f107c41fc5f379a4bbec2a9c394e2c19da47e3465a9a162a89a569af

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
