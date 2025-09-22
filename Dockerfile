# Étape 1 : Build avec Maven
FROM maven:3.9.6-eclipse-temurin-17 AS builder

# Copier tout le projet dans le conteneur
WORKDIR /app
COPY . .

# Lance les tests (en les gardant visibles dans la CI)
RUN mvn clean test

# Compiler le projet (mvn clean package)
RUN mvn clean package -DskipTests

# Étape unique : juste exécuter l'app avec JDK léger
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copier le jar compilé par Maven dans le job GitHub
COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
