# One-Click Checkout Redirection Fix

This document explains the technical implementation of the direct checkout redirection for Tiendanube stores in ZeroCart.

## Background
Tiendanube's standard behavior for "Buy Now" often involves adding a product to the cart and then redirecting to `/comprar/`. However, if the session is not correctly shared or the AJAX call isn't finished, the user might see an empty cart or a 404 error.

## Technical Solution: AJAX + Direct V3 Checkout

Instead of relying on standard form submission or simple `/cart/add/` redirects, we use the following flow:

### 1. AJAX Addition via `/comprar/`
We send a POST request to the `/comprar/` endpoint with `X-Requested-With: XMLHttpRequest`. This endpoint is robust and returns a full JSON representation of the cart state.

```javascript
const response = await fetch('/comprar/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
    },
    body: new URLSearchParams({
        'add_to_cart': productId,
        'quantity': '1'
    })
});
```

### 2. URL Construction
The JSON response contains a `cart` object with an `id` and a `token`. We use these to bypass any intermediate pages and go straight to the payment injection point.

**Redirect Pattern:**
`/checkout/v3/start/{cart_id}/{cart_token}?from_store=1`

### 3. Fallbacks
If the specific `id` and `token` are missing, we fall back to:
- `cart.abandoned_checkout_url` (provided by Tiendanube).
- `window.LS.cartUrl`.
- A generic `/comprar/` redirect.

## Script Integration
The logic is injected dynamically via `script.controller.ts`. It also handles:
- **Product ID Detection**: Extracts from `input[name="add_to_cart"]` or `window.LS.product.id`.
- **UI Interaction**: Hides the original "Add to Cart" button and injects the "Comprar Ahora" button in its place.

## Benefits
- **Zero Friction**: One click leads directly to the payment/shipping info.
- **Reliability**: Uses Tiendanube's internal tokens to ensure the cart isn't empty on arrival.
- **Conversion**: Reduces steps in the purchasing funnel for digital products.

## ⚠️ 2026 Fix: The 404 Error on Direct Redirect
A recent update revealed that redirecting directly to `/checkout/v3/start?add_to_cart=ID` can cause **404 Errors** or empty carts in some themes because the session isn't initialized correctly.

**The Solution (Restored):**
We must always call the AJAX endpoint `/comprar/` first to get the official `cart.id` and `cart.token`.

```javascript
const response = await fetch('/comprar/', { 
    method: 'POST', 
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
    body: new URLSearchParams({ 'add_to_cart': productId, 'quantity': '1' })
});
const data = await response.json();

// 🚀 Safe redirection
window.location.href = `/checkout/v3/start/${data.cart.id}/${data.cart.token}?from_store=1`;
```
This guarantees that Tiendanube recognizes the checkout session as valid and populated.
