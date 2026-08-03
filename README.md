# 燃动健身约课系统

一个可部署到微信云托管或普通云服务器的健身私教约课系统，包含免登录约课端、管理员后台和 Java 服务。

## 已实现功能

会员端：

- 无需登录，约课前选择本次上课的会员
- 查看所选会员的头像与剩余课时
- 按教练筛选可约时段并预约
- 查看预约记录，开课 2 小时前可取消并自动退回课时

管理员端：

- 独立账号密码登录与角色权限隔离
- 统一录入会员，支持上传 JPG、PNG、WebP 头像并设置初始课时
- 查看会员、教练、待上课程与剩余总课时
- 新增、启用或停用教练
- 给会员增加或扣减课时，并保存调整流水
- 为教练开放新的可预约时段
- 查看全店预约记录

## 项目结构

```text
frontend/   React + TypeScript + Vite
backend/    Java 8 + Spring Boot 2.5.5 + Spring Security + JPA（微信云托管模板版本）
deploy/     Nginx 配置
docker-compose.yml  MySQL、后端和网页一键部署
```

## 本地运行

启动后端（默认使用本地 H2 文件数据库）：

```bash
cd backend
mvn spring-boot:run
```

再启动前端：

```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:5173` 进入约课端，访问 `http://localhost:5173/admin` 进入管理后台。

本地管理员演示账号：`admin` / `Fit@2026`。上线前务必设置新的 `ADMIN_INITIAL_PASSWORD`。

## 云服务器部署

服务器建议：2 核 CPU、4 GB 内存、40 GB SSD，Ubuntu 24.04 LTS，安装 Docker 与 Docker Compose。域名应完成备案（中国大陆服务器）并配置 HTTPS。

1. 将项目上传到服务器。
2. 复制环境变量并填写真实值：

```bash
cp .env.example .env
```

3. 构建并启动：

```bash
docker compose up -d --build
```

4. 在云厂商负载均衡或宿主机 Caddy/Nginx 上配置 HTTPS，再反向代理到本项目 `WEB_PORT`。

查看运行状态：

```bash
docker compose ps
docker compose logs -f backend
```

## 上线前检查

- 修改 `.env` 中全部密码和 JWT 密钥
- 使用已备案域名和 HTTPS
- 在云防火墙中只开放 80/443，MySQL 不暴露公网
- 定期备份 MySQL；会员资料、课时和头像均保存在数据库中
- Docker 部署默认不生成演示会员和教练，只创建 `admin` 管理员；密码来自 `ADMIN_INITIAL_PASSWORD`

## 微信云托管部署后端

`backend/` 已按微信云托管 Spring Boot 模板的约定准备，可将这个目录作为云托管服务的代码根目录：

- `Dockerfile`：使用腾讯 Maven 镜像构建，生产容器监听 80 端口
- `settings.xml`：Maven 国内镜像配置
- `container.config.json`：1 核 2 GB、0–5 实例和 `fitness` 数据库初始化配置
- `application-cloud.yml`：读取云托管提供的 MySQL 环境变量

在微信云托管新建服务并上传 `backend/` 后，确认服务端口为 `80`，并配置：

```text
MYSQL_ADDRESS=10.16.105.178:3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=数据库密码
MYSQL_DATABASE=fitness
JWT_SECRET=至少 32 位随机字符串
ADMIN_INITIAL_PASSWORD=管理员初始密码
SEED_ENABLED=false
```

外网管理地址仅用于本地维护；微信云托管运行时使用内网地址 `10.16.105.178:3306`。数据库密码不得写入源码或提交到仓库，应在云托管控制台配置为 `MYSQL_PASSWORD`。

`fitness` 数据库及以下业务表已经建立：`app_users`、`member_avatars`、`coach`、`coach_slot`、`booking`、`lesson_change`。会员头像保存在 MySQL，不依赖容器本地磁盘，因此扩缩容或重新发布不会丢失头像。

## 主要接口

- `POST /api/auth/admin`：管理员登录
- `GET /api/public/members`：约课可选会员（不返回手机号）
- `GET /api/public/slots`：可约时段
- `POST /api/public/bookings`：指定会员预约课程
- `POST /api/public/bookings/{id}/cancel`：取消指定会员的预约
- `POST /api/admin/users`：管理员录入会员和头像
- `/api/admin/**`：会员、教练、课时、时段与预约管理
