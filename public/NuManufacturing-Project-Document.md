# NuManufacturing – Fire Tech System
## Project Requirements & Development Timeline

---

# PART 1: DETAILED FIELD USAGE SCENARIO (TECHNICIAN-FOCUSED)

## Introduction – Purpose of This Document

This document describes, step by step, a fire maintenance technician's entire workday: from starting the day in the morning, performing on-site maintenance, handling critical findings, and completing reports at the end of the day.

### Goals:
- Rapid onboarding of field technicians
- Clear demonstration of real-world usage for customers
- A reference document for audits and training

---

## 1. Morning Start – My Today Dashboard

The technician starts the day by logging into the NuManufacturing portal from a mobile phone or tablet. The first screen shown is the "My Today" dashboard.

This page provides a complete overview of the technician's day:
- Scheduled maintenance visits for today
- Assigned open nonconformities (NCs)
- Critical priority tasks

*[SCREENSHOT / UI WIREFRAME PLACEHOLDER: My Today – technician dashboard]*

---

## 2. Arriving On Site & Starting the Visit

Upon arrival at the facility, the technician taps the "Start" button next to the scheduled visit on the My Today page.

This action opens the QR scanning workflow or directly navigates to the relevant asset selection screen.

*[SCREENSHOT / UI WIREFRAME PLACEHOLDER: My Today – start maintenance visit]*

---

## 3. QR Code Scanning – Asset Identification

Each fire protection asset is labeled with a unique QR code. The technician:

1. Opens the QR scan screen
2. Points the camera at the QR code
3. The system automatically identifies the asset
4. The correct checklist opens instantly

This eliminates the risk of inspecting the wrong equipment.

*[SCREENSHOT / UI WIREFRAME PLACEHOLDER: QR scanner – asset identification]*

---

## 4. Checklist Execution – Fast & Reliable

The checklist runner is optimized for fast field usage. The technician:
- Selects PASS or FAIL for each item
- Enters numeric values when required
- Adds notes when necessary
- Uses the "All Pass" toggle for quick completion

*[SCREENSHOT / UI WIREFRAME PLACEHOLDER: Checklist runner – PASS / FAIL view]*

---

## 5. Critical FAIL & Photo Evidence Requirement

If a checklist item marked as Critical is set to FAIL, the system automatically enforces photo evidence.

The screen highlights:
- Red warning border
- "Evidence Required" badge
- Mandatory photo upload field

**The checklist cannot be submitted without evidence.**

*[SCREENSHOT / UI WIREFRAME PLACEHOLDER: Critical FAIL – mandatory photo evidence]*

---

## 6. Automatic Nonconformity (NC) Creation

Once the checklist is saved with proper evidence, the system automatically creates a Nonconformity (NC) record.

The NC:
- Is linked to the asset and visit
- Includes photos and descriptions
- Is assigned to responsible personnel

*[SCREENSHOT / UI WIREFRAME PLACEHOLDER: Automatic NC creation]*

---

## 7. Continuing With Other Assets

The technician repeats the same workflow for other fire assets within the same site. Each asset is tracked independently with a full maintenance history.

*[SCREENSHOT / UI WIREFRAME PLACEHOLDER: Multiple assets at the same site]*

---

## 8. Completing the Maintenance Visit

After all assets are inspected, the technician closes the maintenance visit.

The system:
- Summarizes results
- Lists open NCs
- Triggers the report and certificate generation process

*[SCREENSHOT / UI WIREFRAME PLACEHOLDER: Maintenance visit completion]*

---

## 9. Automatic Report & Certificate Generation

Upon visit completion, the system automatically generates:
- Maintenance report
- Legally compliant certificate

Documents are produced as PDFs and include QR codes for traceability.

*[SCREENSHOT / UI WIREFRAME PLACEHOLDER: Generated certificate PDF]*

---

## 10. Notifications & End of Day

After completion:
- Customers receive WhatsApp and email notifications
- Responsible parties are notified about open NCs

