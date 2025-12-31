# -------- BUILD STAGE --------
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build

COPY kitenge-backend/pom.xml ./pom.xml
RUN mvn -B -q dependency:go-offline

COPY kitenge-backend/src ./src
RUN mvn -B -DskipTests package

# -------- RUN STAGE --------
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080
ENV PORT=8080

CMD ["java", "-jar", "app.jar"]
