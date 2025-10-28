# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# DockFlow - Development Blueprint

DockFlow is a SaaS platform that replaces phone calls, emails and spreadsheets with a single synchronized system for scheduling, tracking and reporting warehouse dock visits. It provides carrier-facing booking links (no login), QR-based gate check-in, a live per-dock operations dashboard, automated visit histories, SLA/detention reporting, integrations with TMS/WMS, and role-based access for warehouse teams and admins.

## 1. Pages (UI Screens)

- Login / Signup Page  
  Purpose: Authentication entry for warehouse staff, managers and admins.  
  Key sections/components:
  - Email/password form (email, password, remember me, submit)
  - SSO Buttons (SAML/Okta/Google Workspace)
  - Magic link option (send login link)
  - Signup CTA with plan selection / upgrade copy
  - Links: Password Reset, Terms, Privacy
  - Rate-limit and error states, SSO status feedback

- User Profile Page  
  Purpose: Manage personal account and preferences.  
  Key sections/components:
  - Profile details form (name, email, phone, role/label)
  - Phone verification flow (SMS code)
  - Password management (change password with current password validation)
  - 2FA management (TOTP enable/disable; SMS toggle)
  - API Keys (generate/revoke; key metadata table) — admin/manager only
  - Notification preferences (email/SMS/push toggles & templates)
  - Activity & audit log (recent logins, sensitive changes)

- Password Reset Page  
  Purpose: Request and set a new password.  
  Key sections/components:
  - Request reset form (email)
  - Token entry / New password form (token, new password, confirm)
  - Password strength meter & guidance
  - Success and error confirmations

- Email Verification Page  
  Purpose: Confirm email addresses and guide next steps.  
  Key sections/components:
  - Verification status message (success/failure)
  - Resend verification button
  - CTA to proceed to Dashboard or Login

- Public Booking Page (Carrier Link)  
  Purpose: Mobile-first booking for carriers without login.  
  Key sections/components:
  - Header with warehouse name & short instructions
  - Warehouse & Dock selector (prefilled when link-specific)
  - Calendar/slot picker (mobile-first, capacity displayed)
  - Booking form (carrier name, trailer/plate, ETA, pallets, ADR, temp, contact phone/email)
  - Terms & declarations checkboxes (hazmat, tailgate, special equipment)
  - Payment prompt if required (per-booking fee)
  - Confirmation screen with QR code, printable ticket, booking ref
  - SMS/email send widget and modify/cancel short-lived token link

- Operations Dashboard (Warehouse)  
  Purpose: Primary workspace for operations managers to visualize and control real-time dock activity.  
  Key sections/components:
  - Top nav: warehouse selector, date/time range, quick filters, user menu
  - Live calendar grid: docks as columns, times as rows, bookings as colored blocks
  - List view panel: chronological arrivals with search and filters
  - Gate check-in widget: QR scanner, manual plate entry
  - Ramp assignment panel: assign/lock ramp, set priority
  - Activity feed & notifications (real-time)
  - SLA & KPIs bar (average detention, on-time %, utilization)
  - Bulk actions toolbar (reassign, reschedule, notify)

- Schedule / Calendar Page  
  Purpose: Full schedule management, slot creation and drag/drop rescheduling.  
  Key sections/components:
  - View modes: day, week, month, list
  - Filter bar (dock, carrier, cargo tags, ADR, status)
  - Calendar grid with drag-and-drop booking blocks
  - Slot creation/edit modal (rules, capacity, recurrence)
  - Conflict highlighting & resolution assistant
  - Export button (CSV/Excel/PDF)

- Gate Check-In Page (Tablet/Mobile)  
  Purpose: Simple gate workflow for QR scanning and status updates.  
  Key sections/components:
  - Camera viewfinder with QR detection & manual plate input
  - Booking summary card (ref, trailer, carrier, cargo declarations)
  - Status transition buttons (Arrived, Waiting, In Progress, Completed, Cancelled)
  - Timestamp & notes logger (auto timestamps)
  - Photo capture & document upload
  - Quick assign ramp button

- Visit Detail Page  
  Purpose: Comprehensive record of a visit for analysis, billing and disputes.  
  Key sections/components:
  - Visit header: ref, status, assigned ramp, carrier
  - Timeline: booked, arrived, assigned, start, end, each with timestamps and actor
  - Planned vs actual comparison and delay analysis (variance)
  - Files & photos gallery with previews
  - Actions: add note, tag cause code, create dispute, export PDF

