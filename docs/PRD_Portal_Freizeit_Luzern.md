# Product Requirements Document (PRD)
## Portal Freizeit Luzern – Leisure Activities Platform

## 1. Overview

**Product Name:** Portal Freizeit Luzern  
**Type:** Web Application (Next.js MVP, expandable architecture)  
**Domain:** Government leisure activity management for children & youth programs  

The platform enables end-to-end management of leisure activities including discovery, registration, allocation, reporting, and administrative governance across structured seasonal “course-phases”.

It replaces an existing system that currently suffers from usability and performance issues during peak registration periods.

---

## 2. Goals & Objectives

### Primary Goals (MVP)
- Provide an intuitive system for parents to discover and register children for activities
- Enable instructors to easily create and manage activities and participants
- Enable administrators to manage activities, allocations, and operational workflows efficiently
- Ensure transparent and understandable allocation processes
- Improve usability of the current system significantly

### Secondary Goals (Post-MVP readiness)
- High scalability for peak registration loads
- Integration with accounting and payment providers
- Automated financial workflows (invoicing, payments, refunds)
- External authentication providers
- Email notification automation

---

## 3. Users & Roles

### Parents
- Manage one or more children
- Register children for activities
- View allocations, activity status, and updates

### Children
- Passive entity tied to a single parent account
- Participate in activities
- Store medical/emergency information

### Instructors
- Create and manage activities
- Manage participants
- Submit reports and expense data

### Administrators
- Full operational control
- Manage phases, allocations, CMS, reporting

---

## 4. Core Concepts

### Course-Phases
- Time-based lifecycle orchestration
- Only one active phase (MVP)
- Controls registration, allocation, reporting windows

### Activity Lifecycle
Draft → Published → Registration → Allocation → Execution → Reporting → Archived

### Registration Models
1. First-come-first-served (with waiting list)
2. Algorithm-based allocation (rules + overrides)

---

## 5. Functional Requirements

### User Management
- Internal authentication (MVP)
- Role-based access
- Parent-child relationship (1 parent per child)

### Activities
- Create/manage activities
- Media + documents
- Capacity + eligibility rules

### Registration
- Child registration
- Waiting lists
- Friend/group requests

### Allocation
- FCFS or algorithm-based
- Admin override
- Audit logs

### Reporting
- Attendance
- Expenses
- Evaluations
- Exportable reports

### CMS
- News + info pages
- Seasonal campaigns
- Activity content

### Holiday Pass
- Immediate payment (future integration ready)
- Document generation
- Refund handling support

---

## 6. Non-Functional Requirements

- High peak performance
- WCAG 2.2 AA
- Secure sensitive data storage
- Role-based permissions
- German + optional English

---

## 7. Integrations (Future)

- Authentication providers
- Accounting system
- Payment provider
- Email provider

---

## 8. Out of Scope (MVP)

- Payment processing
- Accounting automation
- Email automation
- External auth providers
