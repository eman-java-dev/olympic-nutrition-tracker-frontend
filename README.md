# 🥗 Olympic Nutrition Tracker

A modern web application built with **Angular 17** and **Spring Boot** for managing athletes, nutrition monitoring, consultations, and coach administration.

The application includes a role-based authentication system with different permissions for administrators, coaches, and athletes.

---

# 🌍 Features

- 🔐 Authentication (Sign In / Sign Out)
- 👤 Role-Based Access Control (ADMIN, COACH, ATHLETE)
- 🧍 Athlete Management
- 🧑‍🏫 Coach Management
- 🍽️ Nutrition Tracking
- 📅 Consultation Management
- 🌐 Multilingual Interface (English / French)
- 🎥 Modern UI with video hero sections
- 📱 Responsive Design

---

# 👥 Permissions

### ADMIN
- Full access to the application
- Manage athletes
- Manage coaches
- Manage nutrition entries
- Manage consultations

### COACH
- View athletes
- Add and edit nutrition entries and consultations
- Read-only access to coaches

### ATHLETE
- View athletes
- View nutrition data
- View consultations
- Read-only access to the application

---

# 🖼️ Screenshots

### 🏠 Home Page

![Home Page](https://github.com/eman-java-dev/olympic-nutrition-tracker-frontend/blob/main/src/assets/screenshots/home-page.png?raw=true)

### 🔐 Sign In

![Sign In](https://github.com/eman-java-dev/olympic-nutrition-tracker-frontend/blob/main/src/assets/screenshots/signin-page.png?raw=true)

---

# ⚙️ Technologies

| Category | Technologies |
|-----------|--------------|
| Frontend | Angular 17, TypeScript |
| UI | HTML5, CSS3, Bootstrap |
| Backend | Spring Boot (Java 21) |
| Database | MySQL |
| Security | Spring Security and JWT Bearer authentication |
| Version Control | Git & GitHub |
| Tools | IntelliJ IDEA, VS Code, Postman |

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/eman-java-dev/olympic-nutrition-tracker-frontend.git
```

Go to the project

```bash
cd olympic-nutrition-tracker-frontend
```

Install dependencies

```bash
npm ci
```

Run the application

```bash
npm start
```

The application runs at

```
http://localhost:4200
```

The development build calls `http://localhost:8080/api` by default.

## Production build and hosting

```bash
npm run build
```

Serve `dist/app` over HTTPS. Forward `/api` and its subpaths to Spring Boot and
serve `index.html` for Angular routes such as `/consultations`. Keep API errors
on the API route so they reach the frontend with their original HTTP status.

For a separately hosted API, set `apiUrl` in `src/environments/environment.prod.ts`
to the public HTTPS API base URL without a trailing slash, then rebuild. Configure
Spring Security CORS for the frontend origin, the methods it uses, and the
`Authorization` and `Content-Type` headers. Angular bundles this URL as public
configuration. Keep database credentials and the JWT signing key in the backend
deployment's secret store.

Use a supported Angular and Node.js combination for production. This repository
currently uses Angular 17.3, which supported Node.js 18 and 20 when it was maintained.

---

# 🌐 Languages

- 🇬🇧 English
- 🇫🇷 Français

---

# 🔒 Security

The current version uses:

- Spring Security
- JWT Bearer authentication via `POST /api/auth/login`
- Role-Based Access Control (ADMIN / COACH / ATHLETE)

The frontend expects `/api/auth/login` to return `token`, `username`, and `role`.
The server must supply the authenticated username and role. The frontend uses
them to present the appropriate controls, while Spring Security must enforce the
permissions and record-level access on each endpoint. Return HTTP 401 for an
invalid or expired token and 403 when an authenticated user lacks permission.

Keep local Postman workspaces and exports out of Git. Share only collections
that use variables for credentials and URLs and contain synthetic sample data.

---

# 📌 Future Improvements

- User Registration
- User Profile
- Cloud Deployment
- Unit & Integration Tests

---

# 👩‍💻 Author

**Eman Altohami**

Bachelor Java Developer – Studi

GitHub:
https://github.com/eman-java-dev
