# Backend image for local Docker Compose and Render.
# Context: repository root.

FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY job-recommendation/pom.xml .
COPY job-recommendation/src ./src
COPY job-recommendation/seed ./seed

RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system spring \
    && useradd --system --gid spring spring

COPY --from=build /app/target/job-recommendation-0.0.1-SNAPSHOT.jar app.jar

USER spring
EXPOSE 3030

ENV PORT=3030
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f "http://localhost:${PORT}/actuator/health" || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
