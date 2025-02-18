# Postman Samples for Feedback API

## Base URL

Assuming your API runs on: `http://localhost:PORT/api/v1`

---

## Create Feedback

**Endpoint:** POST `/feedback`  
**Headers:**

- Authorization: Bearer &lt;token&gt;
- Content-Type: application/json

**Body:**

```json
{
  "course_id": "60d21b4667d0d8992e610c85",
  "user_id": "60d21b4667d0d8992e610c86",
  "feedback_text": "Great course! I learned a lot.",
  "rating": 5
}
```

---

## Get All Feedback

**Endpoint:** GET `/feedback`  
**Headers:**

- Authorization: Bearer &lt;token&gt;

---

## Get Feedback by ID

**Endpoint:** GET `/feedback/:id`  
**Headers:**

- Authorization: Bearer &lt;token&gt;

Replace `:id` with an actual feedback ID.

---

## Update Feedback

**Endpoint:** PATCH `/feedback/:id`  
**Headers:**

- Authorization: Bearer &lt;token&gt;
- Content-Type: application/json

**Body:**

```json
{
  "feedback_text": "Updated feedback text."
}
```

Replace `:id` with an actual feedback ID.

---

## Delete Feedback

**Endpoint:** DELETE `/feedback/:id`  
**Headers:**

- Authorization: Bearer &lt;token&gt;

Replace `:id` with an actual feedback ID.

---

## Get Feedback by Course ID

**Endpoint:** GET `/feedback/course/:course_id`  
**Headers:**

- Authorization: Bearer &lt;token&gt;

Replace `:course_id` with an actual course ID.
