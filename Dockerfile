FROM python:3.12-slim AS backend

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY alembic.ini .

EXPOSE 8000

CMD ["sh", "backend/entrypoint.sh"]


FROM node:22-alpine AS frontend-build

WORKDIR /app

ARG VITE_DEFAULT_USER_ID=1
ENV VITE_DEFAULT_USER_ID=$VITE_DEFAULT_USER_ID

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build


FROM nginx:1.27-alpine AS frontend

COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