- Analytics & Reports  
  Purpose: Reporting center for operational KPIs and exports.  
  Key sections/components:
  - Report templates (detention, utilization, SLA compliance)
  - Custom report builder (metrics, grouping, filters)
  - Visualization panel (charts, heatmaps, histograms)
  - Export & schedule (CSV, PDF, Excel, email/SFTP scheduling)
  - Saved reports list with share controls & access rules

- Settings & Preferences  
  Purpose: Warehouse-level configuration and integrations.  
  Key sections/components:
  - Warehouse config (address, hours, public booking link)
  - Docks list (add/edit docks, coordinates, capabilities)
  - Slot rules (duration, buffer, overbooking policy)
  - Users & roles (invite, set permissions)
  - Integrations: webhooks, API keys, SSO config, TMS connectors
  - Notification templates & sender settings
  - Retention & audit policy settings

- About & Help Page  
  Purpose: Documentation and support resources.  
  Key sections/components:
  - FAQ, getting-started guides, video walkthroughs
  - Searchable help articles
  - Contact/support form (attach logs)
  - Links to API docs and changelog

- Admin Dashboard (Platform)  
  Purpose: SaaS operator or multi-warehouse admin controls.  
  Key sections/components:
  - Customer accounts list (status, usage, billing)
  - System health & job queue status
  - Billing & invoices management (Stripe)
  - Global audit logs and security events
  - Feature flags & release controls

- Pricing & Checkout Page  
  Purpose: Subscription management and billing checkout.  
  Key sections/components:
  - Plan cards with feature lists and limits
  - Checkout form (billing details, card, promo)
  - Invoice history and usage meter (bookings used vs quota)
  - Upgrade/downgrade flows and proration messaging

- Legal Pages  
  Purpose: Legal content and acceptance records.  
  Key sections/components:
  - Privacy Policy, Terms of Service, Cookie Policy
  - Effective date/version display
  - Download/accept buttons and acceptance audit

- Error & Status Pages  
  Purpose: Handle app errors and long operations.  
  Key sections/components:
  - 404 Not Found page with search / nav back
  - 500 Server Error page with support contact
  - Loading spinners and operation success banners

- Landing Page (Marketing)  
  Purpose: Public marketing and CTA for demos, signup, carrier booking link entry.  
  Key sections/components:
  - Hero with CTAs (Request Demo, Sign Up, Book Now)
  - Features overview and icons
  - How it works 3–4 step visuals
  - Pricing teaser and testimonials
  - Footer with links to legal, contact, social

## 2. Features

- User Authentication  
  Technical details:
  - JWT access + refresh tokens; refresh token rotation; revoke list for logout-all-devices
  - Password hashing with Argon2 / bcrypt, password policy enforcement
  - SSO via SAML / OAuth2 (Okta, Azure AD, Google Workspace) with SCIM provisioning optional
  - Magic-link authentication endpoint (one-time token, short expiry)
  - Email verification, rate-limiting, brute-force protection, login attempt alerts
  Implementation notes:
  - Central auth service (microservice or module) exposing token APIs
  - Use secure cookies for browser flows + Authorization header for APIs
  - Audit log all critical auth events

- Public Booking Flow (Carrier)  
  Technical details:
  - Anonymous booking endpoints returning booking token and modify/cancel tokens (signed)
  - Slot availability engine considering capacity, buffers and overbooking policy
  - Optimistic booking lock (short-lived reservation), server-side validation for commit
  - Signed QR payloads (HMAC or JWT) with expiry
  - SMS/Email confirmation via provider templates (SendGrid/Twilio)
  Implementation notes:
  - Rate-limit public endpoints and CAPTCHAs to prevent abuse
  - Ensure mobile-first responsive UI and progressive enhancement for offline or weak connectivity
  - Validate ADR and cargo fields with strong input sanitization

- QR & Gate Check-In  
  Technical details:
  - QR contains booking token signed with server key; optionally include visit ID, short expiry
  - Real-time updates via WebSockets or Ably/Pusher to dashboards and gate devices
  - Camera-based browser QR scanning with fallback manual plate entry + OCR integration
  - Offline queueing on gate devices; local storage of event queue with exponential retry/resync and conflict reconciliation
  Implementation notes:
  - Implement gate device client with retryable POST queue and idempotency keys
  - Role-based permissions for allowed status transitions; enforce on server
  - Tamper-proof server timestamps and audit entries for arrivals and status changes

