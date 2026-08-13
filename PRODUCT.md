# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two roles, both non-technical:

- **Society admin / management committee member** — runs the monthly billing cycle for one residential society: registers buildings and flats, keeps owner/resident records, generates maintenance bills, records incoming payments, tracks common-area expenses, posts notices, and reviews collection/expense reports.
- **Resident (owner or tenant)** — logs in with just their flat number to see their own bills, outstanding dues, and payment history, without needing to ask the admin.

Eventually many societies will each run their own instance of this with their own data (multi-tenant), not just the one society currently seeded in mock data.

## Product Purpose

Lightweight maintenance and billing management for residential societies: track buildings/flats/residents, generate monthly maintenance bills (per-sqft or fixed rate), record payments, track society expenses by category, post notices, and view collection/expense reports. Give residents self-service visibility into their own dues and payment history so the admin isn't fielding one-off queries.

## Positioning

Does the core job (billing, dues tracking, notices) without the bloat, ads, or subscription overhead of commercial society-management apps (MyGate, NoBrokerHood, ADDA). The pitch is simplicity and being free/low-cost relative to those alternatives, not feature breadth or enterprise polish.

## Operating Context

- Admin runs a recurring monthly cycle: bulk-generate bills per flat (per-sqft rate or fixed amount, carrying forward prior pending dues), record payments as they arrive (Cash, UPI, Bank Transfer, Cheque), log common-area expenses (security, electricity, cleaning, lift maintenance, garden, repairs, etc.), post notices (AGM, maintenance interruptions, rule updates), and pull monthly collection-vs-expected and net-balance reports.
- Residents authenticate with only a flat number (e.g. `A-101`) — no self-registration, no password, no email verification flow today.
- Currency is INR (₹); flat-numbering and per-sqft maintenance-rate conventions follow Indian residential-society norms.

## Capabilities and Constraints

- React + Vite single-page app, one dark theme, no routing library (page switch via local state).
- **No backend yet.** All data (buildings, flats, residents, bills, payments, expenses, notices) lives in in-memory React state seeded from `src/data/mockData.js` — it resets on every page refresh. A real backend, persistence layer, and real authentication are a near-term constraint, not a permanent design choice — current admin auth (hardcoded password `admin123`) and resident auth (flat-number lookup, no password) are explicitly placeholder and must not be treated as acceptable for production.
- Multi-tenant data isolation (per-society accounts/data) is a future requirement not yet architected; avoid baking in single-tenant assumptions that would be expensive to unwind (e.g. global mutable state without a society/tenant boundary) when touching data flow.
- Backend stack, hosting, and auth approach are undecided.

## Brand Commitments

Product name **SocietyPro**, tagline "Society Maintenance Management System" (both from the login screen and `index.html` title). No logo beyond a generic favicon; no other confirmed brand assets.

## Evidence on Hand

All content (buildings, flats, resident names, bills, payments, expenses, notices) in `src/data/mockData.js` is fabricated demo data for one example society. Future work must not present it as real customer data, and must not fabricate additional "real" evidence (testimonials, customer logos, case studies) that hasn't been explicitly provided.

## Product Principles

1. Do the core job well and resist feature bloat — billing, dues, notices — that's what makes this simpler than the commercial alternatives it's positioned against.
2. Keep it approachable for non-technical volunteer committee members, not IT staff.
3. Residents get self-service visibility into their own bills and payments without depending on the admin.
4. Free/low-cost positioning relative to paid competitors — avoid design or feature choices that imply an enterprise price point.
5. Multi-tenancy is a committed future direction; don't assume the current single-society setup is permanent when it affects data architecture.
