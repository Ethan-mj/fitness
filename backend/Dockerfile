FROM maven:3.6.0-jdk-8-slim AS build
WORKDIR /app
COPY settings.xml pom.xml ./
RUN mvn -B -s settings.xml dependency:go-offline
COPY src src
RUN mvn -B -s settings.xml clean package -DskipTests

FROM alpine:3.13
WORKDIR /app
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tencent.com/g' /etc/apk/repositories \
    && apk add --update --no-cache openjdk8-jre-base ca-certificates tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo Asia/Shanghai > /etc/timezone \
    && rm -rf /var/cache/apk/*
COPY --from=build /app/target/fitness-booking-1.0.0.jar app.jar
ENV SERVER_PORT=80
ENV SPRING_PROFILES_ACTIVE=cloud
EXPOSE 80
CMD ["java", "-jar", "/app/app.jar"]
