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
RUN pnpm i

FROM gcr.io/distroless/cc-debian11:nonroot

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
USER nonroot
WORKDIR /app
COPY --chown=nonroot:nonroot --from=depender /pnpm /pnpm
COPY --chown=nonroot:nonroot src/ ./src
COPY --chown=nonroot:nonroot .npmrc package.json ./
COPY --chown=nonroot:nonroot --from=depender /package/node_modules ./node_modules
ENTRYPOINT [ "pnpm", "--shell-emulator" ]
CMD [ "start" ]