- Dock Calendar & Scheduling Engine  
  Technical details:
  - Timezone-aware scheduling (store in UTC with zone offset metadata)
  - Slot rules engine: duration, buffer, capacity, recurring slots and exceptions
  - Server-side conflict detection and suggestive resolutions (alternative slots)
  - Virtualized client rendering for large datasets (e.g., react-virtualized)
  Implementation notes:
  - Endpoints for drag/drop with optimistic UI; server validates and returns authoritative state
  - Background jobs to recompute aggregates on schedule changes
  - Undo stack for client-side operations with server reconciliation

- Ramp Assignment & Workflow  
  Technical details:
  - Transactional assignment API ensuring single-assignment constraints
  - Priority rules engine, manual override flows and audit trail
  - Real-time push of assignments to gate tablets and floor staff
  Implementation notes:
  - Use database transactions or optimistic locking (row versioning) to avoid race conditions
  - Expose assignment events via webhooks for external systems

- Analytics, Reports & Export  
  Technical details:
  - Materialized views or precomputed aggregates for heavy queries (detention minutes, utilization heatmaps)
  - Custom report builder storing report definitions; scheduled job runner to generate & deliver reports
  - Export formats: CSV, Excel, PDF; secure storage of generated files in S3 with signed URLs
  Implementation notes:
  - Query pagination and limits for large date ranges
  - RBAC checks for report access and scheduled deliveries

- Integrations & Webhooks  
  Technical details:
  - REST API with OAuth2 client credentials for third-party systems
  - Webhooks with signing (HMAC), retry/backoff strategy and delivery logs
  - Prebuilt connectors and templates for SFTP, ICS (iCal) export, and common WMS/TMS mappings
  Implementation notes:
  - Provide webhook dashboard for endpoints, deliveries, and test payloads
  - Throttle outbound integrations and surface integration health in Admin UI

- Notifications & Reminders  
  Technical details:
  - Templated email/SMS with variable substitution, transactional provider integration
  - Scheduling engine to fire reminders (e.g., 24h, 2h before) and immediate notifications on status changes
  - Push notifications via APNs/FCM for mobile apps
  Implementation notes:
  - Maintain delivery tracking metadata and retry queues
  - Allow per-warehouse and per-user preference overrides; GDPR-compliant unsubscribe handling

- Audit & Compliance  
  Technical details:
  - Append-only event store for bookings and status transitions; tamper-evident checksums or chained hashes optional
  - Schema versioning for events; retention policy configurable per-tenant
  - Fast queryable indices for investigations and dispute exports
  Implementation notes:
  - Provide audit export bundles (visit + timeline + files) with admin access control
  - Secure logs and backups with encryption at rest

## 3. User Journeys

- Carrier (Anonymous) — Book a Slot  
  1. Receive public booking link via client or QR on paperwork.  
  2. Open link (mobile). Warehouse prefilled if encoded.  
  3. Select dock/time from calendar/slot picker (availability & capacities shown).  
  4. Fill booking form: carrier name, trailer/plate, ETA, cargo details, contact phone/email, ADR declarations.  
  5. Accept terms and submit. Booking engine reserves slot (optimistic lock).  
  6. System confirms booking: shows QR/ticket, booking ref, modify/cancel short-lived links; sends SMS/email with signed tokens.  
  7. Optionally modify/cancel via tokenized link before expiry.

- Driver Arrival & Gate Check-In (Carrier)  
  1. Driver arrives and presents QR or booking ref.  
  2. Gate device scans QR or operator enters plate (OCR fallback).  
  3. Gate app verifies booking token and posts "Arrived" event. Timestamp stored and pushed to dashboards via realtime channel.  
  4. Operator assigns ramp; statuses progress to Waiting → In Progress → Completed. Each action logs timestamp and actor.  
  5. After completion, visit timeline available for exports/invoice disputes.

- Warehouse Operations Manager — Daily Workflow  
  1. Login via email/SSO. Select warehouse.  
  2. View Operations Dashboard: live calendar, KPIs, incoming list.  
  3. Monitor arrivals and gate feed; assign ramps and resolve conflicts (reassign/reschedule as needed).  
  4. Use drag-drop in Schedule page for rescheduling or create ad-hoc slots.  
  5. Receive automated reminders and escalate delays.  
  6. Review Visit Details for delay analysis and create dispute claims or billing notes.  
  7. Export daily reports or view analytics for utilization and detention minutes.

