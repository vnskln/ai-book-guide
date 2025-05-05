# REST API Plan for AI Book Guide

## 1. Resources

| Resource | Database Table | Description |
|----------|---------------|-------------|
| Users | `users` (managed by Supabase Auth) | User accounts and authentication |
| UserPreferences | `user_preferences` | User reading preferences and settings |
| Books | `books` | Book information |
| Authors | `authors` | Author information |
| UserBooks | `user_books` | User's book lists (read, to-read, rejected) |
| Recommendations | `recommendations` | AI-generated book recommendations |

## 2. Endpoints

### User Preferences

#### GET /api/preferences
Get the current user's reading preferences.

**Response Body:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "reading_preferences": "string",
  "preferred_language": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Success Codes:**
- 200 OK: Preferences retrieved successfully

**Error Codes:**
- 401 Unauthorized: User not authenticated
- 404 Not Found: Preferences not found for this user

#### POST /api/preferences
Create reading preferences for a new user.

**Request Body:**
```json
{
  "reading_preferences": "string",
  "preferred_language": "string"
}
```

**Response Body:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "reading_preferences": "string",
  "preferred_language": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Success Codes:**
- 201 Created: Preferences created successfully

**Error Codes:**
- 400 Bad Request: Invalid input (e.g., reading preferences too long)
- 401 Unauthorized: User not authenticated
- 409 Conflict: Preferences already exist for this user

#### PUT /api/preferences
Update the current user's reading preferences.

**Request Body:**
```json
{
  "reading_preferences": "string",
  "preferred_language": "string"
}
```

**Response Body:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "reading_preferences": "string",
  "preferred_language": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Success Codes:**
- 200 OK: Preferences updated successfully

**Error Codes:**
- 400 Bad Request: Invalid input (e.g., reading preferences too long)
- 401 Unauthorized: User not authenticated
- 404 Not Found: Preferences not found for this user

### Books

#### GET /api/books
Get a list of books, with optional filtering and pagination.

**Query Parameters:**
- `title` (optional): Filter by book title (partial match)
- `language` (optional): Filter by book language
- `author` (optional): Filter by author name (partial match)
- `page` (optional, default=1): Page number
- `limit` (optional, default=20): Items per page

