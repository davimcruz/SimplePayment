FROM node:20.16.0-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* .npmrc ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm dlx prisma generate && pnpm build

EXPOSE 3000

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]