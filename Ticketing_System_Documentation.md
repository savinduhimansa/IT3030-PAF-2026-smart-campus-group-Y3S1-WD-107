# Incident Ticketing System: Complete Architecture & Implementation Guide

> **Prepared for:** PAF Module Viva Examination  
> **System:** Smart Campus — SpaceLink Platform  
> **Tech Stack:** Spring Boot 3.5 (Java 21) + React 19 (Vite) + MySQL 8 (Aiven Cloud) + Tailwind CSS

---

## Table of Contents

1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Database Architecture & JPA Entities](#2-database-architecture--jpa-entities)
3. [Repository Layer — Spring Data JPA](#3-repository-layer--spring-data-jpa)
4. [Service Layer — Business Logic](#4-service-layer--business-logic)
5. [RESTful API Controller Layer](#5-restful-api-controller-layer)
6. [Data Transfer Objects (DTOs) & Validation](#6-data-transfer-objects-dtos--validation)
7. [Global Exception Handling](#7-global-exception-handling)
8. [File Upload & Static Serving System](#8-file-upload--static-serving-system)
9. [Role-Based Access Control (RBAC) & Data Ownership](#9-role-based-access-control-rbac--data-ownership)
10. [Comment / Discussion System](#10-comment--discussion-system)
11. [Frontend Architecture (React)](#11-frontend-architecture-react)
12. [Authentication & Identity Persistence](#12-authentication--identity-persistence)
13. [API Endpoints Summary](#13-api-endpoints-summary)
14. [Complete File Inventory](#14-complete-file-inventory--all-files-created-for-ticketing-system)
15. [Validation Strategy — Frontend & Backend](#15-validation-strategy--frontend--backend-complete-reference)
16. [Service-Level Timer (SLA) — Innovative Feature](#16-service-level-timer-sla--innovative-feature)
17. [Potential Viva Questions & Answers](#17-potential-viva-questions--answers)

---

## 1. System Overview & Architecture

### What is this system?
An **Incident Ticketing System** within the Smart Campus (SpaceLink) platform that allows campus users to report IT issues (broken projectors, software bugs, network problems) and allows administrators/technicians to manage, respond to, and resolve those tickets.

### Architecture Pattern: Three-Tier + Layered Backend
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│           localhost:5173  │  Tailwind CSS + Lucide Icons      │
├─────────────────────────────────────────────────────────────┤
│                  REST API (HTTP/JSON + Multipart)             │
│       Headers: X-User-Role, X-User-Id for authentication     │
├─────────────────────────────────────────────────────────────┤
│               BACKEND (Spring Boot 3.5 / Java 21)            │
│                      localhost:8090                           │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐      │
│  │Controller│→ │ Service  │→ │ Repository (JPA/Hibernate)│   │
│  └──────────┘  └──────────┘  └────────────────────────┘      │
├─────────────────────────────────────────────────────────────┤
│              DATABASE (MySQL 8 — Aiven Cloud)                │
│  Tables: tickets, comments, attachments, users               │
└─────────────────────────────────────────────────────────────┘
```

### Why this architecture?
- **Separation of Concerns**: Each layer has a single responsibility. Controllers handle HTTP routing, Services handle business logic, Repositories handle data access.
- **Testability**: The service layer can be unit-tested independently of HTTP concerns.
- **Maintainability**: Changes to the database schema don't affect the controller, and vice versa, because DTOs act as a translation boundary.

---

## 2. Database Architecture & JPA Entities

### What we did
Created 4 Java classes that map directly to MySQL tables using Hibernate ORM (Object-Relational Mapping).

### Entity Relationship Diagram
```
┌──────────────────────────┐
│         Ticket           │
├──────────────────────────┤
│ id (PK, AUTO_INCREMENT)  │
│ creator_id (FK → users)  │
│ resource_id              │
│ resource_location        │
│ category                 │
│ description (TEXT)       │
│ priority                 │
│ contact_details          │
│ status (ENUM)            │
│ technician_assignment_id │
│ resolution_notes (TEXT)  │
├──────────────────────────┤
│ 1 ──── * Comment         │
│ 1 ──── * Attachment      │
└──────────────────────────┘

┌──────────────────┐       ┌──────────────────┐
│     Comment      │       │    Attachment     │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ text (TEXT)      │       │ file_name        │
│ author_id        │       │ file_url         │
│ ticket_id (FK)   │       │ ticket_id (FK)   │
└──────────────────┘       └──────────────────┘
```

### Ticket.java — The Core Entity 
**File:** `Backend/src/main/java/com/code_wizards/Backend/entity/Ticket.java`

```java
@Entity
@Table(name = "tickets")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "creator_id")
    private Long creatorId;             // ← Added for data ownership (RBAC)

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)        // ← Stores enum as readable string, not a number
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Attachment> attachments = new ArrayList<>();
}
```

**Why these specific annotations?**

| Annotation | Purpose |
|---|---|
| `@Entity` | Registers this class as a JPA-managed database table |
| `@Table(name = "tickets")` | Explicitly names the MySQL table (avoids case-sensitivity issues) |
| `@Data` (Lombok) | Auto-generates getters, setters, `toString()`, `equals()`, `hashCode()` |
| `@Builder` (Lombok) | Enables the fluent Builder pattern: `Ticket.builder().category("Hardware").build()` |
| `@GeneratedValue(strategy = IDENTITY)` | MySQL's `AUTO_INCREMENT` — the database itself generates the next ID |
| `@Enumerated(EnumType.STRING)` | Stores `"OPEN"` instead of `0` in the database — far more readable/debuggable |
| `cascade = CascadeType.ALL` | When a ticket is saved/deleted, all its comments and attachments are also saved/deleted |
| `orphanRemoval = true` | If you remove a comment from the list, Hibernate will `DELETE` it from the database |
| `@Builder.Default` | Ensures the Builder pattern initialises lists as `new ArrayList<>()` instead of `null` |

### Comment.java — The Discussion Entity
**File:** `Backend/src/main/java/com/code_wizards/Backend/entity/Comment.java`

```java
@Entity @Table(name = "comments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Comment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "text", columnDefinition = "TEXT", nullable = false)
    private String text;

    @Column(name = "author_id", nullable = false)
    private Long authorId;                    // ← Tracks who wrote this comment

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    @ToString.Exclude @JsonIgnore            // ← Prevents infinite recursion during serialisation
    private Ticket ticket;
}
```

**Why `@JsonIgnore` and `@ToString.Exclude`?**  
Without these, when Spring serialises a `Comment` to JSON, it would try to include the entire `Ticket` object, which itself contains a list of `Comment`s — causing an **infinite JSON loop** that crashes the server with a `StackOverflowError`.

### TicketStatus.java — The Status Enum
```java
public enum TicketStatus {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED,
    REJECTED
}
```

**Why an enum instead of a String?**  
Enums provide **compile-time safety**: if someone typos `"OPNE"`, Java won't compile. Using `@Enumerated(EnumType.STRING)` stores the full word `"OPEN"` in the database, making it human-readable when querying MySQL directly.

---

## 3. Repository Layer — Spring Data JPA

**File:** `Backend/src/main/java/com/code_wizards/Backend/repository/TicketRepository.java`

```java
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByStatus(TicketStatus status);          // Admin: filter all by status
    List<Ticket> findByCreatorId(Long creatorId);            // User: get only my tickets
    List<Ticket> findByStatusAndCreatorId(TicketStatus status, Long creatorId); // User: filter my tickets
}
```

### Why is this just an interface with no implementation?
Spring Data JPA uses **Derived Query Methods**. It reads the method name and automatically generates the SQL:
- `findByStatus(...)` → `SELECT * FROM tickets WHERE status = ?`
- `findByCreatorId(...)` → `SELECT * FROM tickets WHERE creator_id = ?`
- `findByStatusAndCreatorId(...)` → `SELECT * FROM tickets WHERE status = ? AND creator_id = ?`

At runtime, Spring creates a proxy object that implements this interface with real JDBC code. We get full database access with **zero SQL written by hand**.

The `JpaRepository<Ticket, Long>` base interface provides free methods: `.save()`, `.findById()`, `.findAll()`, `.deleteById()`, etc.

---

## 4. Service Layer — Business Logic

**Interface:** `TicketService.java` — defines the contract  
**Implementation:** `TicketServiceImpl.java` — contains the logic

### Why an Interface + Implementation?
This follows the **Dependency Inversion Principle (SOLID)**. The Controller depends on the `TicketService` interface, not the concrete class. In tests, you could substitute a mock implementation without touching the controller.

### Key Methods

#### `createTicket(Ticket ticket, MultipartFile[] files)`
```java
@Transactional
public Ticket createTicket(Ticket ticket, MultipartFile[] files) {
    if (files != null && files.length > 3) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot upload more than 3 files.");
    }
    if (ticket.getStatus() == null) {
        ticket.setStatus(TicketStatus.OPEN);   // Default status
    }
    // Save files to disk and link them to the ticket
    List<String> filePaths = fileStorageService.saveFiles(files != null ? files : new MultipartFile[0]);
    for (String filePath : filePaths) {
        Attachment attachment = Attachment.builder()
                .fileName(filePath.substring(filePath.lastIndexOf("/") + 1))
                .fileUrl(filePath)
                .ticket(ticket)
                .build();
        ticket.getAttachments().add(attachment);
    }
    return ticketRepository.save(ticket);       // Cascading save also saves attachments
}
```

**Why `@Transactional`?**  
If saving the ticket succeeds but saving an attachment fails, the `@Transactional` annotation ensures the **entire operation is rolled back** — maintaining data consistency. Without it, you'd end up with orphaned tickets in the database.

#### `getTickets(TicketStatus status, Long creatorId, boolean isAdmin)` — Role-Based Scoping
```java
public List<Ticket> getTickets(TicketStatus status, Long creatorId, boolean isAdmin) {
    if (isAdmin) {
        return status != null ? ticketRepository.findByStatus(status) : ticketRepository.findAll();
    } else {
        return status != null 
            ? ticketRepository.findByStatusAndCreatorId(status, creatorId) 
            : ticketRepository.findByCreatorId(creatorId);
    }
}
```
**Why?** Admins must see ALL tickets across the system. Regular users must see ONLY their own tickets. This decision is made server-side for security — a user can't bypass it from the browser.

#### `addComment(Long ticketId, Long authorId, String text)` — Discussion System
```java
@Transactional
public Comment addComment(Long ticketId, Long authorId, String text) {
    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

    Comment comment = Comment.builder()
            .ticket(ticket)
            .authorId(authorId)
            .text(text)
            .build();

    return commentRepository.save(comment);
}
```

#### `deleteComment(...)` and `updateComment(...)` — Ownership Enforcement
Both methods perform a **three-step validation**:
1. Check comment exists → or throw `404 Not Found`
2. Check comment belongs to the specified ticket → or throw `400 Bad Request`
3. Check the requester is the comment author → or throw `403 Forbidden` (via `UnauthorizedCommentEditException`)

This prevents users from deleting or editing other people's comments.

---

## 5. RESTful API Controller Layer

**File:** `TicketController.java`

### Full Endpoint Map

| Method | URL | Purpose | Auth Headers |
|---|---|---|---|
| `POST` | `/api/tickets` | Create new ticket with file uploads | `X-User-Id` |
| `GET` | `/api/tickets` | List tickets (scoped by role) | `X-User-Role`, `X-User-Id` |
| `PATCH` | `/api/tickets/{id}` | Update status & resolution (Admin) | — |
| `POST` | `/api/tickets/{id}/comments` | Add a comment | `X-User-Id` |
| `PUT` | `/api/tickets/{id}/comments/{cid}` | Edit own comment | `X-User-Id` |
| `DELETE` | `/api/tickets/{id}/comments/{cid}` | Delete own comment | `X-User-Id` |

### Why `@CrossOrigin(origins = "*")`?
The React frontend runs on `localhost:5173` while Spring Boot runs on `localhost:8090`. Browsers block cross-origin requests by default (CORS policy). This annotation tells Spring to include `Access-Control-Allow-Origin: *` in response headers, permitting the frontend to communicate.

### Why PATCH instead of PUT for status updates?
- `PUT` semantically means "replace the entire resource" — you'd need to send ALL ticket fields.
- `PATCH` means "partially update" — you send only the fields you want to change (`status`, `resolutionNotes`).

### How `@RequestPart` enables multipart upload
```java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<Ticket> createTicket(
        @Valid @RequestPart("ticket") TicketCreateDto ticketDto,    // JSON part
        @RequestPart(value = "files", required = false) MultipartFile[] files,  // Binary files
        @RequestHeader("X-User-Id") Long creatorId) {              // Identity header
```
A single HTTP request contains **two different content types**: JSON (the ticket data) and binary (the images). `MULTIPART_FORM_DATA_VALUE` tells Spring to parse both from the same request body.

---

## 6. Data Transfer Objects (DTOs) & Validation

### Why DTOs instead of accepting entities directly?

| Without DTO (unsafe) | With DTO (safe) |
|---|---|
| Client could send `id: 999` to overwrite an existing ticket | DTO has no `id` field — impossible to inject |
| Client could send `status: RESOLVED` to self-resolve | DTO has no `status` field — only admins can change status |
| No validation — empty strings pass through | `@NotBlank` rejects empty fields before they reach the service |

### TicketCreateDto.java
```java
@Data
public class TicketCreateDto {
    @NotBlank(message = "Resource location is required")
    private String resourceLocation;

    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    @NotNull(message = "Category is required")
    private String category;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotNull(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Contact details are required")
    private String contactDetails;
}
```

The `@Valid` annotation on the controller parameter activates Jakarta Bean Validation. If any constraint fails, Spring throws `MethodArgumentNotValidException`, which our GlobalExceptionHandler catches and formats into a clean JSON error.

---

## 7. Global Exception Handling

**File:** `GlobalExceptionHandler.java`

### Why do we need this?
Without it, Spring returns ugly 500 errors with raw Java stack traces — leaking internal class names and database details to the client.

### How it works
The `@ControllerAdvice` annotation registers a class as a global interceptor for all controllers.

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TicketNotFoundException.class)       // HTTP 404
    @ExceptionHandler(UnauthorizedCommentEditException.class) // HTTP 403
    @ExceptionHandler(MaxUploadSizeExceededException.class)   // HTTP 413
    @ExceptionHandler(MethodArgumentNotValidException.class)  // HTTP 400 (validation)
    @ExceptionHandler(Exception.class)                        // HTTP 500 (catch-all fallback)
}
```

Every handler returns a standardised `ErrorResponse`:
```json
{
    "timestamp": "2026-04-18T19:15:00",
    "status": 404,
    "error": "Not Found",
    "message": "Ticket not found with id: 99",
    "path": "/api/tickets/99"
}
```

### Exception Hierarchy

| Exception Class | HTTP Status | When Thrown |
|---|---|---|
| `TicketNotFoundException` | 404 | Ticket ID doesn't exist in DB |
| `UnauthorizedCommentEditException` | 403 | User tries to edit/delete someone else's comment |
| `MaxUploadSizeExceededException` | 413 | File exceeds Spring's upload limit |
| `MethodArgumentNotValidException` | 400 | DTO validation fails (`@NotBlank`, etc.) |
| `ResponseStatusException` | varies | General-purpose (e.g. "only images allowed") |
| `Exception` (fallback) | 500 | Any unexpected error |

---

## 8. File Upload & Static Serving System

### Upload Flow (FileStorageServiceImpl.java)
```
User selects image → React FormData → POST /api/tickets (multipart)
     → TicketController → TicketServiceImpl.createTicket()
          → FileStorageServiceImpl.saveFiles()
               → Validates content type is "image/*"
               → Generates UUID filename (prevents collisions)
               → Copies to disk: uploads/tickets/{uuid}.jpg
               → Returns path string: "uploads/tickets/{uuid}.jpg"
          → Creates Attachment entity with that path
          → Cascading save persists everything to MySQL
```

### Key Security Measures
1. **File type validation**: `file.getContentType().startsWith("image/")` — only images allowed
2. **UUID filenames**: `UUID.randomUUID() + extension` — prevents path traversal attacks and filename collisions
3. **Path traversal check**: `if (fileName.contains(".."))` — blocks `../../etc/passwd` style attacks
4. **Max file count**: `if (files.length > 3)` — limits upload abuse

### Static File Serving (WebConfig.java)
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
```

**Why?** Without this, Spring Boot won't serve files from the `uploads/` directory. This maps the URL `http://localhost:8090/uploads/tickets/abc.jpg` → to the disk file at `uploads/tickets/abc.jpg`.

---

## 9. Role-Based Access Control (RBAC) & Data Ownership

### The `creatorId` System
When a user creates a ticket, their user ID (from the `X-User-Id` header) is stored as `creator_id` in the tickets table. This field is the foundation of data ownership.

### How RBAC works end-to-end

```
Login → localStorage stores { role: "USER", userId: 9 }
  ↓
Frontend sends: GET /api/tickets
  Headers: X-User-Role: USER, X-User-Id: 9
  ↓
TicketController reads headers → passes to service
  ↓
TicketServiceImpl.getTickets(status=null, creatorId=9, isAdmin=false)
  ↓
ticketRepository.findByCreatorId(9)
  ↓
SQL: SELECT * FROM tickets WHERE creator_id = 9
  ↓
Returns ONLY tickets created by user 9
```

For admins:
```
TicketServiceImpl.getTickets(status=null, creatorId=4, isAdmin=true)
  ↓
ticketRepository.findAll()
  ↓
SQL: SELECT * FROM tickets    ← No WHERE clause, returns everything
```

### Frontend-side RBAC
The `TicketDetail.jsx` component conditionally renders the **Technician Panel** (with status changer and resolution notes) only for admins:
```jsx
const isAdmin = role.toUpperCase() === 'ADMIN';

{isAdmin && (
  <div> {/* Technician Panel with status dropdown, etc. */} </div>
)}
```

---

## 10. Comment / Discussion System

### Architecture
Both Users and Admins can add comments on tickets, enabling **two-way communication**. 

### Backend API Flow

**Adding a comment:**
```
POST /api/tickets/5/comments
Header: X-User-Id: 9
Body: { "text": "The projector is still not working" }
  ↓
TicketController.addComment(ticketId=5, authorId=9, commentDto)
  ↓
TicketServiceImpl.addComment(5, 9, "The projector...")
  ↓
commentRepository.save(comment)
  ↓
Response: 201 Created + the saved Comment JSON
```

**Editing a comment (ownership enforced):**
```
PUT /api/tickets/5/comments/12
Header: X-User-Id: 9
Body: { "text": "Updated message" }
  ↓
Checks: comment.authorId == 9? ✓ → Updates
         comment.authorId ≠ 9? ✗ → 403 Forbidden
```

### Frontend Comment UI (`TicketDetail.jsx`)
- Shows `User #N` labels next to each comment, with a `"You"` badge for the current user's messages
- **Edit/Delete buttons** only appear on hover, and only for comments where `comment.authorId === userId`
- Uses `axios.post()` for new comments and `axios.put()` for edits
- Optimistic UI: updates the local state immediately after a successful API call

---

## 11. Frontend Architecture (React)

### Component Map

| Component | Route | Role | Purpose |
|---|---|---|---|
| `TicketDashboard.jsx` | `/tickets` | Both | Lists tickets (scoped per role) |
| `CreateTicketForm.jsx` | `/tickets/new` | Both | Form to submit new incident |
| `TicketDetail.jsx` | `/tickets/:id` | Both | View ticket details, comments, attachments |
| `Login.jsx` | `/login` | Both | Authenticates and stores identity |
| `App.jsx` | — | — | Routing + sidebar navigation |

### How `CreateTicketForm.jsx` handles multipart upload
```jsx
const submitData = new FormData();
// Wrap JSON as a Blob with explicit content type (critical for Spring's @RequestPart)
submitData.append('ticket', new Blob([JSON.stringify(formData)], { type: 'application/json' }));

files.forEach(file => {
    submitData.append('files', file);     // Binary image files
});

await axios.post(API_URL, submitData, {
    headers: {
        'Content-Type': 'multipart/form-data',
        'X-User-Id': localStorage.getItem('userId')
    }
});
```

**Why `new Blob([JSON.stringify(...)], { type: 'application/json' })`?**  
Spring's `@RequestPart("ticket")` expects the JSON section of the multipart request to have the correct `Content-Type: application/json` header. Without the Blob wrapper, the browser sends it as `text/plain`, and Spring fails to deserialise it to `TicketCreateDto`.

### How `TicketDashboard.jsx` sends auth headers
```jsx
const role = localStorage.getItem('role') || 'USER';
const userId = localStorage.getItem('userId') || '';
const response = await axios.get(url, {
    headers: { 'X-User-Role': role, 'X-User-Id': userId }
});
```
Every API call includes the identity headers so the backend knows WHO is making the request.

---

## 12. Authentication & Identity Persistence

### Login Flow (`Login.jsx`)
```
User submits email + password
  ↓
POST /api/auth/login  { email, password }
  ↓
Backend verifies credentials → returns User object with id, role, email
  ↓
Frontend stores in localStorage:
  - localStorage.setItem('role', 'USER')
  - localStorage.setItem('userId', '9')
  ↓
All subsequent API calls include:
  X-User-Role: USER
  X-User-Id: 9
```

### Why localStorage instead of cookies?
- Simpler to implement for a learning project
- Headers are explicitly controlled by the application code
- No CSRF vulnerability concerns (cookies are automatically sent by the browser)

### Sidebar Navigation (App.jsx)
The sidebar dynamically shows/hides menu items based on role:
```jsx
const userRole = localStorage.getItem('role');
const visibleNavItems = navItems.filter(item => !item.adminOnly || userRole === 'ADMIN');
```
Items marked `adminOnly: true` (Admin Panel, Bookings) are hidden from regular users.

---

## 13. API Endpoints Summary

### Ticket Endpoints
```
POST   /api/tickets                    → Create ticket (multipart)
GET    /api/tickets                    → List tickets (role-scoped)
GET    /api/tickets?status=OPEN        → Filter by status
PATCH  /api/tickets/{id}               → Update status + resolution
```

### Comment Endpoints
```
POST   /api/tickets/{id}/comments      → Add comment
PUT    /api/tickets/{id}/comments/{cid} → Edit own comment
DELETE /api/tickets/{id}/comments/{cid} → Delete own comment
```

### Auth Endpoints (pre-existing)
```
POST   /api/auth/register              → Register new user
POST   /api/auth/login                 → Authenticate
GET    /api/auth/{id}                   → Get user by ID
```

### Static Files
```
GET    /uploads/tickets/{filename}      → Serve uploaded image
```
---

## 14. Complete File Inventory — All Files Created for Ticketing System

Below is every single file that was created or modified as part of the Incident Ticketing System feature. Files are organized by package/directory. Files marked with ⭐ are **new files created specifically for the ticketing feature**. Files marked with ✏️ were **existing files that were modified**.

---

### 14.1 Backend Files

**Base path:** `Backend/src/main/java/com/code_wizards/Backend/`

#### 📁 entity/ — JPA Database Entities
| # | File | Type | Purpose |
|---|---|---|---|
| 1 | ⭐ `Ticket.java` | Entity | Core ticket table — stores category, description, priority, status, creatorId, and links to comments + attachments |
| 2 | ⭐ `Comment.java` | Entity | Comment table — stores text, authorId, and FK reference to parent ticket |
| 3 | ⭐ `Attachment.java` | Entity | Attachment table — stores fileName, fileUrl, and FK reference to parent ticket |
| 4 | ⭐ `TicketStatus.java` | Enum | Defines the 5 valid ticket states: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED` |

#### 📁 repository/ — Spring Data JPA Repositories
| # | File | Type | Purpose |
|---|---|---|---|
| 5 | ⭐ `TicketRepository.java` | Interface | Database access for tickets — includes `findByStatus()`, `findByCreatorId()`, `findByStatusAndCreatorId()` |
| 6 | ⭐ `CommentRepository.java` | Interface | Database access for comments — extends `JpaRepository<Comment, Long>` |

#### 📁 service/ — Service Interfaces
| # | File | Type | Purpose |
|---|---|---|---|
| 7 | ⭐ `TicketService.java` | Interface | Defines the contract: `createTicket()`, `getTickets()`, `addComment()`, `updateTicketStatusAndResolution()`, `deleteComment()`, `updateComment()` |
| 8 | ⭐ `FileStorageService.java` | Interface | Defines the file storage contract: `saveFiles(MultipartFile[])` |

#### 📁 service/impl/ — Service Implementations
| # | File | Type | Purpose |
|---|---|---|---|
| 9 | ⭐ `TicketServiceImpl.java` | Class | All business logic — role-based ticket retrieval, file upload orchestration, comment CRUD with ownership enforcement, `@Transactional` operations |
| 10 | ⭐ `FileStorageServiceImpl.java` | Class | Handles physical file storage — creates `uploads/tickets/` directory, validates image types, generates UUID filenames, copies files to disk |

#### 📁 controller/ — REST API Controllers
| # | File | Type | Purpose |
|---|---|---|---|
| 11 | ⭐ `TicketController.java` | Class | All 6 ticket endpoints: `POST` create, `GET` list, `PATCH` update status, `POST` add comment, `PUT` edit comment, `DELETE` delete comment |

#### 📁 dto/ — Data Transfer Objects
| # | File | Type | Purpose |
|---|---|---|---|
| 12 | ⭐ `TicketCreateDto.java` | Class | Input validation for ticket creation — `@NotBlank` on description, resourceLocation, contactDetails; `@NotNull` on category, priority |
| 13 | ⭐ `TicketUpdateDto.java` | Class | Input for PATCH status update — contains `status` (TicketStatus enum) and `resolutionNotes` (String) |
| 14 | ⭐ `CommentUpdateDto.java` | Class | Input for adding/editing comments — `@NotBlank` on `text` |
| 15 | ⭐ `ErrorResponse.java` | Class | Standardised error JSON shape returned by GlobalExceptionHandler — `timestamp`, `status`, `error`, `message`, `path` |

#### 📁 exception/ — Custom Exceptions
| # | File | Type | Purpose |
|---|---|---|---|
| 16 | ⭐ `TicketNotFoundException.java` | Class | Thrown when `findById()` returns empty → maps to HTTP 404 |
| 17 | ⭐ `UnauthorizedCommentEditException.java` | Class | Thrown when user tries to edit/delete another user's comment → maps to HTTP 403 |
| 18 | ⭐ `GlobalExceptionHandler.java` | Class | `@ControllerAdvice` — centralized handler for all 8 exception types, returns consistent `ErrorResponse` JSON |

#### 📁 config/ — Spring Configuration
| # | File | Type | Purpose |
|---|---|---|---|
| 19 | ⭐ `WebConfig.java` | Class | Maps `/uploads/**` URL pattern to the physical `uploads/` directory so uploaded images can be served as static files |

#### 📄 Resources
| # | File | Type | Purpose |
|---|---|---|---|
| 20 | ✏️ `application.properties` | Config | Added `server.port=8090`, MySQL Aiven connection string, JPA `ddl-auto=update` for auto-migration, env variable fallbacks for secrets |

#### 📄 Build Configuration
| # | File | Type | Purpose |
|---|---|---|---|
| 21 | ✏️ `pom.xml` | Config | Added Lombok annotation processor to Maven compiler plugin, ensuring `@Data`, `@Builder` etc. work during `mvn compile` |

---

### 14.2 Frontend Files

**Base path:** `Frontend/src/`

#### 📁 pages/ — Full Page Components
| # | File | Type | Purpose |
|---|---|---|---|
| 22 | ⭐ `TicketDashboard.jsx` | Page | Lists all tickets in a table with status badges, filter dropdown, search bar. Sends `X-User-Role` and `X-User-Id` headers for role-scoped retrieval |
| 23 | ⭐ `TicketDetail.jsx` | Page | Full ticket view — shows description, attachments (as clickable image grid), comments section with add/edit/delete. Admin-only Technician Panel for status updates |
| 24 | ✏️ `Login.jsx` | Page | Modified to store `userId` and `role` in `localStorage` after successful authentication, enabling identity persistence across the app |

#### 📁 components/ — Reusable UI Components
| # | File | Type | Purpose |
|---|---|---|---|
| 25 | ⭐ `CreateTicketForm.jsx` | Component | Ticket submission form — category/priority dropdowns, text inputs, file upload zone (max 3 images with preview & removal), multipart `FormData` submission |

#### 📄 Root Files
| # | File | Type | Purpose |
|---|---|---|---|
| 26 | ✏️ `App.jsx` | Router | Added routes: `/tickets` → TicketDashboard, `/tickets/new` → CreateTicketForm, `/tickets/:id` → TicketDetail. Added "Tickets" to sidebar nav items |

---

### 14.3 Other Project Files

| # | File | Type | Purpose |
|---|---|---|---|
| 27 | ⭐ `TicketingAPI_Postman_Collection.json` | JSON | Postman collection with 4 pre-configured API requests for testing: Create Ticket, Get All Tickets, Update Status, Delete Comment |
| 28 | ⭐ `Ticketing_System_Documentation.md` | Docs | This comprehensive documentation file |

---

### 14.4 File Structure Tree (Visual)

```
Backend/src/main/java/com/code_wizards/Backend/
├── config/
│   └── ⭐ WebConfig.java                    (#19)
├── controller/
│   └── ⭐ TicketController.java             (#11)
├── dto/
│   ├── ⭐ TicketCreateDto.java              (#12)
│   ├── ⭐ TicketUpdateDto.java              (#13)
│   ├── ⭐ CommentUpdateDto.java             (#14)
│   └── ⭐ ErrorResponse.java                (#15)
├── entity/
│   ├── ⭐ Ticket.java                       (#1)
│   ├── ⭐ Comment.java                      (#2)
│   ├── ⭐ Attachment.java                   (#3)
│   └── ⭐ TicketStatus.java                 (#4)
├── exception/
│   ├── ⭐ GlobalExceptionHandler.java       (#18)
│   ├── ⭐ TicketNotFoundException.java       (#16)
│   └── ⭐ UnauthorizedCommentEditException.java (#17)
├── repository/
│   ├── ⭐ TicketRepository.java             (#5)
│   └── ⭐ CommentRepository.java            (#6)
└── service/
    ├── ⭐ TicketService.java                 (#7)
    ├── ⭐ FileStorageService.java            (#8)
    └── impl/
        ├── ⭐ TicketServiceImpl.java         (#9)
        └── ⭐ FileStorageServiceImpl.java    (#10)

Frontend/src/
├── pages/
│   ├── ⭐ TicketDashboard.jsx               (#22)
│   ├── ⭐ TicketDetail.jsx                  (#23)
│   └── ✏️ Login.jsx                         (#24)
├── components/
│   └── ⭐ CreateTicketForm.jsx              (#25)
└── ✏️ App.jsx                               (#26)
```

**Total files: 28** (23 new ⭐ + 5 modified ✏️)

---

## 15. Validation Strategy — Frontend & Backend (Complete Reference)

We implemented a **dual-layer validation strategy**: the frontend catches obvious user errors immediately (better UX), while the backend re-validates everything independently (security — a hacker could bypass the UI).

```
User fills form → [FRONTEND VALIDATION] → Blocks obvious errors (empty fields, wrong file types)
                          ↓ (passes)
              Axios sends HTTP request
                          ↓
Backend receives → [BACKEND VALIDATION Layer 1: DTO @Valid] → Rejects missing/blank fields (400)
                          ↓ (passes)
              → [BACKEND VALIDATION Layer 2: Service Logic] → Rejects business rule violations (400/403/404)
                          ↓ (passes)
              → [BACKEND VALIDATION Layer 3: Database Constraints] → Rejects null columns (500 → caught by GlobalExceptionHandler)
```

---

### 15.1 Backend Validations

#### 15.1.1 DTO-Level Validation (Jakarta Bean Validation)

DTOs use annotations from `jakarta.validation.constraints` to declaratively define rules. The `@Valid` annotation on the controller parameter triggers automatic validation **before** any business logic runs.

**TicketCreateDto.java** — Validates ticket creation input:
```java
@Data
public class TicketCreateDto {
    @NotBlank(message = "Resource location is required")    // Rejects null, "", and "   "
    private String resourceLocation;

    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    @NotNull(message = "Category is required")              // Rejects null only (allows "")
    private String category;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotNull(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Contact details are required")
    private String contactDetails;
}
```

**CommentUpdateDto.java** — Validates comment text:
```java
@Data
public class CommentUpdateDto {
    @NotBlank(message = "Comment text cannot be blank")     // Prevents empty comments
    private String text;
}
```

**TicketUpdateDto.java** — For admin status updates (intentionally relaxed):
```java
@Data
public class TicketUpdateDto {
    private TicketStatus status;          // No @NotNull — admin can update only resolution notes
    private String resolutionNotes;       // No @NotBlank — field is optional
}
```

**How `@NotBlank` vs `@NotNull` differ:**

| Annotation | Rejects `null`? | Rejects `""`? | Rejects `"   "`? |
|---|---|---|---|
| `@NotNull` | ✅ Yes | ❌ No | ❌ No |
| `@NotBlank` | ✅ Yes | ✅ Yes | ✅ Yes |

**Why this matters:** We use `@NotNull` on `category` and `priority` because they come from dropdown `<select>` elements which always have a value. We use `@NotBlank` on free-text fields like `description` to prevent users from submitting spaces-only content.

**What happens when validation fails:**
```
POST /api/tickets  with body: { "description": "", "category": null }
  ↓
Spring triggers MethodArgumentNotValidException
  ↓
GlobalExceptionHandler.handleValidationExceptions() catches it
  ↓
Extracts each field error message and joins them into a comma-separated string
  ↓
Returns:
{
    "timestamp": "2026-04-18T19:30:00",
    "status": 400,
    "error": "Validation Failed",
    "message": "description: Description cannot be blank, category: Category is required",
    "path": "/api/tickets"
}
```

The relevant handler code:
```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, ...) {
    String errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(err -> err.getField() + ": " + err.getDefaultMessage())
            .collect(Collectors.joining(", "));    // Joins all errors with ", "

    ErrorResponse errorDetails = ErrorResponse.builder()
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Validation Failed")
            .message(errors)                       // e.g. "description: Description cannot be blank"
            .build();
    return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
}
```

---

#### 15.1.2 Service-Layer Validation (Business Logic)

These validations enforce rules that annotations alone cannot express:

**File Upload Validations (TicketServiceImpl + FileStorageServiceImpl):**

| Rule | Code | HTTP Status | Error Message |
|---|---|---|---|
| Max 3 files per ticket | `if (files.length > 3)` | 400 | "Cannot upload more than 3 files per ticket." |
| Only image files allowed | `if (!file.getContentType().startsWith("image/"))` | 400 | "Only image files are allowed." |
| No path traversal attacks | `if (fileName.contains(".."))` | 400 | "Filename contains invalid path sequence" |
| Default status on creation | `if (ticket.getStatus() == null) → setStatus(OPEN)` | — | Silently defaults (not an error) |

```java
// In TicketServiceImpl.createTicket():
if (files != null && files.length > 3) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot upload more than 3 files per ticket.");
}

// In FileStorageServiceImpl.saveFiles():
if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed.");
}
```

**Comment Ownership Validations (TicketServiceImpl):**

Both `deleteComment()` and `updateComment()` perform identical 3-step checks:

| Step | Check | If Fails | HTTP Status |
|---|---|---|---|
| 1 | Does the comment exist? | `commentRepository.findById()` → `orElseThrow` | 404 Not Found |
| 2 | Does the comment belong to this ticket? | `comment.getTicket().getId().equals(ticketId)` | 400 Bad Request |
| 3 | Is the requester the original author? | `comment.getAuthorId().equals(requesterId)` | 403 Forbidden |

```java
// Step 1: Existence check
Comment comment = commentRepository.findById(commentId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

// Step 2: Ticket-association check (prevents cross-ticket manipulation)
if (!comment.getTicket().getId().equals(ticketId)) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment does not belong to the specified ticket.");
}

// Step 3: Ownership check
if (!comment.getAuthorId().equals(requesterId)) {
    throw new UnauthorizedCommentEditException("User does not have permission to edit this comment.");
}
```

**Why Step 2 exists:** Without it, a malicious user could craft a request like `DELETE /api/tickets/1/comments/99` where comment 99 actually belongs to ticket 50. This cross-ticket validation prevents that.

**Ticket Existence Validation:**

| Operation | Checks | Exception |
|---|---|---|
| `updateTicketStatusAndResolution()` | `findById(id).orElseThrow(...)` | `TicketNotFoundException` → 404 |
| `addComment()` | `findById(ticketId).orElseThrow(...)` | `TicketNotFoundException` → 404 |

---

#### 15.1.3 Database-Level Validation (JPA Constraints)

Even if all Java-level checks pass, the database itself enforces constraints as a final safety net:

| Entity | Column | Constraint | What It Prevents |
|---|---|---|---|
| `Ticket` | `description` | `nullable = false` | NULL descriptions in the database |
| `Ticket` | `category` | `nullable = false` | NULL categories |
| `Ticket` | `priority` | `nullable = false` | NULL priorities |
| `Ticket` | `status` | `nullable = false` | NULL statuses |
| `Ticket` | `resource_location` | `nullable = false` | NULL locations |
| `Ticket` | `resource_id` | `nullable = false` | NULL resource IDs |
| `Ticket` | `contact_details` | `nullable = false` | NULL contact info |
| `Comment` | `text` | `nullable = false` | NULL comment text |
| `Comment` | `author_id` | `nullable = false` | Orphaned (anonymous) comments |
| `Comment` | `ticket_id` | `nullable = false` | Comments not linked to any ticket |
| `Attachment` | `file_name` | `nullable = false` | Unnamed attachments |
| `Attachment` | `file_url` | `nullable = false` | Attachments without file paths |
| `Attachment` | `ticket_id` | `nullable = false` | Orphaned attachments |

If any of these are violated, MySQL throws a `ConstraintViolationException` which the `GlobalExceptionHandler`'s catch-all `Exception` handler maps to HTTP 500.

---

#### 15.1.4 Global Exception Handler — The Safety Net

**File:** `GlobalExceptionHandler.java` — catches ALL unhandled exceptions across every controller.

**Complete handler mapping:**

| `@ExceptionHandler` | Exception Type | HTTP Status | When Triggered |
|---|---|---|---|
| `handleValidationExceptions` | `MethodArgumentNotValidException` | 400 | `@Valid` DTO field fails (`@NotBlank`, `@NotNull`) |
| `handleIllegalStateException` | `IllegalStateException` | 400 | Invalid state transitions |
| `handleIllegalArgumentException` | `IllegalArgumentException` | 400 | Bad method arguments |
| `handleTicketNotFoundException` | `TicketNotFoundException` | 404 | `findById()` returns empty Optional |
| `handleUnauthorizedCommentEditException` | `UnauthorizedCommentEditException` | 403 | User tries to edit/delete another user's comment |
| `handleMaxUploadSizeExceededException` | `MaxUploadSizeExceededException` | 413 | File exceeds Spring's `spring.servlet.multipart.max-file-size` |
| `handleResponseStatusException` | `ResponseStatusException` | varies | General-purpose (e.g. "Only images allowed", "Max 3 files") |
| `handleGlobalException` | `Exception` (catch-all) | 500 | Any unexpected/unhandled error |

**Every single handler** returns the same `ErrorResponse` JSON shape:
```java
@Data @Builder
public class ErrorResponse {
    private LocalDateTime timestamp;    // When the error occurred
    private int status;                 // HTTP status code (400, 403, 404, 500, etc.)
    private String error;               // Human-readable error name
    private String message;             // Specific error details
    private String path;                // The URL that was requested
}
```

---

### 15.2 Frontend Validations

#### 15.2.1 CreateTicketForm.jsx — Ticket Creation Validations

**HTML5 `required` attribute validation:**
```jsx
<select required name="category" ...>        {/* Browser blocks submit if empty */}
<input required type="text" name="resourceId" ...>
<input required type="text" name="resourceLocation" ...>
<input required type="text" name="contactDetails" ...>
<textarea required name="description" ...>
```
The `required` attribute triggers the browser's native validation popup ("Please fill out this field") without any JavaScript needed.

**File type validation (images only):**
```jsx
const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Check every selected file is an image
    const images = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    if (images.length !== selectedFiles.length) {
        setError('Only image files are allowed.');     // Shows error banner
        return;                                         // Blocks the upload
    }
    // ...
};
```
Also enforced via HTML: `<input type="file" accept="image/*" ...>` — the file picker dialog only shows image files.

**Max 3 files validation:**
```jsx
if (files.length + images.length > 3) {
    setError('You can only attach a maximum of 3 images.');
    return;                                             // Blocks adding more
}

// Also: disable the file input when 3 are already selected
<input ... disabled={files.length >= 3} />
```

**File removal (individual):**
```jsx
const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));  // Removes by array index
};
```
Each attached file shows an ✕ button to remove it before submission.

**Submission error handling:**
```jsx
try {
    await axios.post(API_URL, submitData, { headers: { ... } });
    navigate('/tickets');                    // Success → redirect to dashboard
} catch (err) {
    setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
    // Displays the backend's error message (from GlobalExceptionHandler) in the error banner
}
```

---

#### 15.2.2 TicketDetail.jsx — Comment & Status Update Validations

**Empty comment prevention:**
```jsx
<button 
    onClick={handleAddComment} 
    disabled={!newComment.trim()}     // Button is DISABLED when comment is empty/whitespace
    className="... disabled:opacity-50"
>
    Post Comment
</button>
```
The `.trim()` ensures whitespace-only comments are treated as empty.

**Delete confirmation dialog:**
```jsx
const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;  // Cancel = abort
    // ... proceed with deletion
};
```

**Ownership-based UI restriction (comments):**
```jsx
{comment.authorId === userId && editingCommentId !== comment.id && (
    <div className="... opacity-0 group-hover:opacity-100">   {/* Only visible on hover */}
        <button onClick={() => startEdit(comment)}>Edit</button>
        <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
    </div>
)}
```
Edit/Delete buttons **only render** when `comment.authorId === userId` — users physically cannot see controls for other people's comments.

**Role-based UI restriction (admin panel):**
```jsx
const isAdmin = role.toUpperCase() === 'ADMIN';

{isAdmin && (
    <div>  {/* Entire Technician Panel — status dropdown, resolution notes, save button */}  </div>
)}
```
Regular users cannot even see the status change dropdown or resolution notes editor.

**Backend error feedback:**
```jsx
// On comment operations:
catch (error) {
    alert("Failed to delete comment. You might not be the owner.");
    alert("Failed to edit comment. You might not be the owner.");
    alert("Failed to post comment.");
}

// On status update:
catch (error) {
    alert('Failed to update ticket. Check console.');
}
```

---

#### 15.2.3 TicketDashboard.jsx — List View Validations

**Auth header injection on every request:**
```jsx
const role = localStorage.getItem('role') || 'USER';       // Defaults to USER if missing
const userId = localStorage.getItem('userId') || '';
const response = await axios.get(url, {
    headers: { 'X-User-Role': role, 'X-User-Id': userId }
});
```
Even if `localStorage` is cleared, the fallback ensures the backend receives `role: USER` (most restrictive scope) rather than crashing.

**Loading state handling:**
```jsx
{loading ? (
    <tr><td colSpan="6">Loading tickets...</td></tr>
) : tickets.length === 0 ? (
    <tr><td colSpan="6">No tickets found.</td></tr>
) : (
    tickets.map(ticket => ( ... ))         // Normal ticket rows
)}
```

---

#### 15.2.4 Login.jsx — Authentication Validations

**HTML5 form validation:**
```jsx
<input type="email" ... required />       {/* Browser validates email format */}
<input type="password" ... required />     {/* Browser blocks empty submission */}
```

**Loading state prevents double-submit:**
```jsx
<button type="submit" disabled={isLoading} ...>
    {isLoading ? 'Signing in...' : 'Sign In'}
</button>

// Inputs are also disabled during loading:
<input ... disabled={isLoading} className="... disabled:opacity-50" />
```

**Server error display:**
```jsx
catch (error) {
    setErrorMsg("Login failed: " + (error.response?.data?.message || "Invalid email or password."));
    setIsLoading(false);     // Re-enable the form so user can retry
}
```

---

### 15.3 Validation Summary — Quick Reference

| What's Being Validated | Frontend Check | Backend Check | HTTP Status |
|---|---|---|---|
| Empty ticket description | `required` HTML attribute | `@NotBlank` on DTO | 400 |
| Empty category | `required` on `<select>` | `@NotNull` on DTO | 400 |
| Empty resource location | `required` on `<input>` | `@NotBlank` on DTO | 400 |
| Empty contact details | `required` on `<input>` | `@NotBlank` on DTO | 400 |
| Empty comment text | `disabled={!newComment.trim()}` | `@NotBlank` on `CommentUpdateDto` | 400 |
| Non-image file upload | `accept="image/*"` + JS type check | `file.getContentType().startsWith("image/")` | 400 |
| More than 3 files | `disabled={files.length >= 3}` + JS check | `if (files.length > 3)` in service | 400 |
| Path traversal in filename | — | `if (fileName.contains(".."))` | 400 |
| File too large | — | `MaxUploadSizeExceededException` | 413 |
| Ticket not found | — | `.findById().orElseThrow(TicketNotFoundException)` | 404 |
| Comment not found | — | `.findById().orElseThrow(ResponseStatusException)` | 404 |
| Edit/delete other's comment | UI hides buttons if not owner | `authorId.equals(requesterId)` | 403 |
| Comment on wrong ticket | — | `comment.getTicket().getId().equals(ticketId)` | 400 |
| User sees other's tickets | — | `findByCreatorId(userId)` filters results | — |
| User sees admin panel | `{isAdmin && (...)}` hides UI | Admin-only via `@RequestHeader` role check | — |
| Invalid email format | `type="email"` HTML validation | — | — |
| Double form submission | `disabled={isLoading}` | `@Transactional` prevents partial saves | — |
| Delete without confirmation | `window.confirm()` dialog | — | — |

---

## 16. Service-Level Timer (SLA) — Innovative Feature

### What is SLA in IT Service Management?
Service-Level Agreements (SLAs) define measurable performance targets for IT support. The two most critical metrics are:
- **Time-to-First-Response**: How quickly a technician acknowledges a ticket
- **Time-to-Resolution**: How long from creation until the issue is fully resolved

Tracking these metrics helps management identify bottlenecks, hold teams accountable, and improve overall service quality.

### Why we built this
Most basic ticketing systems only track status. By adding automated SLA timers, we demonstrate understanding of **real-world ITIL (IT Infrastructure Library) practices** — the industry standard framework for IT service management used by companies like Google, Microsoft, and Amazon.

---

### 16.1 Backend Implementation

#### 16.1.1 New Database Columns (Ticket.java)

Three `LocalDateTime` columns were added to the `Ticket` entity:

```java
// ===== SLA TIMER FIELDS =====

@Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;

@Column(name = "first_response_at")
private LocalDateTime firstResponseAt;

@Column(name = "resolved_at")
private LocalDateTime resolvedAt;

@PrePersist
protected void onCreate() {
    this.createdAt = LocalDateTime.now();    // Auto-set on INSERT, never updated
}
```

| Column | When Set | How Set | Nullable |
|---|---|---|---|
| `created_at` | When ticket is first saved | `@PrePersist` JPA lifecycle callback | No (`nullable = false`) |
| `first_response_at` | When the first comment is posted | Service layer logic in `addComment()` | Yes (null = no response yet) |
| `resolved_at` | When status changes to `RESOLVED` | Service layer logic in `updateTicketStatusAndResolution()` | Yes (null = not resolved) |

**Why `@PrePersist`?**  
This JPA lifecycle callback runs automatically before the `INSERT` SQL is executed — guaranteeing `created_at` is always set, even if the developer forgets. Combined with `updatable = false`, the column is immutable after creation.

---

#### 16.1.2 Auto-Capture in Service Layer (TicketServiceImpl.java)

**Time-to-First-Response** — captured in `addComment()`:
```java
@Transactional
public Comment addComment(Long ticketId, Long authorId, String text) {
    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new TicketNotFoundException(...));

    // SLA: Capture time-to-first-response on the FIRST comment ever posted
    if (ticket.getFirstResponseAt() == null) {
        ticket.setFirstResponseAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }
    // ... build and save comment
}
```

**Why check `== null`?** Only the FIRST comment triggers the timestamp. Subsequent comments don't overwrite it. This accurately measures how long the user waited for the initial acknowledgment.

**Time-to-Resolution** — captured in `updateTicketStatusAndResolution()`:
```java
if (status != null) {
    ticket.setStatus(status);

    // SLA: Capture time-to-resolution when status changes to RESOLVED
    if (status == TicketStatus.RESOLVED && ticket.getResolvedAt() == null) {
        ticket.setResolvedAt(LocalDateTime.now());
    }

    // SLA: Clear resolvedAt if ticket is reopened
    if (status != TicketStatus.RESOLVED && status != TicketStatus.CLOSED) {
        ticket.setResolvedAt(null);
    }
}
```

**Why clear `resolvedAt` on reopen?** If a ticket is marked RESOLVED but the user reports the issue persists, the admin changes it back to IN_PROGRESS. The timer resets because the original resolution was invalid — it would be misleading to count that time.

---

### 16.2 Frontend Implementation

#### 16.2.1 Elapsed Time Helper Function

Both `TicketDashboard.jsx` and `TicketDetail.jsx` share this utility:
```javascript
const getElapsedTime = (startStr, endStr = null) => {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();  // If no end, use now (live timer)
  const diffMs = end - start;

  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (days > 0) return `${days}d ${hrs % 24}h`;
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
};
```
**Why?** Calculates human-readable duration strings from raw timestamps. If `endStr` is null, it measures against the current time — creating a **live timer**.

#### 16.2.2 Dashboard SLA Column (TicketDashboard.jsx)

A new "SLA Timer" column in the ticket table shows at-a-glance status:

| Condition | Color | Icon | Example |
|---|---|---|---|
| Resolved | 🟢 Green | ✓ Checkmark | `✓ 2d 4h` |
| First response received, still open | 🟡 Amber | Timer | `⏱ 1d 3h` |
| No response, waiting < 4 hours | 🔵 Blue | Pulsing clock | `🕐 45m` |
| No response, waiting 4–24 hours | 🟠 Orange | Pulsing clock | `🕐 8h 30m` |
| No response, waiting > 24 hours | 🔴 Red | Pulsing clock | `🕐 2d 1h` |

#### 16.2.3 Detail Page SLA Panel (TicketDetail.jsx)

A dark-themed panel with three metric cards:

```
┌──────────────────────────────────────────────────────┐
│  ⏱ SERVICE LEVEL TIMER (SLA)                        │
│                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ TICKET   │  │ FIRST        │  │ RESOLUTION   │   │
│  │ AGE      │  │ RESPONSE     │  │ TIME         │   │
│  │          │  │              │  │              │   │
│  │ 2d 4h 30m│  │ ✓ 1h 15m    │  │ ✓ 2d 4h 30m │   │
│  │          │  │              │  │              │   │
│  │ Created: │  │ Responded:   │  │ Resolved:    │   │
│  │ Apr 17,  │  │ Apr 17,      │  │ Apr 19,      │   │
│  │ 2:30 PM  │  │ 3:45 PM      │  │ 6:30 PM      │   │
│  └──────────┘  └──────────────┘  └──────────────┘   │
└──────────────────────────────────────────────────────┘
```

- **Green ✓** = milestone completed (with exact datetime)
- **Orange 🕐 (pulsing)** = awaiting first response
- **Gray ⏱** = not yet resolved

**Live Timer:** A `setInterval` updates `now` every 60 seconds, causing the elapsed time displays to re-render automatically:
```javascript
useEffect(() => {
  const interval = setInterval(() => setNow(new Date()), 60000);
  return () => clearInterval(interval);
}, []);
```

---

### 16.3 End-to-End SLA Flow

```
1. User creates ticket at 2:00 PM
   → @PrePersist sets created_at = 2026-04-19T14:00:00
   → first_response_at = NULL, resolved_at = NULL
   → Dashboard shows: 🔵 "0m" (live timer starts)

2. Admin posts first comment at 3:15 PM
   → addComment() detects firstResponseAt == null
   → Sets first_response_at = 2026-04-19T15:15:00
   → Dashboard shows: 🟡 "1h 15m" (responded, still open)
   → Detail SLA panel: First Response = ✓ 1h 15m

3. Admin changes status to RESOLVED at 6:30 PM next day
   → updateTicketStatusAndResolution() sets resolved_at = 2026-04-20T18:30:00
   → Dashboard shows: 🟢 "1d 4h 30m" (total resolution time)
   → Detail SLA panel: Resolution Time = ✓ 1d 4h 30m

4. User reopens (status → IN_PROGRESS)
   → resolved_at is cleared back to NULL
   → Timer restarts from creation time
```

---

## 17. Potential Viva Questions & Answers

### Q: Why did you choose Spring Boot over other frameworks?
**A:** Spring Boot provides auto-configuration, embedded Tomcat, and seamless integration with Spring Data JPA (zero-configuration database access). For an enterprise-style ticketing system, the mature ecosystem of validation (`@Valid`), exception handling (`@ControllerAdvice`), and transaction management (`@Transactional`) makes it the ideal choice.

### Q: Explain how cascading works in your entities.
**A:** On the `Ticket` entity, `@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)` means:
- **CascadeType.ALL**: When I `save()` a ticket, Hibernate automatically persists all its comments and attachments too — I don't need to save them separately.
- **orphanRemoval = true**: If I remove a comment from the `ticket.comments` list in Java, Hibernate issues a `DELETE` SQL for that comment row. This prevents orphaned rows.

### Q: Why do you use DTOs instead of accepting entity objects directly in the controller?
**A:** Three reasons:
1. **Security**: A DTO excludes fields like `id` and `status` that users shouldn't control
2. **Validation**: I can attach `@NotBlank` annotations to DTO fields to automatically reject bad input
3. **Decoupling**: If the database schema changes, the API contract (DTO) can remain stable

### Q: How do you prevent users from editing other users' comments?
**A:** In `TicketServiceImpl.updateComment()`, I perform a triple validation:
1. Verify the comment exists (`404` if not)
2. Verify the comment belongs to the specified ticket (`400` if not)
3. Verify `comment.getAuthorId().equals(requesterId)` — if the user making the request isn't the original author, I throw `UnauthorizedCommentEditException` which the `GlobalExceptionHandler` catches and returns as HTTP `403 Forbidden`.

### Q: How does role-based access control work without Spring Security?
**A:** I implemented header-based RBAC:
- The frontend reads `role` and `userId` from `localStorage` (set during login) and passes them as `X-User-Role` and `X-User-Id` HTTP headers
- The backend controller extracts these via `@RequestHeader` and passes them to the service layer
- The service layer uses them to decide what data to return (all tickets for admins, only owned tickets for users)

### Q: Why do you store files on disk instead of in the database?
**A:** Storing binary files (images) directly in MySQL as `BLOB` columns leads to:
- **Database bloat**: A 5MB image would make the tickets table enormous
- **Slow queries**: Every `SELECT *` would transfer megabytes of binary data
- Instead, I store files on disk in `uploads/tickets/` and only save the **string path** (`"uploads/tickets/uuid.jpg"`) in the database — this is the industry-standard approach used by systems like AWS S3.

### Q: What happens if the server crashes mid-upload?
**A:** The `@Transactional` annotation on `createTicket()` ensures atomicity. If `fileStorageService.saveFiles()` succeeds but `ticketRepository.save()` fails, the database transaction rolls back — preventing a situation where files exist on disk but no ticket references them. The orphaned files can be cleaned up by a scheduled maintenance task.

### Q: Explain your error handling strategy.
**A:** I use a centralised `@ControllerAdvice` class (`GlobalExceptionHandler`) that intercepts all exceptions from all controllers. Each exception type maps to a specific HTTP status code (404, 403, 413, 400, 500), and every error response follows the same JSON schema (`ErrorResponse` with timestamp, status, error, message, path). This gives the frontend a consistent contract for displaying error messages.

### Q: Why do you validate on both frontend AND backend?
**A:** This is called **dual-layer validation** and it's an industry best practice:
- **Frontend validation** provides instant user feedback (no network round-trip), improving UX. But it can be bypassed — a hacker can use Postman or curl to send requests directly, completely skipping the React UI.
- **Backend validation** is the true security barrier. It runs on our server and cannot be bypassed. Even if someone disables JavaScript or crafts manual HTTP requests, the `@Valid` annotations and service-layer checks will reject invalid data.
- **Never trust the client** — this is the #1 rule of web security.

### Q: What is the difference between `@NotNull` and `@NotBlank`?
**A:** `@NotNull` only rejects `null` values — it would accept an empty string `""`. `@NotBlank` rejects `null`, `""`, AND whitespace-only strings like `"   "`. I use `@NotBlank` on free-text fields (description, contact details) to ensure meaningful content, and `@NotNull` on dropdown-sourced fields (category, priority) where empty strings never occur.

### Q: What is `@PrePersist` and why did you use it for timestamps?
**A:** `@PrePersist` is a JPA lifecycle callback annotation. It tells Hibernate to call the annotated method **automatically before the entity is first saved** (before the `INSERT` SQL). I used it to set `created_at = LocalDateTime.now()` guaranteeing the timestamp is always populated — even if the service layer forgets. Combined with `updatable = false` on the column, this makes the field **immutable** after creation, which is critical for accurate SLA calculations.

### Q: Explain your SLA timer feature. How does it work?
**A:** I implemented automated Service-Level Agreement tracking inspired by the ITIL framework:
1. **Time-to-First-Response**: In `addComment()`, I check `if (ticket.getFirstResponseAt() == null)`. Only the very first comment triggers the timestamp capture — subsequent comments don't overwrite it. This gives an accurate measure of how long the user waited.
2. **Time-to-Resolution**: In `updateTicketStatusAndResolution()`, when status changes to `RESOLVED`, I set `resolvedAt`. If the ticket is later reopened (e.g., back to `IN_PROGRESS`), the `resolvedAt` is cleared to `null` — because the original resolution was invalid and the timer should restart.
3. On the frontend, a `setInterval` updates the display every 60 seconds, creating a **live timer** that counts up in real-time until the milestone is reached.

### Q: What design patterns did you use?
**A:**
1. **Builder Pattern** (Lombok `@Builder`): For constructing complex objects like Tickets with many optional fields
2. **Repository Pattern**: `JpaRepository` abstracts database access behind a clean interface
3. **DTO Pattern**: Separates API contracts from internal entities
4. **Service Layer Pattern**: Centralises business logic between controllers and repositories
5. **Strategy Pattern** (implicit): Different ticket retrieval strategies based on user role
6. **Singleton Pattern**: All Spring-managed beans (`@Service`, `@Repository`, `@Controller`) are singletons by default
7. **Observer Pattern** (implicit): `@PrePersist` lifecycle callbacks act as event listeners on entity state changes