At the end of the day, the technician can review:
- Completed visits
- Outstanding NCs from a single screen

*[SCREENSHOT / UI WIREFRAME PLACEHOLDER: WhatsApp notification examples]*

---

## 11. Conclusion – Benefits for Technicians

With this system, technicians:
- Eliminate paperwork
- Complete inspections faster
- Reduce human error
- Work with fully digital, auditable records

---

---

# PART 2: DEVELOPMENT TIMELINE

## Technology Stack
- **Backend:** ERPNext (Core features + Customization)
- **Frontend:** Lovable AI (React-based UI)

---

## Phase 1: Foundation & Setup (2-3 weeks)

### ERPNext Setup
| Task | Duration |
|------|----------|
| ERPNext instance configuration | 3-4 days |
| Custom DocTypes (Assets, Visits, NCs) | 4-5 days |
| User roles & permissions | 2-3 days |

### Lovable UI Shell
| Task | Duration |
|------|----------|
| Authentication flow | 2-3 days |
| Navigation structure | 2 days |
| Theme & design system | 2 days |

---

## Phase 2: Core Workflows (4-5 weeks)

### My Today Dashboard
| Task | Duration |
|------|----------|
| Scheduled visits display | 2-3 days |
| Open NCs list | 2 days |
| Priority indicators | 1-2 days |

### QR Scanning & Asset ID
| Task | Duration |
|------|----------|
| Camera integration | 2-3 days |
| Asset lookup API | 2 days |
| Checklist auto-load | 2 days |

### Checklist Runner
| Task | Duration |
|------|----------|
| Pass/Fail interface | 3-4 days |
| Numeric inputs | 2 days |
| Notes field | 1 day |
| "All Pass" toggle | 1 day |

### Critical Fail + Evidence
| Task | Duration |
|------|----------|
| Photo capture | 2-3 days |
| Evidence validation | 2 days |
| Red warning UI | 1 day |

### Auto NC Creation
| Task | Duration |
|------|----------|
| NC DocType integration | 2-3 days |
| Photo attachment | 2 days |
| Assignment logic | 2 days |

---

## Phase 3: Reports & Notifications (2-3 weeks)

### PDF Generation
| Task | Duration |
|------|----------|
| Report template | 3-4 days |
| Certificate template | 3-4 days |
| QR code embedding | 2 days |

### Notifications
| Task | Duration |
|------|----------|
| WhatsApp integration | 3-4 days |
| Email notifications | 2-3 days |
| Trigger configuration | 2 days |

---

## Phase 4: Testing & Polish (2 weeks)

| Task | Duration |
|------|----------|
| Field testing | 4-5 days |
| Bug fixes | 3-4 days |
| Performance optimization | 2-3 days |
| User training materials | 2-3 days |

---

## Total Timeline Summary

| Phase | Duration |
|-------|----------|
| Phase 1: Foundation | 2-3 weeks |
| Phase 2: Core Workflows | 4-5 weeks |
| Phase 3: Reports & Notifications | 2-3 weeks |
| Phase 4: Testing & Polish | 2 weeks |
| **TOTAL** | **10-13 weeks** |

---

## Notes

- The existing Lovable prototype covers ~40% of UI work
- Timeline assumes 1-2 developers working full-time
- ERPNext customization may require ERPNext developer expertise
- WhatsApp Business API requires Meta approval (can add 1-2 weeks)

---

## Current Prototype Status

The Lovable AI prototype already includes:
- ✅ Login screen with demo data reset
- ✅ My Today dashboard
- ✅ Job list with priority badges
- ✅ QR scanner with camera simulation
- ✅ Checklist runner (Pass/Fail/NA)
- ✅ Photo evidence capture
- ✅ Site map visualization
- ✅ Dark/Light theme toggle
- ✅ Job summary with completion stats

---

*Document Generated: January 2025*
*Project: NuManufacturing Fire Tech System*
