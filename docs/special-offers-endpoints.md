# Special Offers API Documentation

## Overview

The Special Offers API provides endpoints to manage promotional offers for products. This includes creating, reading, updating, and deleting special offers, as well as querying offers by various criteria.

## Base URL
```
/api/v1/special-offers
```

## Endpoints

### 1. Get All Special Offers

**Endpoint:** `GET /api/v1/special-offers`

**Description:** Retrieves all special offers with pagination and filtering options.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `status` (optional): Filter by status (true/false)
- `product` (optional): Filter by product ID
- `startDate` (optional): Filter by start date (ISO 8601 format)
- `endDate` (optional): Filter by end date (ISO 8601 format)

**Response:**
```json
{
  "data": [
    {
      "_id": "special_offer_id",
      "product": "product_id",
      "discount": 25,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z",
      "status": true,
      "tag": "tag_id",
      "discountId": "ABC12345",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalDocs": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### 2. Get Active Special Offers

**Endpoint:** `GET /api/v1/special-offers/active`

**Description:** Retrieves only active special offers that are currently valid.

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:** Same structure as above, but only includes active offers.

### 3. Get Special Offer by ID

**Endpoint:** `GET /api/v1/special-offers/:id`

**Description:** Retrieves a specific special offer by its ID.

**Path Parameters:**
- `id` (required): The special offer ID

**Response:**
```json
{
  "_id": "special_offer_id",
  "product": "product_id",
  "discount": 25,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "status": true,
  "tag": "tag_id",
  "discountId": "ABC12345",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Get Special Offers by Product

**Endpoint:** `GET /api/v1/special-offers/product/:productId`

**Description:** Retrieves all special offers for a specific product.

**Path Parameters:**
- `productId` (required): The product ID

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `status` (optional): Filter by status

**Response:** Same structure as "Get All Special Offers" but filtered by product.

### 5. Get Special Offers by Tag

**Endpoint:** `GET /api/v1/special-offers/tag/:tagId`

**Description:** Retrieves all special offers with a specific tag.

**Path Parameters:**
- `tagId` (required): The tag ID

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `status` (optional): Filter by status

**Response:** Same structure as "Get All Special Offers" but filtered by tag.

### 6. Get Special Offers Statistics

**Endpoint:** `GET /api/v1/special-offers/stats`

**Description:** Retrieves statistics about special offers.

**Response:**
```json
{
  "totalOffers": 100,
  "activeOffers": 75,
  "inactiveOffers": 25,
  "expiringSoon": 5,
  "activePercentage": 75
}
```

### 7. Create Special Offer (Admin Only)

**Endpoint:** `POST /api/v1/special-offers`

**Description:** Creates a new special offer.

**Headers:**
- `Authorization`: Bearer token (admin required)

**Request Body:**
```json
{
  "product": "product_id",
  "discount": 25,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "status": true,
  "tag": "tag_id"
}
```

**Required Fields:**
- `product`: Valid product ID
- `discount`: Numeric discount percentage

**Optional Fields:**
- `startDate`: Start date (ISO 8601 format)
- `endDate`: End date (ISO 8601 format)
- `status`: Boolean (default: true)
- `tag`: Valid tag ID

**Response:** Returns the created special offer object.

### 8. Update Special Offer (Admin Only)

**Endpoint:** `PUT /api/v1/special-offers/:id`

**Description:** Updates an existing special offer.

**Headers:**
- `Authorization`: Bearer token (admin required)

**Path Parameters:**
- `id` (required): The special offer ID

**Request Body:** Same as create, but all fields are optional.

**Response:** Returns the updated special offer object.

### 9. Delete Special Offer (Admin Only)

**Endpoint:** `DELETE /api/v1/special-offers/:id`

**Description:** Deletes a special offer.

**Headers:**
- `Authorization`: Bearer token (admin required)

**Path Parameters:**
- `id` (required): The special offer ID

**Response:** Returns success message.

### 10. Toggle Special Offer Status (Admin Only)

**Endpoint:** `PUT /api/v1/special-offers/:id/toggle-status`

**Description:** Toggles the status of a special offer (active/inactive).

**Headers:**
- `Authorization`: Bearer token (admin required)

**Path Parameters:**
- `id` (required): The special offer ID

**Response:** Returns the updated special offer object.

## Usage Examples

### Get All Special Offers
```bash
curl -X GET "http://localhost:3000/api/v1/special-offers?page=1&limit=10"
```

### Get Active Special Offers
```bash
curl -X GET "http://localhost:3000/api/v1/special-offers/active"
```

### Get Special Offer by ID
```bash
curl -X GET "http://localhost:3000/api/v1/special-offers/507f1f77bcf86cd799439011"
```

### Create Special Offer (Admin)
```bash
curl -X POST "http://localhost:3000/api/v1/special-offers" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "507f1f77bcf86cd799439012",
    "discount": 25,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "status": true,
    "tag": "507f1f77bcf86cd799439013"
  }'
```

### Update Special Offer (Admin)
```bash
curl -X PUT "http://localhost:3000/api/v1/special-offers/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discount": 30,
    "status": false
  }'
```

### Toggle Status (Admin)
```bash
curl -X PUT "http://localhost:3000/api/v1/special-offers/507f1f77bcf86cd799439011/toggle-status" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Start date must be before end date"
}
```

### 401 Unauthorized
```json
{
  "error": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "error": "Special offer not found"
}
```

### 422 Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "discount",
      "message": "Discount is required and must be a number"
    }
  ]
}
```

## Notes

- All dates should be in ISO 8601 format
- The `discountId` is automatically generated as a random 8-character string
- Active offers are filtered to include only those with `status: true` and valid date ranges
- Admin authentication is required for create, update, delete, and toggle operations
- Pagination is supported on all list endpoints
- The API includes automatic population of related product and tag data 