# 健身教练约课服务端

基于 Java 8 与 Spring Boot 2.5.5 的健身约课后端，目录结构与微信云托管 Spring Boot 模板保持一致，可直接从 GitHub 仓库根目录构建。

## 功能

- 管理员微信授权登录（OpenID 白名单）
- 会员录入及头像上传
- 会员剩余课时增加、扣减与变更记录
- 教练和可预约时段管理
- 无登录会员选择、约课、取消预约及剩余课时查询
- MySQL 持久化，头像存储在数据库中

## 项目结构

```text
.
├── Dockerfile
├── container.config.json
├── pom.xml
├── settings.xml
└── src
    ├── main
    └── test
```

## 微信云托管部署

在微信云托管中关联本仓库，选择 `main` 分支并从仓库根目录构建。容器监听端口为 `80`。

部署前在服务设置中配置：

```text
MYSQL_ADDRESS=10.16.105.178:3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=数据库密码
MYSQL_DATABASE=fitness
WECHAT_APP_ID=wx7eba904112ff9518
ADMIN_WECHAT_OPENIDS=管理员微信OpenID，多个用英文逗号分隔
JWT_SECRET=至少32位随机字符串
SPRING_PROFILES_ACTIVE=cloud
SEED_ENABLED=false
```

数据库密码、管理员 OpenID 白名单和 JWT 密钥只能配置在云托管控制台，不要写入代码仓库。小程序通过 `wx.cloud.callContainer` 访问时，微信云托管会自动注入可信的 `X-WX-OPENID` 和 `X-WX-APPID` 请求头；云环境默认关闭账号密码登录。

首次启动需要初始化 Spring 和数据库连接，请在云托管服务设置中将健康检查初始延迟设置为 `60` 秒。`container.config.json` 只负责模板首次部署，服务创建后的健康检查配置以控制台为准。

## 本地运行

本地默认使用 H2 文件数据库：

```bash
mvn spring-boot:run
```

默认服务地址为 `http://localhost:8080`。本地演示管理员为 `admin / Fit@2026`，该密码不得用于生产环境。

## 主要接口

- `GET /api/auth/wechat/identity`：获取当前微信身份及管理员状态
- `POST /api/auth/wechat/admin`：管理员微信授权登录
- `GET /api/public/members`：获取可选择的会员
- `GET /api/public/slots`：获取可预约时段
- `POST /api/public/bookings`：指定会员预约课程
- `POST /api/public/bookings/{id}/cancel`：取消预约
- `POST /api/admin/users`：管理员录入会员和头像
- `/api/admin/**`：会员、教练、课时、时段及预约管理
