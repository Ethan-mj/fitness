# 健身约课后端（微信云托管）

本目录可直接作为微信云托管服务的代码根目录上传。项目与官方 `wxcloudrun-springboot` 模板保持一致，使用 Java 8、Spring Boot 2.5.5、80 端口、MySQL 环境变量、Maven 镜像和 `container.config.json`。

## 云托管配置

服务端口：`80`

必填环境变量：

```text
MYSQL_ADDRESS=10.16.105.178:3306
MYSQL_USERNAME=root
MYSQL_PASSWORD
JWT_SECRET
ADMIN_INITIAL_PASSWORD
```

建议环境变量：

```text
MYSQL_DATABASE=fitness
SEED_ENABLED=false
CORS_ALLOWED_ORIGIN=管理后台使用的 Web 域名
```

## 本地启动

本地默认使用 H2 文件数据库，不需要安装 MySQL：

```bash
mvn spring-boot:run
```

默认端口为 `8080`，管理员开发账号为 `admin / Fit@2026`。生产环境必须通过环境变量修改密码和 JWT 密钥。数据库密码只在微信云托管控制台配置，不要写入项目文件。
