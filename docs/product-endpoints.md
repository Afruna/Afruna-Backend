# Product Endpoints Documentation

## New Endpoints

### 1. Get Clearance Products

**Endpoint:** `GET /api/v1/products/clearance`

**Description:** Fetches all products that are marked for clearance sale.

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term to filter products by name
- `min-price` (optional): Minimum price filter
- `max-price` (optional): Maximum price filter

**Response:**
```json
{
  "data": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "desc": "Product Description",
      "price": 100,
      "discount": 20,
      "clearance": true,
      "status": "ACTIVE",
      "coverPhoto": ["image_url"],
      "images": ["image_url1", "image_url2"],
      "categoryId": "category_id",
      "vendor": "vendor_id",
      "ratings": 4.5,
      "sold": 50,
      "isOutOfStock": false,
      "totalScore": 85
    }
  ],
  "totalDocs": 25,
  "limit": 10,
  "page": 1,
  "totalPages": 3
}
```

### 2. Get Products by Special Offer

**Endpoint:** `GET /api/v1/products/special-offer/:specialOfferId`

**Description:** Fetches all products that are part of a specific special offer.

**Path Parameters:**
- `specialOfferId` (required): The ID of the special offer

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term to filter products by name
- `min-price` (optional): Minimum price filter
- `max-price` (optional): Maximum price filter

**Response:**
```json
{
  "data": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "desc": "Product Description",
      "price": 100,
      "discount": 15,
      "specialOffer": "special_offer_id",
      "status": "ACTIVE",
      "coverPhoto": ["image_url"],
      "images": ["image_url1", "image_url2"],
      "categoryId": "category_id",
      "vendor": "vendor_id",
      "ratings": 4.5,
      "sold": 50,
      "isOutOfStock": false,
      "totalScore": 85
    }
  ],
  "totalDocs": 10,
  "limit": 10,
  "page": 1,
  "totalPages": 1
}
```

## Usage Examples

### Get Clearance Products
```bash
curl -X GET "http://localhost:3000/api/v1/products/clearance?page=1&limit=10"
```

### Get Products by Special Offer
```bash
curl -X GET "http://localhost:3000/api/v1/products/special-offer/507f1f77bcf86cd799439011?page=1&limit=10"
```

## Notes

- Both endpoints return only active products (status: "ACTIVE")
- Products are sorted by creation date (newest first)
- Wishlist information is included for authenticated users
- Pagination is supported with customizable page size
- Search and price filtering are available on both endpoints 