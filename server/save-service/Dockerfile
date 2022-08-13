FROM node:slim as ts-compiler
WORKDIR /home/app

COPY . .

RUN yarn install
RUN yarn run build

FROM node:slim as ts-remover
WORKDIR /home/app

COPY --from=ts-compiler /home/app/package.json ./
COPY --from=ts-compiler /home/app/dist ./

RUN yarn install --production

FROM node:slim
WORKDIR /home/app
COPY --from=ts-remover /home/app ./
ENV PORT=3000
EXPOSE 3000
CMD ["node","index.js"]