**Response Body:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "language": "string",
      "authors": [
        {
          "id": "uuid",
          "name": "string"
        }
      ],
      "created_at": "timestamp"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "total_pages": "number"
  }
}
```

**Success Codes:**
- 200 OK: Books retrieved successfully

**Error Codes:**
- 400 Bad Request: Invalid query parameters

#### GET /api/books/:id
Get details for a specific book.

**Response Body:**
```json
{
  "id": "uuid",
  "title": "string",
  "language": "string",
  "authors": [
    {
      "id": "uuid",
      "name": "string"
    }
  ],
  "created_at": "timestamp"
}
```

**Success Codes:**
- 200 OK: Book retrieved successfully

**Error Codes:**
- 404 Not Found: Book not found

#### POST /api/books
Create a new book.

**Request Body:**
```json
{
  "title": "string",
  "language": "string",
  "authors": [
    {
      "name": "string"
    }
  ]
}
```

**Response Body:**
```json
{
  "id": "uuid",
  "title": "string",
  "language": "string",
  "authors": [
    {
      "id": "uuid",
      "name": "string"
    }
  ],
  "created_at": "timestamp"
}
```

**Success Codes:**
- 201 Created: Book created successfully

**Error Codes:**
- 400 Bad Request: Invalid input
- 401 Unauthorized: User not authenticated

### User Books

#### GET /api/user-books
Get the current user's books with optional filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by status ('read', 'to_read', 'rejected')
- `is_recommended` (optional): Filter by whether book was recommended
- `page` (optional, default=1): Page number
- `limit` (optional, default=20): Items per page

**Response Body:**
```json
{
  "data": [
    {
      "id": "uuid",
      "book_id": "uuid",
      "title": "string",
      "language": "string",
      "authors": [
        {
          "id": "uuid",
          "name": "string"
        }
      ],
      "status": "string",
      "is_recommended": "boolean",
      "rating": "boolean",
      "recommendation_id": "uuid",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "total_pages": "number"
  }
}
```

**Success Codes:**
- 200 OK: User books retrieved successfully

**Error Codes:**
- 401 Unauthorized: User not authenticated

#### POST /api/user-books
Add a book to user's collection.

**Request Body:**
```json
{
  "book": {
    "title": "string",
    "language": "string",
    "authors": [
      {
        "name": "string"
      }
    ]
  },
  "status": "string", // "read", "to_read", or "rejected"
  "rating": "boolean", // Only required if status is "read"
  "recommendation_id": "uuid" // Optional, if adding from a recommendation
}
```

**Response Body:**
```json
{
  "id": "uuid",
  "book_id": "uuid",
  "title": "string",
  "language": "string",
  "authors": [
    {
      "id": "uuid",
      "name": "string"
    }
  ],
  "status": "string",
  "is_recommended": "boolean",
  "rating": "boolean",
  "recommendation_id": "uuid",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Success Codes:**
- 201 Created: Book added to user's collection successfully

**Error Codes:**
- 400 Bad Request: Invalid input or missing required fields
- 401 Unauthorized: User not authenticated
- 409 Conflict: Book already exists in user's collection

#### PUT /api/user-books/:id
Update a book in user's collection.

**Request Body:**
```json
{
  "status": "string", // "read", "to_read", or "rejected"
  "rating": "boolean" // Required if status is "read"
}
```

**Response Body:**
```json
{
  "id": "uuid",
  "book_id": "uuid",
  "title": "string",
  "language": "string",
  "authors": [
    {
      "id": "uuid",
      "name": "string"
    }
  ],
  "status": "string",
  "is_recommended": "boolean",
  "rating": "boolean",
  "recommendation_id": "uuid",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Success Codes:**
- 200 OK: User book updated successfully

**Error Codes:**
- 400 Bad Request: Invalid input
- 401 Unauthorized: User not authenticated
- 403 Forbidden: User does not own this book
- 404 Not Found: User book not found

#### DELETE /api/user-books/:id
Remove a book from user's collection.

**Success Codes:**
- 204 No Content: User book deleted successfully

**Error Codes:**
- 401 Unauthorized: User not authenticated
- 403 Forbidden: User does not own this book
- 404 Not Found: User book not found

### Recommendations

#### POST /api/recommendations
Generate a new book recommendation using AI.

**Response Body:**
```json
{
  "id": "uuid",
  "book": {
    "id": "uuid",
    "title": "string",
    "language": "string",
    "authors": [
      {
        "id": "uuid",
        "name": "string"
      }
    ]
  },
  "plot_summary": "string",
  "rationale": "string",
  "ai_model": "string",
  "execution_time": "number",
  "status": "string",
  "created_at": "timestamp"
}
```

**Success Codes:**
- 201 Created: Recommendation generated successfully

**Error Codes:**
- 401 Unauthorized: User not authenticated
- 429 Too Many Requests: Rate limit exceeded

#### GET /api/recommendations
Get recommendation history.

**Query Parameters:**
- `status` (optional): Filter by status ('pending', 'accepted', 'rejected')
- `page` (optional, default=1): Page number
- `limit` (optional, default=20): Items per page

**Response Body:**
```json
{
  "data": [
    {
      "id": "uuid",
      "book": {
        "id": "uuid",
        "title": "string",
        "language": "string",
        "authors": [
          {
            "id": "uuid",
            "name": "string"
          }
        ]
      },
      "plot_summary": "string",
      "rationale": "string",
      "ai_model": "string",
      "execution_time": "number",
      "status": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "total_pages": "number"
  }
}
```

**Success Codes:**
- 200 OK: Recommendations retrieved successfully

**Error Codes:**
- 401 Unauthorized: User not authenticated

#### PUT /api/recommendations/:id
Update recommendation status.

**Request Body:**
```json
{
  "status": "string" // "accepted" or "rejected"
}
```

**Response Body:**
```json
{
  "id": "uuid",
  "book": {
    "id": "uuid",
    "title": "string",
    "language": "string",
    "authors": [
      {
        "id": "uuid",
        "name": "string"
      }
    ]
  },
  "plot_summary": "string",
  "rationale": "string",
  "ai_model": "string",
  "execution_time": "number",
  "status": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Success Codes:**
- 200 OK: Recommendation status updated successfully

**Error Codes:**
- 400 Bad Request: Invalid status
- 401 Unauthorized: User not authenticated
- 403 Forbidden: User does not own this recommendation
- 404 Not Found: Recommendation not found

## 3. Authentication and Authorization

Authentication in the API is handled using Supabase Auth, which provides:

1. **JWT-based Authentication**:
   - Supabase issues JWTs (JSON Web Tokens) that the frontend includes in request headers
   - The tokens contain the user's ID and role information
   - API endpoints verify these tokens to authenticate requests

2. **Row Level Security (RLS)**:
   - Database access is controlled using Supabase's RLS policies
   - These policies ensure users can only access their own data

3. **Authorization Flow**:
   - API endpoints verify the JWT in the `Authorization` header
   - The user's ID is extracted from the token
   - Data access is restricted based on the user's ID using RLS policies
   - Endpoints include additional authorization checks where needed

4. **Authorization Header Format**:
   ```
   Authorization: Bearer <jwt_token>
   ```

## 4. Validation and Business Logic

### User Preferences Validation
- `reading_preferences`: Maximum 1000 characters
- `preferred_language`: Must not be empty

### User Books Validation
- Valid `status`: Must be one of: 'read', 'to_read', 'rejected'
- `rating`: Required if status is 'read', must be a boolean (true/false)
- Uniqueness constraint: A user cannot have the same book in multiple statuses

### Recommendations Validation
- Valid `status`: Must be one of: 'pending', 'accepted', 'rejected'

### Business Logic Implementation

1. **Book Recommendation Logic**:
   - When a user requests a recommendation, the API:
     - Retrieves the user's preferences
     - Fetches their reading history (read, to-read, and rejected books)
     - Calls the AI service (Claude 3.5 Sonnet via OpenRouter.ai)
     - Saves the recommendation with status 'pending'
     - Returns the recommendation to the user

2. **Recommendation Status Updates**:
   - When a user accepts a recommendation:
     - Update recommendation status to 'accepted' 
     - Add book to user's 'to_read' list
     - Set `is_recommended = true` for the user book

   - When a user rejects a recommendation:
     - Update recommendation status to 'rejected'
     - Add book to user's 'rejected' list
     - Set `is_recommended = true` for the user book

3. **Reading Status Transitions**:
   - When a user marks a book as read:
     - If from 'to_read', update status to 'read' and require rating
     - Update recommendation status if applicable (via database trigger)

   - When a user rejects a book from 'to_read':
     - Update status to 'rejected'
     - Update recommendation status if applicable (via database trigger)

4. **Book Creation Logic**:
   - When creating a book, check if it already exists to avoid duplicates
   - Create any new authors as needed
   - Establish book-author relationships