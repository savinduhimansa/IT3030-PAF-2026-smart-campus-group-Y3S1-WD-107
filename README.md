#  Smart Campus Operations Hub

> A full-stack web application for managing university campus operations, built with Spring Boot 3 and React.

##  Project Overview

The **Smart Campus Operations Hub** is a centralized platform designed to streamline the day-to-day operations of a university campus. It enables students, staff, and administrators to manage campus resources, make bookings, raise support tickets, and handle user accounts — all from a single web application.

This project is developed as part of the **IT3030 / PAF 2026** module by Group **Y3S1-WD-107**.



##  Modules

### 1.  User Management
Handles user registration, login, profile management, and role-based access control. Supports OAuth-based authentication. Admins can create, update, and delete user accounts.

### 2.  Resource Management
Manages all campus resources such as lecture halls, labs, sports courts, and equipment. Admins can add, update, and remove resources. Maintains a live catalogue with availability status.

### 3.  Booking Management
Allows registered users to reserve campus resources. Includes conflict detection, approval/rejection workflow, QR code check-in for approved bookings, recurring bookings, and a full audit trail of all status changes.

### 4.  Ticket Management
Allows users to raise incident or maintenance tickets for campus issues. Supports image attachments, priority levels, technician assignment, and comment threads with role-based access.

---

## Tech Stack

 Frontend - React, Axios, React Router 
 Backend - Spring Boot 3, Spring Data JPA, Spring Security 
 Database - MySQL 
 Authentication - JWT / OAuth2 
 Build Tools - Maven (Backend), npm (Frontend)
 Version Control - Git & GitHub 



##  Project Structure

```
smart-campus-operations-hub/
│
├── Backend/                        # Spring Boot application
│   └── src/main/java/com/code_wizards/Backend/
│       ├── booking/                # Booking module
│       │   ├── model/
│       │   ├── repository/
│       │   ├── service/
│       │   └── controller/
│       ├── resource/               # Resource module
│       ├── user/                   # User module
│       └── ticket/                 # Ticket module
│
├── frontend/                       # React application
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
│
└── README.md
```

---

##  Getting Started

### Prerequisites

Make sure you have the following installed:

- [Java 17+](https://adoptium.net/)
- [Node.js 18+](https://nodejs.org/)
- [MySQL 8+](https://www.mysql.com/)
- [Maven 3.8+](https://maven.apache.org/)
- [Git](https://git-scm.com/)

---

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/savinduhimisha/IT3030-PAF-2026-smart-campus-group-Y3S1-WD-107.git

# Navigate to the backend directory
cd Backend

# Install dependencies and run
mvn spring-boot:run
```

The backend will start on **http://localhost:8080**

---

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on **http://localhost:3000**

---

### Database Setup

1. Create a MySQL database:

```sql
CREATE DATABASE smart_campus_db;
```

2. Update the credentials in `Backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_campus_db
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
spring.jpa.hibernate.ddl-auto=update
```






