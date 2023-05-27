FROM ubuntu:rolling as depender

RUN sed -i 's@archive.ubuntu.com@ftp.jaist.ac.jp/pub/Linux@g' /etc/apt/sources.list
RUN apt-get update
RUN apt-get -y --no-install-recommends install ca-certificates curl jq

ENV NODE_ENV="production"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir /pnpm
WORKDIR /package
COPY .npmrc package.json ./
RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=$(cat package.json  | jq -r .packageManager | grep -oP '\d+\.\d+\.\d') bash -
RUN pnpm config set store-dir /.pnpm-store
COPY patches/discord.js@14.11.0.patch ./patches/
COPY pnpm-lock.yaml ./
RUN pnpm i

FROM depender as builder

ENV NODE_ENV="development"
COPY tsconfig.json ./
RUN pnpm i
COPY src/ ./src
RUN pnpm exec tsc

FROM gcr.io/distroless/cc-debian11:nonroot

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
COPY --from=depender /pnpm /pnpm
COPY --from=builder /package/dist/ ./dist
COPY .npmrc package.json ./
COPY --from=depender /package/node_modules ./node_modules
ENTRYPOINT [ "pnpm", "--shell-emulator" ]
CMD [ "start" ]
