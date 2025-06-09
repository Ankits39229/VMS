# Visitor Management System — Backend Specification

## Purpose
Provide APIs for signup, product listing, inquiry tracking, and admin analytics for an exhibition visitor management app.

---

## Tech Stack
- Framework: **Node.js + Express.js**
- Database: **MongoDB Atlas** (or Firebase Firestore)
- Hosting: **Render** / **Railway** / **Firebase Functions**
- Auth: Basic token for admin routes only

---

## API Endpoints

### 1. `POST /api/visitor/check-or-create`
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210"
}
