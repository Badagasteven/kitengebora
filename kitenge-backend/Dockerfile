# syntax=docker/dockerfile:1

# Build stage
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Render provides PORT env var; Spring Boot reads server.port=${PORT:8080}
ENV PORT=10000
EXPOSE 10000
ENTRYPOINT ["java","-jar","/app/app.jar"]
