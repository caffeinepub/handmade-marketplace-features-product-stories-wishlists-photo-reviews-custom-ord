# Specification

## Summary
**Goal:** Fix deployment/build failures and stabilize the marketplace app by resolving frontend/backend errors, improving error handling, and aligning frontend↔backend data interfaces.

**Planned changes:**
- Run a full build + deploy pass and fix the underlying causes of deployment failure (Motoko compilation, frontend TypeScript/build errors, and/or canister deployment configuration issues).
- Add a user-visible frontend error state for failed backend calls (core data loads and user actions), including a clear English message and a lightweight retry option for query/refetch flows.
- Harden backend update-call error handling for user-generated actions (favorites, reviews with photo uploads, custom order requests) to return structured errors instead of trapping, including consistent unauthenticated error results.
- Perform a consistency pass across frontend↔backend types and field shapes for core entities (shops, products/story fields, categories, announcements, wishlist entries, reviews, custom orders) and fix mismatches that cause runtime/serialization issues.

**User-visible outcome:** The app builds and deploys successfully; core marketplace data loads without decoding/shape errors; and when backend requests fail, users see readable error messages (with retry where applicable) instead of silent failures—while signed-in actions work end-to-end and signed-out attempts show clear authentication-required errors.
