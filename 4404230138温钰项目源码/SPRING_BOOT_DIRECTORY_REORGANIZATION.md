# Spring Boot Project Directory Reorganization Guide

## 1. Current Project Structure Analysis

### Existing Directory Layout
```
spring-boot-migration/
├── ARCHITECTURE_DESIGN.md
├── logs/
│   └── application.log
├── pom.xml
├── pom.xml.versionsBackup
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── hardware/
│       │           └── compatibility/
│       │               ├── CompatibilityCheckerApplication.java
│       │               ├── HardwareCompatibilityApplication.java
│       │               ├── config/
│       │               ├── controller/
│       │               ├── dto/
│       │               ├── entity/
│       │               ├── repository/
│       │               └── service/
│       └── resources/
│           └── application.yml
└── target/
```

### Discrepancies from Standard Spring Boot Structure

1. **Missing Test Directory**: The project lacks a `src/test` directory, which is a fundamental part of Spring Boot applications for unit and integration testing.

2. **Multiple Main Application Classes**: There are two main application classes (`CompatibilityCheckerApplication.java` and `HardwareCompatibilityApplication.java`), which can cause confusion and potential conflicts.

3. **Incomplete Resource Organization**: The `src/main/resources` directory contains only the main configuration file (`application.yml`), but no other standard Spring Boot resource directories like `static/`, `templates/`, or `public/`.

4. **No Profile-Specific Configuration**: While there's an `active: dev` profile set in `application.yml`, there are no separate configuration files for different profiles (e.g., `application-dev.yml`, `application-prod.yml`).

5. **No Documentation Directory**: The project has documentation files in the root, but there's no standard `docs/` directory structure.

## 2. Standard Spring Boot Directory Structure

A typical Spring Boot application follows this directory structure:

```
spring-boot-migration/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── hardware/
│   │   │           └── compatibility/
│   │   │               ├── HardwareCompatibilityApplication.java  # Single main class
│   │   │               ├── config/                               # Configuration classes
│   │   │               ├── controller/                           # REST controllers
│   │   │               ├── dto/                                  # Data Transfer Objects
│   │   │               ├── entity/                               # JPA entities
│   │   │               ├── repository/                           # Spring Data JPA repositories
│   │   │               └── service/                              # Business logic
│   │   └── resources/
│   │       ├── application.yml                                  # Main configuration
│   │       ├── application-dev.yml                              # Dev profile configuration
│   │       ├── application-prod.yml                             # Prod profile configuration
│   │       ├── static/                                          # Static resources (CSS, JS, images)
│   │       └── templates/                                       # Thymeleaf/Freemarker templates
│   └── test/
│       ├── java/
│       │   └── com/
│       │       └── hardware/
│       │           └── compatibility/                           # Test classes
│       └── resources/                                           # Test resources
├── docs/                                                         # Project documentation
├── logs/                                                         # Log files
├── pom.xml                                                       # Maven build file
└── target/                                                       # Build artifacts
```

## 3. Step-by-Step Reorganization Instructions

### 3.1 Create Missing Directories

1. Create the test directory structure:
   ```bash
   mkdir -p src/test/java/com/hardware/compatibility
   mkdir -p src/test/resources
   ```

2. Create resource directories:
   ```bash
   mkdir -p src/main/resources/static
   mkdir -p src/main/resources/templates
   ```

3. Create profile-specific configuration files:
   ```bash
   touch src/main/resources/application-dev.yml
   touch src/main/resources/application-prod.yml
   ```

### 3.2 Clean Up Main Application Classes

- Keep only one main application class. It's recommended to keep `HardwareCompatibilityApplication.java` as it appears to be the primary entry point.
- Remove `CompatibilityCheckerApplication.java` or refactor it into a regular component if it provides unique functionality.

### 3.3 Configure Profile-Specific Settings

Move environment-specific settings from `application.yml` to the appropriate profile files:

- **application-dev.yml**: Contains development-specific configurations (e.g., local database, debug logging)
- **application-prod.yml**: Contains production-specific configurations (e.g., production database, secure logging)

### 3.4 Organize Test Classes

Create test classes corresponding to main application components:

- Controller tests in `src/test/java/com/hardware/compatibility/controller/`
- Service tests in `src/test/java/com/hardware/compatibility/service/`
- Repository tests in `src/test/java/com/hardware/compatibility/repository/`

### 3.5 Update Build Configuration

Ensure the `pom.xml` file includes all necessary dependencies for testing (JUnit, Spring Test, etc.).

## 4. Naming Conventions

### 4.1 Package Naming

- Use reverse domain name notation: `com.companyname.projectname`
- Example: `com.hardware.compatibility`

### 4.2 Class Naming

- **Main Application**: Ends with `Application.java` (e.g., `HardwareCompatibilityApplication.java`)
- **Controllers**: Ends with `Controller.java` (e.g., `HardwareComponentController.java`)
- **Services**: Ends with `Service.java` (e.g., `HardwareComponentService.java`)
- **Repositories**: Ends with `Repository.java` (e.g., `HardwareComponentRepository.java`)
- **Entities**: Uses singular noun (e.g., `HardwareComponent.java`)
- **Configuration**: Ends with `Config.java` or `Configuration.java` (e.g., `SecurityConfig.java`)

### 4.3 Configuration Files

- Main configuration: `application.yml` (or `.properties`)
- Profile-specific: `application-{profile}.yml` (e.g., `application-dev.yml`)
- Environment variables: `SPRING_APPLICATION_NAME`, `SPRING_DATASOURCE_URL`, etc.

## 5. Directory Purpose and Contents

### 5.1 `src/main/java/`
Contains the main application source code organized into packages.

### 5.2 `src/main/resources/`
Contains application resources:
- `application.yml`: Main configuration file
- `application-dev.yml`: Development profile configuration
- `application-prod.yml`: Production profile configuration
- `static/`: Static resources (CSS, JavaScript, images)
- `templates/`: Template files for server-side rendering (Thymeleaf, Freemarker)

### 5.3 `src/test/java/`
Contains unit and integration test classes.

### 5.4 `src/test/resources/`
Contains test-specific resources (e.g., test configuration, test data files).

### 5.5 `docs/`
Contains project documentation (API docs, user guides, architecture docs).

### 5.6 `logs/`
Contains application log files.

### 5.7 `target/`
Generated by Maven, contains compiled classes, JAR files, and build artifacts.

## 6. Reorganization Implementation

Now we will implement the described changes to restructure the project into a standard Spring Boot directory layout.