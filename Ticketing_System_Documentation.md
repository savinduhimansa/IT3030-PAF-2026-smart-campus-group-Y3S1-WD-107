# Incident Ticketing System: Complete Architecture & Implementation Walkthrough

This document outlines everything we built for your Spring Boot and React incident ticketing system, detailing **what** was built, **why** certain design choices were made, and **how** it was executed across both the backend and frontend.

---

## Part 1: Database Architecture & JPA Entities (Backend)

**What we did:** 
Created the core Java models representing the tables in your MySQL database: `Ticket`, `Comment`, `Attachment`, and an enumeration `TicketStatus`.

**Why we did it:**
Object-Relational Mapping (ORM) tools like Hibernate (which powers Spring Data JPA) need to know how to translate Java objects into MySQL rows. By doing this mapping at the start, we solidify the shape of our data.

**How we did it:**
1. **Annotations:** We used `@Entity` to declare them as database objects and `@Table(name="tickets")` to name the tables cleanly.
2. **One-to-Many Relationships:** A single ticket can have multiple comments and multiple attachments. We used the `@OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)` annotation. This means if you delete a ticket, all associated comments and attachments are automatically deleted from the MySQL database, preventing "zombie" or orphaned data.
3. **Lombok:** To prevent writing tedious boilerplate code (Getters, Setters, Constructors), we annotated classes with Lombok's `@Data`, `@NoArgsConstructor`, and `@AllArgsConstructor`.
4. **Dependencies (`pom.xml`):** Because Lombok wasn't initially configured to inject into your Maven compiler process, we updated your `pom.xml` dependency tree so that `mvn clean compile` could execute successfully without syntax errors.

---

## Part 2: RESTful API Layer (Backend)

**What we did:** 
Generated the Repository interfaces, the Service layer containing business logic, and the HTTP Controller mapping the APIs.

**Why we did it:** 
To separate the application into structural boundaries. Repositories handle database interactions natively, Services handle complex logic and transaction blocks, and Controllers only handle routing HTTP requests to the internet. 

**How we did it:**
1. **Repository Layer:** Created `TicketRepository` and `CommentRepository` extending `JpaRepository`. This gives us free database methods like `.save()`, `.findById()`, and `.findAll()`.
2. **Comment Ownership:** The prompt required us to ensure only the owner could delete a comment. Since the original `Comment` entity lacked a user reference, we injected a new `authorId` column mapping to handle this logical check securely.
3. **Controller specific setup:**
   - `GET /api/tickets`: Fetches all tickets. We wired an optional `@RequestParam TicketStatus status` allowing frontend applications to filter tickets (e.g. `?status=OPEN`).
   - `PATCH /api/tickets/{id}`: Used specifically for minor updates (instead of full updates which use `PUT`). It allows a technician to pass only a status string and/or a resolution note securely.
   - `DELETE /api/tickets/{ticketId}/comments/{commentId}`: Validates deletion requests by passing a mock `@RequestHeader("X-User-Id")`.

---

## Part 3: Local File Upload System (Backend)

**What we did:**
Engineered a `FileStorageService` component allowing users to upload a maximum of 3 attachments directly into the backend server's file system during ticket creation.

**Why we did it:**
To prevent bloating the MySQL database. Saving raw image binaries inside a database slows it down dramatically. It is industry standard to save files on the local disk (or an S3 bucket) and only store the *string path* (the URL) in the database.

**How we did it:**
1. **`FileStorageServiceImpl`:** On boot, this service checks if an `uploads/tickets/` directory exists inside your Java project root. If not, it creates it using `java.nio.file.Files`.
2. **Controller Transformation:** We modified the `POST /api/tickets` endpoint to use `@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)`. It takes two parts: `@RequestPart("ticket")` (the JSON string representation of the ticket) and `@RequestPart("files")` (the array of image binaries).
3. **Validation logic:** Inside the `TicketServiceImpl` save operation, we explicitly calculate `if (files.length > 3)` and halt the creation, checking limits natively on the Java server. Images are generated random unique UUID names (`03a2f9-12f3...png`) to prevent file collisions.

---

## Part 4: Building the React UI (Frontend)

**What we did:**
Built 3 distinct React pages matching modern aesthetics (leveraging Tailwind CSS and `lucide-react` icons) to natively integrate with your custom API.

**Why we did it:**
To provide a smooth visual tool for standard users generating tickets, and for technicians processing those tickets.

**How we did it:**
1. **`TicketDashboard.jsx`:** Maps over the array returned by `axios.get()`. We injected beautiful visual pill tags (Blue for OPEN, Red for HIGH priority) so users can trace issues at a single glance.
2. **`CreateTicketForm.jsx`:** The most structurally complex component. Instead of passing standard JSON through Axios, we created a JS `FormData()` object dynamically appending both the JSON text fields and the exact structural array of our uploaded files. We attached frontend validation logic throwing warnings if a user attempts to attach more than 3 images or non-image assets.
3. **`TicketDetail.jsx`:** Shows the holistic view. For the technician interface, we anchored a "floating" container allowing quick-saves mapped specifically to the `PATCH` backend endpoint. For the user interface, we iterated through all associated comments mapping out a distinct chat-UI timeline.

---

## Part 5: Global Reliability and Error Handling (Backend)

**What we did:**
Wrote highly structured HTTP validation parameters using specialized Data Transfer Objects (DTOs) alongside an enterprise `@ControllerAdvice` exception handler.

**Why we did it:**
If a user submits an incomplete form, or hits an API for a ticket that doesn't exist, Spring natively throws an ugly Internal `500 Server Error` exposing raw Java stack traces. We replaced this with a bulletproof custom exception payload (`ErrorResponse`), safely logging the time, status code, and polite error messages back to the React UI for handling.

**How we did it:**
1. **DTOs (Data Transfer Objects):** We refactored the Backend routing controllers so they do not accept `Ticket` entities directly. Instead, they accept `TicketCreateDto` and `TicketUpdateDto`. 
2. **`@Valid` logic:** Inside the DTOs, we mapped parameters like `@NotBlank(message = "Description cannot be blank")`. In the Controller, attaching the `@Valid` tag commands Spring to instantly block bad requests before they ever reach the logical service layer.
3. **`GlobalExceptionHandler`:** We aggregated a `@ControllerAdvice` class listening for custom throw mechanisms cleanly engineered inside the code, such as:
   - `TicketNotFoundException` (Mapped automatically to Return HTTP 404)
   - `UnauthorizedCommentEditException` (Returns HTTP 403)
   - `MaxUploadSizeExceededException` (Returns HTTP 413 if file weights are bloated)

---

## Part 6: Postman Schemas

**What we did:**
Designed a local `TicketingAPI_Postman_Collection.json` configuration profile containing API schema instructions.

**Why we did it:**
Frontend workflows are heavily dependent on browser UI, making debugging complex. Building a Postman testing map allows you to fire requests and view raw JSON results natively.

**How we did it:**
Configured 4 distinct objects directly pointing heavily at `localhost:8080`, applying dummy structural inputs for the DTO structures mapped dynamically alongside correct multipart header dependencies securely.