- Warehouse Admin — Setup & Integrations  
  1. Login via SSO/admin account. Configure warehouse hours, public booking link and docks.  
  2. Define slot rules (durations, buffers, allowed cargo).  
  3. Invite users, assign roles and set permissions.  
  4. Configure integrations (webhooks, TMS connectors, Twilio, SendGrid, Stripe).  
  5. Schedule reports and set retention/audit policies.

- Platform Admin — SaaS Management  
  1. Login to Admin Dashboard. Monitor customer list and system health.  
  2. Manage billing, subscription tiers and seat allocations.  
  3. Inspect global audit logs and run support actions (impersonate tenant for debugging, with strict auditing).  
  4. Roll out or toggle feature flags and manage releases.

## 4. UI Guide

Implementation notes: Follow the Visual Style section exactly across all pages. Provide components in a reusable design system and make tokens available (colors, spacing, typography, border radii).

---

Visual Style

### Color Palette:
- Primary: Bright Coral Red (#FF4C4C) for highlights, buttons, graphs, and key accents.
- Secondary: Medium Gray (#F6F6F8) for backgrounds and card surfaces.
- Accent: Light Gray (#E9EAED) for borders and dividers.
- Black/Gray: Dark Gray (#222222) for headings; Medium Gray (#888888) for secondary text.
- White: #FFFFFF dominant background.
- Relationships: Red reserved for actionable/high-attention elements (buttons, active states).

### Typography & Layout:
- Font Family: Modern sans-serif (Inter / SF Pro style).
- Weights: 400 body, 500 medium, 700 headings.
- Hierarchy: Large headlines for key metrics; bold numeric KPIs.
- Spacing: 16–24px consistent gaps.
- Alignment: Left-aligned text, center-aligned key metrics.
- Treatments: Uppercase for section labels; red for emphasis.

### Key Design Elements

- Card Design:
  - Rounded corners: 16px radius.
  - Subtle drop shadow: #00000012.
  - Hover: slightly stronger shadow and brighter background.
  - Title/metrics top; actions bottom-right.

- Navigation:
  - Left vertical sidebar; pill-shaped active state filled coral red; inactive gray.
  - Collapsible sections indicated by subtle arrows.

- Data Visualization:
  - Charts: coral-red lines, minimal gridlines, dots for points.
  - Progress bars: animated, red fill with overlaying metrics.
  - Patterns: stat cards, mini inline charts, large KPIs.

- Interactive Elements:
  - Buttons: pill, filled coral red with white text; outlined secondary variants.
  - Forms: rounded inputs, light-gray backgrounds, red focus ring.
  - Hover: brighter buttons; card elevation.
  - Micro-interactions: animated counters and chart transitions.

### Design Philosophy
- Modern, minimalist SaaS aesthetic focused on clarity, whitespace, and rapid decision-making for logistics teams.
- Visuals emphasize approachability, trustworthiness and operational control.

---

Implementation Notes:
Apply the design system consistently. All components, pages and elements must use the specified color palette, typography, spacing and visual rules. Export a Figma component library and code tokens (CSS variables / design tokens) to ensure parity between design and implementation.

## Instructions to AI Development Tool

After every development step:
- Refer back to this blueprint and verify the implemented pages, features and styling match the specification.
- Run a checklist: pages present, RBAC enforced, QR and booking tokens signed correctly, real-time channels test passing, offline gate queue tested for sync, exports generate signed S3 URLs, and audit logs are append-only.
- Verify accessibility basics (keyboard nav, aria labels on interactive components, color contrast for text).
- Ensure all external integrations (SendGrid/Twilio/Stripe/Map/OCR) are configured in staging with sandbox credentials and health checks.
- Before marking a feature as complete, run end-to-end flows for each user journey (carrier booking → QR generation → gate check-in → ramp assignment → completion → reporting).

Notes: Prioritize secure defaults (least privilege, encrypted secrets, HTTPS everywhere). Ensure tenancy boundaries for multi-warehouse customers and provide feature flags for phased rollout.

This blueprint, combined with the provided asset list and integrations, contains the end-to-end specifications needed to implement DockFlow.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
