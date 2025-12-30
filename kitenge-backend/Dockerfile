# ---------- Build stage (has Maven) ----------
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -q -DskipTests package

# ---------- Run stage (small JRE) ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Render uses PORT env var
EXPOSE 10000

COPY --from=build /app/target/*.jar app.jar

CMD ["sh", "-c", "java -jar app.jar"]
