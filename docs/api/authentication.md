# Authentication API

API documentation for user authentication and session management.

## Base Path
```
/api/auth
```

## Overview

Session-based authentication using secure HTTP-only cookies. No JWT tokens are used.

---

## Endpoints

### Register

Create a new user account (first user automatically becomes admin).

```http
POST /api/auth/register
```

**Public Endpoint** (No authentication required)

**Request Body:**
```json
{
  "email": "rehber@okul.edu.tr",
  "password": "SecurePassword123!",
  "name": "Ahmet Yılmaz",
  "role": "counselor"
}
```

**Validation Rules:**
- `email`: Valid email format, unique
- `password`: Min 8 characters, must include uppercase, lowercase, number
- `name`: Min 3 characters
- `role`: One of: admin, counselor, teacher, observer

**Example Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "email": "rehber@okul.edu.tr",
    "name": "Ahmet Yılmaz",
    "role": "admin",
    "is_active": true,
    "created_at": "2025-10-29T10:00:00.000Z"
  },
  "message": "Registration successful"
}
```

**Note:** Password is hashed with bcryptjs before storage. Never stored in plain text.

---

### Login

Authenticate user and create session.

```http
POST /api/auth/login
```

**Public Endpoint**

**Request Body:**
```json
{
  "email": "rehber@okul.edu.tr",
  "password": "SecurePassword123!"
}
```

**Example Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "rehber@okul.edu.tr",
    "name": "Ahmet Yılmaz",
    "role": "admin"
  },
  "message": "Login successful"
}
```

**Set-Cookie Header:**
```http
Set-Cookie: connect.sid=s%3A...; Path=/; HttpOnly; SameSite=Lax
```

**Error Responses:**

```json
// 401 Unauthorized - Invalid credentials
{
  "error": "Unauthorized",
  "message": "Invalid email or password"
}

// 403 Forbidden - Account disabled
{
  "error": "Forbidden",
  "message": "Your account has been disabled"
}
```

---

### Logout

End user session.

```http
POST /api/auth/logout
```

**Authorization:** Required (any authenticated user)

**Example Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

**Session Cookie Cleared:**
Session is destroyed and cookie is removed.

---

### Get Current User

Get authenticated user's information.

```http
GET /api/auth/me
```

**Authorization:** Required

**Example Response (200 OK):**
```json
{
  "id": 1,
  "email": "rehber@okul.edu.tr",
  "name": "Ahmet Yılmaz",
  "role": "admin",
  "is_active": true,
  "last_login": "2025-10-29T10:00:00.000Z",
  "created_at": "2024-09-01T08:00:00.000Z"
}
```

**Error Response:**
```json
// 401 Unauthorized - Not logged in
{
  "error": "Unauthorized",
  "message": "Not authenticated"
}
```

---

### Update Profile

Update current user's profile.

```http
PUT /api/auth/profile
```

**Authorization:** Required

**Request Body:**
```json
{
  "name": "Ahmet Yılmaz (Updated)",
  "email": "new.email@okul.edu.tr"
}
```

**Example Response (200 OK):**
```json
{
  "id": 1,
  "email": "new.email@okul.edu.tr",
  "name": "Ahmet Yılmaz (Updated)",
  "updated_at": "2025-10-29T11:00:00.000Z"
}
```

---

### Change Password

Change current user's password.

```http
PUT /api/auth/password
```

**Authorization:** Required

**Request Body:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePassword456!"
}
```

**Example Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
```json
// 400 Bad Request - Current password incorrect
{
  "error": "Bad Request",
  "message": "Current password is incorrect"
}

// 400 Bad Request - Weak new password
{
  "error": "Validation Error",
  "message": "Password must be at least 8 characters with uppercase, lowercase, and number"
}
```

---

## Session Management

### Session Storage

- Sessions stored in SQLite database
- Session ID in HTTP-only cookie
- SameSite=Lax for CSRF protection
- No CSRF tokens needed (modern approach)

### Session Lifetime

- **Idle Timeout**: 24 hours (no activity)
- **Absolute Timeout**: 7 days (forced re-login)
- **Remember Me**: Not implemented (security consideration)

### Security Features

1. **Password Hashing**: bcryptjs with salt rounds = 10
2. **HTTP-Only Cookies**: Not accessible via JavaScript
3. **SameSite Cookies**: CSRF protection
4. **Secure Flag**: Enabled in production (HTTPS)
5. **Rate Limiting**: 10 login attempts per 15 minutes per IP

---

## User Management (Admin Only)

### List Users

```http
GET /api/users
```

**Authorization:** Admin only

**Example Response (200 OK):**
```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@okul.edu.tr",
      "name": "Admin User",
      "role": "admin",
      "is_active": true,
      "last_login": "2025-10-29T10:00:00.000Z",
      "created_at": "2024-09-01T08:00:00.000Z"
    },
    {
      "id": 2,
      "email": "rehber@okul.edu.tr",
      "name": "Counselor User",
      "role": "counselor",
      "is_active": true,
      "last_login": "2025-10-28T15:30:00.000Z",
      "created_at": "2024-09-15T10:00:00.000Z"
    }
  ]
}
```

---

### Update User Role

```http
PUT /api/users/:id/role
```

**Authorization:** Admin only

**Request Body:**
```json
{
  "role": "counselor"
}
```

**Example Response (200 OK):**
```json
{
  "id": 2,
  "role": "counselor",
  "updated_at": "2025-10-29T11:00:00.000Z"
}
```

---

### Deactivate User

```http
PUT /api/users/:id/deactivate
```

**Authorization:** Admin only

**Example Response (200 OK):**
```json
{
  "id": 2,
  "is_active": false,
  "message": "User deactivated successfully"
}
```

**Note:** Deactivated users cannot login but data is preserved.

---

## Role-Based Access Control (RBAC)

### Permission Matrix

| Action | Admin | Counselor | Teacher | Observer |
|--------|-------|-----------|---------|----------|
| **View Students** | ✅ | ✅ | ✅ | ✅ |
| **Create Students** | ✅ | ✅ | ❌ | ❌ |
| **Edit Students** | ✅ | ✅ | Limited | ❌ |
| **Delete Students** | ✅ | ❌ | ❌ | ❌ |
| **View Counseling Sessions** | ✅ | ✅ | ❌ | ✅ |
| **Create Sessions** | ✅ | ✅ | ❌ | ❌ |
| **AI Features** | ✅ | ✅ | ❌ | ❌ |
| **User Management** | ✅ | ❌ | ❌ | ❌ |
| **System Settings** | ✅ | ❌ | ❌ | ❌ |
| **Export Data** | ✅ | ✅ | Limited | Limited |

---

## Best Practices

### Client-Side

```javascript
// Always include credentials for session cookies
fetch('/api/students', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Handle 401 responses (redirect to login)
if (response.status === 401) {
  window.location.href = '/login';
}
```

### Security Recommendations

1. **Use HTTPS in production**
2. **Strong password policy**
3. **Account lockout after failed attempts**
4. **Session timeout after inactivity**
5. **Audit log for sensitive actions**

---

**Related Documentation:**
- [API Overview](./README.md)
- [Students API](./students.md)
- [User Management Guide](../guides/user-management.md)

**Last Updated:** October 29, 2025
