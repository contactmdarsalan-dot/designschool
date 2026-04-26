# Software Requirements Specification (SRS)
## Eduflow LMS: Design School Platform

![Tech-Noir Aesthetic](https://grainy-gradients.vercel.app/noise.svg)

### 1. Introduction
#### 1.1 Purpose
The purpose of this document is to provide a detailed overview of the Software Requirements for the **Eduflow LMS (Design School)**. It defines the functional and non-functional requirements, architecture, and user flows for the platform, ensuring a cinematic, "Tech-Noir" learning experience.

#### 1.2 Scope
Design School is a specialized Learning Management System (LMS) designed for creative professionals. It handles course management, live session tracking, automated certification, and a cinematic student workspace.

#### 1.3 Definitions, Acronyms, and Abbreviations
- **DRF**: Django REST Framework
- **JWT**: JSON Web Token
- **OTP**: One-Time Password
- **Tech-Noir**: A design aesthetic combining high-tech futuristic elements with dark, cinematic overlays and glassmorphism.

---

### 2. System Architecture
The system follows a decoupled architecture with a Django/DRF backend and a React (Vite) frontend.

```mermaid
graph TD
    User((User))
    
    subgraph Frontend [React Frontend - Tech-Noir UI]
        UI[Glassmorphic UI Components]
        State[React Context / Auth State]
        Router[React Router]
    end
    
    subgraph Backend [Django REST API]
        Auth[SimpleJWT / Google OAuth]
        Core[Core API Views]
        Models[Django ORM Models]
    end
    
    subgraph Data [Storage Layer]
        DB[(SQLite / PostgreSQL)]
        Media[Cloudinary / ImageField Storage]
    end
    
    User <--> UI
    UI <--> Router
    Router <--> State
    State <--> Auth
    Auth <--> Models
    Models <--> DB
    Core <--> Models
    Core <--> Media
```

---

### 3. Functional Requirements

#### 3.1 Authentication & Authorization
- **R1.1**: The system shall support Email/Password registration.
- **R1.2**: The system shall support Google OAuth 2.0 integration.
- **R1.3**: New users must undergo Phone Verification via OTP before accessing the dashboard.
- **R1.4**: Secure session management using JWT (Access & Refresh tokens).

#### 3.2 User Roles
```mermaid
graph LR
    Admin[Administrator] -->|Manages| Resources[All Platform Resources]
    Mentor[Mentor/Faculty] -->|Delivers| Courses[Course Content]
    Student[Student/Learner] -->|Consumes| Courses
    Admin -->|Verify| Enrollments[Student Enrollments]
```

#### 3.3 Admin Workspace (Operations Console)
- **Identity Management**: Manage users, roles, and verification status.
- **Curriculum Control**: Shape course structures, pricing, and publishing.
- **Review Queue**: Grade assignment submissions and track student progress.
- **Certification**: Define and issue automated certificates.

---

### 4. Database Schema (ER Diagram)
The following diagram illustrates the core entities and their relationships within the platform.

```mermaid
erDiagram
    USER ||--o{ COURSE : "mentors"
    USER ||--o{ ENROLLMENT : "is enrolled"
    USER ||--o{ REVIEW : "writes"
    
    CATEGORY ||--o{ COURSE : "categorizes"
    
    COURSE ||--o{ COURSE_MODULE : "contains"
    COURSE ||--o{ ENROLLMENT : "has"
    COURSE ||--o{ REVIEW : "receives"
    COURSE ||--o{ REQUIREMENT : "needs"
    COURSE ||--o{ WHAT_LEARN : "teaches"
    
    COURSE_MODULE ||--o{ MODULE_POINT : "details"
    
    ENROLLMENT {
        string status "Pending / Verified"
        datetime created_at
    }
    
    COURSE {
        uuid id
        string title
        decimal actual_price
        boolean is_published
    }
    
    USER {
        string email
        string role "Admin / Mentor / Student"
        boolean is_phone_verified
    }
```

---

### 5. Key User Flows

#### 5.1 Registration & Verification Sequence
```mermaid
sequenceDiagram
    participant S as Student
    participant F as React Frontend
    participant B as Django Backend
    participant SMS as SMS Gateway
    
    S->>F: Submit Registration Form
    F->>B: POST /api/v1/auth/register/
    B-->>B: Create User (is_phone_verified=False)
    B-->>F: Success (Send OTP)
    F->>S: Redirect to /verify-phone
    B->>SMS: Send OTP to User Phone
    S->>F: Enter OTP
    F->>B: POST /api/v1/auth/verify-phone/
    B-->>B: Validate OTP
    B-->>F: JWT Tokens (Access/Refresh)
    F->>S: Redirect to Dashboard
```

---

### 6. Non-Functional Requirements

#### 6.1 Performance
- **P1**: Page transitions should be handled by Framer Motion for a 60fps feel.
- **P2**: API responses should typically occur within < 200ms for standard CRUD operations.

#### 6.2 Security
- **S1**: All passwords must be hashed using PBKDF2 with SHA256.
- **S2**: JWT tokens must be stored in HTTP-only cookies or handled via secure state management to prevent XSS.
- **S3**: Admin Panel access restricted to users with the `admin` role.

#### 6.3 Aesthetics (Tech-Noir Design)
- **A1**: The UI must utilize glassmorphism (backdrop-blur) and dark-themed gradients.
- **A2**: Interactive elements must provide micro-animations on hover and focus.

---

### 7. Setup & Installation
Refer to the `backend/` and `frontend/` directories for specific environment requirements and dependency installations.

1. **Backend**: `pip install -r requirements.txt && python manage.py migrate`
2. **Frontend**: `npm install && npm run dev`