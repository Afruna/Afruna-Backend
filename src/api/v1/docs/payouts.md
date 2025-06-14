# Payouts API Documentation

## Overview
The Payouts API allows vendors to request payouts from their wallet balance and administrators to manage these requests.

## Authentication
- Vendor endpoints require vendor authentication
- Admin endpoints require admin authentication

## Endpoints

### 1. Request Payout
**POST** `/api/v1/payouts/request`
- Request a payout from vendor's wallet balance
- Requires vendor authentication

**Request Body:**
```json
{
  "amount": number,          // Amount to withdraw (must be > 0)
  "method": string,         // "BANK_TRANSFER" or "WALLET"
  "bankDetails": {          // Required only for BANK_TRANSFER
    "accountNumber": string,
    "accountName": string,
    "bankName": string
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout request created successfully",
  "data": {
    "id": string,
    "amount": number,
    "status": "PENDING",
    "method": string,
    "reference": string,
    "createdAt": date
  }
}
```

### 2. Get Vendor Payouts
**GET** `/api/v1/payouts/vendor`
- Get all payout requests for the authenticated vendor
- Optional query parameter: `status` (PENDING, APPROVED, REJECTED, COMPLETED, FAILED)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": string,
      "amount": number,
      "status": string,
      "method": string,
      "reference": string,
      "createdAt": date,
      "completedAt": date
    }
  ]
}
```

### 3. Get Pending Payouts (Admin)
**GET** `/api/v1/payouts/pending`
- Get all pending payout requests
- Requires admin authentication

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": string,
      "vendorId": string,
      "amount": number,
      "status": "PENDING",
      "method": string,
      "reference": string,
      "createdAt": date
    }
  ]
}
```

### 4. Approve Payout (Admin)
**POST** `/api/v1/payouts/:payoutId/approve`
- Approve a pending payout request
- Requires admin authentication

**Response:**
```json
{
  "success": true,
  "message": "Payout approved successfully",
  "data": {
    "id": string,
    "status": "COMPLETED",
    "approvedAt": date,
    "completedAt": date
  }
}
```

### 5. Reject Payout (Admin)
**POST** `/api/v1/payouts/:payoutId/reject`
- Reject a pending payout request
- Requires admin authentication

**Request Body:**
```json
{
  "reason": string  // Reason for rejection
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout rejected successfully",
  "data": {
    "id": string,
    "status": "REJECTED",
    "failureReason": string,
    "approvedAt": date
  }
}
```

### 6. Bulk Payout (Admin)
**POST** `/api/v1/payouts/bulk`
- Process payouts for multiple vendors
- Requires admin authentication

**Request Body:**
```json
{
  "vendorIds": string[],    // Array of vendor IDs
  "amount": number,         // Amount to payout to each vendor
  "method": string         // "BANK_TRANSFER" or "WALLET"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk payout processed successfully",
  "data": [
    {
      "id": string,
      "vendorId": string,
      "amount": number,
      "status": "COMPLETED",
      "method": string,
      "reference": string
    }
  ]
}
```

### 7. Get Payout Details
**GET** `/api/v1/payouts/:payoutId`
- Get detailed information about a specific payout
- Requires authentication (vendor or admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": string,
    "vendorId": string,
    "amount": number,
    "status": string,
    "method": string,
    "bankDetails": object,
    "reference": string,
    "description": string,
    "approvedBy": string,
    "approvedAt": date,
    "completedAt": date,
    "failureReason": string,
    "createdAt": date,
    "updatedAt": date
  }
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found

## Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": number,
    "details": string
  }
}
```
```