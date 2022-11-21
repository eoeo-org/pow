FROM ubuntu:rolling as depender

ENV NODE_ENV="production"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN mkdir /pnpm
RUN sed -i 's@archive.ubuntu.com@ftp.jaist.ac.jp/pub/Linux@g' /etc/apt/sources.list
RUN apt-get update
RUN apt-get install curl jq -y
WORKDIR /package
COPY .npmrc /package
COPY package.json /package
RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=$(cat package.json  | jq -r .packageManager | sed 's/.*@//') bash -
RUN pnpm config set script-postinstall ""
RUN pnpm i

FROM gcr.io/distroless/cc:nonroot

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
COPY --chown=nonroot:nonroot --from=depender /pnpm /pnpm
COPY --chown=nonroot:nonroot src/ /app/src
COPY --chown=nonroot:nonroot .npmrc /app
COPY --chown=nonroot:nonroot package.json /app
COPY --chown=nonroot:nonroot --from=depender /package/node_modules /app/node_modules
USER nonroot
CMD ["pnpm", "node", "."]
