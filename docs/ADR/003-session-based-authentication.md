# ADR-003: Session-Based Authentication over JWT

## Status

**Accepted** - September 2024

## Context

Rehber360 needed a secure authentication mechanism. Two main approaches were considered:

1. **JWT (JSON Web Tokens)**: Stateless tokens stored in localStorage/cookies
2. **Session-Based**: Server-side sessions with HTTP-only cookies

### Requirements

- **Security**: Protect against XSS, CSRF, token theft
- **User Experience**: Automatic session management, remember login
- **Simplicity**: Easy to implement and maintain
- **Mobile Support**: Work with web browsers (no native apps initially)
- **Logout**: Ability to invalidate sessions server-side

## Decision

**Use session-based authentication with HTTP-only cookies** stored in SQLite database.

### Implementation

```typescript
// server/index.ts
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';

const SessionStore = SQLiteStore(session);

app.use(session({
  store: new SessionStore({ db: 'database.db' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,      // Not accessible via JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax',     // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  }
}));
```

### Authentication Flow

```
1. User submits email/password → POST /api/auth/login
2. Server validates credentials
3. Server creates session in database
4. Server sends session ID in HTTP-only cookie
5. Browser automatically includes cookie in subsequent requests
6. Server validates session on each request
7. Logout destroys session server-side
```

## Consequences

### Positive

✅ **Better Security**: HTTP-only cookies prevent XSS attacks  
✅ **CSRF Protection**: SameSite=Lax cookie attribute  
✅ **Server-Side Control**: Can revoke sessions immediately  
✅ **Simpler Client**: No token management needed  
✅ **Automatic**: Browser handles cookie storage/sending  
✅ **State Management**: Easy to store user-specific data in session  
✅ **No localStorage**: Avoids XSS token theft  

### Negative

⚠️ **Server State**: Sessions stored in database (uses storage)  
⚠️ **Scalability**: Requires sticky sessions for load balancing (not a concern for current scale)  
⚠️ **Database Queries**: Extra DB query per request to validate session  

### Neutral

- **Mobile Apps**: Would require different approach (not needed currently)
- **Third-Party API**: JWT might be better for public API (not a use case)

## Alternatives Considered

### 1. JWT (JSON Web Tokens)

**How it works:**
```
1. User logs in → server generates JWT
2. JWT sent to client (localStorage or cookie)
3. Client includes JWT in Authorization header
4. Server validates JWT signature on each request
```

**Pros:**
- Stateless (no server storage)
- Scalable (no session store needed)
- Works well for public APIs
- Good for mobile apps

**Cons:**
- **Cannot revoke tokens**: Token valid until expiration
- **XSS vulnerability**: If stored in localStorage
- **Larger payload**: JWT is larger than session ID
- **More complex**: Token rotation, refresh tokens
- **No server-side logout**: Can't invalidate token immediately

**Verdict:** **Rejected** - Security concerns (cannot revoke) and unnecessary complexity.

### 2. OAuth 2.0

**Pros:**
- Industry standard
- Third-party login (Google, Microsoft)
- Good for federated identity

**Cons:**
- Overly complex for internal tool
- No need for third-party login
- More infrastructure required

**Verdict:** **Rejected** - Overkill for our use case.

### 3. Basic Auth

**Pros:**
- Simplest approach
- No state required

**Cons:**
- Credentials sent with every request
- Poor user experience
- No session management
- Less secure

**Verdict:** **Rejected** - Inadequate security and UX.

## Security Analysis

### Session-Based Authentication Security

| Attack Vector | Mitigation |
|---------------|------------|
| **XSS** | HTTP-only cookies (not accessible via JavaScript) |
| **CSRF** | SameSite=Lax cookies |
| **Session Hijacking** | Secure cookies (HTTPS), session timeout |
| **Brute Force** | Rate limiting on login endpoint |
| **Session Fixation** | Regenerate session ID on login |

### JWT Security Issues

| Issue | Problem |
|-------|---------|
| **Token Revocation** | Cannot invalidate token before expiration |
| **Logout** | Token remains valid until expiry |
| **Compromised Token** | No way to revoke immediately |
| **Storage** | localStorage vulnerable to XSS |

## Performance Comparison

**Session validation:**
```typescript
// ~0.5 ms per request
const session = db.prepare('SELECT * FROM sessions WHERE sid = ?').get(sessionId);
```

**JWT validation:**
```typescript
// ~1-2 ms per request (signature verification)
const decoded = jwt.verify(token, SECRET);
```

**Verdict:** Session validation is faster and simpler.

## Future Considerations

### If We Need JWT Later

**Use cases where JWT might be needed:**
1. **Public API**: Third-party developers need API access
2. **Mobile App**: Native iOS/Android apps
3. **Microservices**: Service-to-service authentication

**Solution:** Hybrid approach
- **Web App**: Session-based (current)
- **API/Mobile**: JWT for stateless access
- **Both**: Use same user database

**Implementation:**
```typescript
// Dual authentication middleware
app.use((req, res, next) => {
  if (req.headers.authorization) {
    // JWT for API requests
    validateJWT(req, res, next);
  } else {
    // Session for web requests
    validateSession(req, res, next);
  }
});
```

## Session Storage

### Why SQLite Sessions?

**Alternatives considered:**
1. **Memory Store**: Lost on server restart
2. **Redis**: Requires separate service
3. **SQLite**: Persistent, simple, already using SQLite

**Verdict:** SQLite is perfect for our scale.

### Session Table Schema

```sql
CREATE TABLE sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expired INTEGER NOT NULL
);

CREATE INDEX idx_sessions_expired ON sessions(expired);
```

## Monitoring

**Session metrics to track:**
- Active sessions count
- Average session duration
- Session creation rate
- Failed login attempts

**Alerts:**
- Unusual spike in failed logins (brute force)
- Excessive active sessions (potential attack)

## References

- **Authentication API**: docs/api/authentication.md
- **Security Tests**: docs/SECURITY_TESTS.md
- **OWASP Session Management**: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html

---

**Last Updated:** October 29, 2025  
**Next Review:** If public API or mobile app is needed  
**Supersedes:** N/A  
**Superseded by:** N/A
