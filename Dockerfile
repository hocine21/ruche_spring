# Étape 1 : Build avec Maven
FROM maven:3.9.6-eclipse-temurin-17 AS builder

# Copier tout le projet dans le conteneur
WORKDIR /app
COPY . .

# Lance les tests (en les gardant visibles dans la CI)
RUN mvn clean test

# Compiler le projet (mvn clean package)
RUN mvn clean package -DskipTests

# Étape 2 : Exécuter avec JDK léger
FROM eclipse-temurin:17-jdk-alpine

# Dossier de travail
WORKDIR /app

# Copier le jar compilé depuis l’étape précédente
COPY --from=builder /app/target/*.jar app.jar

# Exposer le port de l’application Spring Boot
EXPOSE 8080

# Commande de démarrage
ENTRYPOINT ["java", "-jar", "app.jar"]