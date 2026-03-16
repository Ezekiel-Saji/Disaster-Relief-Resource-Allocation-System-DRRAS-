# Full System Architecture & Layout Plan
## Disaster Relief Resource Allocation System (DRRAS)

This document outlines the interconnected structure of the Frontend, Backend, and Database, incorporating role-based dashboards, detailed page layouts, and the visual aesthetics needed to build the platform.

---

## 1. High-Level Architecture
The system follows a modern and modular 3-tier architecture.

* **Frontend (Presentation Layer):** Next.js (React), Tailwind CSS. Handled statically + client-side routing.
* **Backend (Application Layer):** Node.js (Express) or Python (FastAPI/Django) offering RESTful JSON endpoints.
* **Database (Data Layer):** Relational DB (MySQL / PostgreSQL) strictly adhering to the normalized schemas.using supabase for the database

---

## 2. Global UI & Theming

The application will use a persistent **Top Navigation Bar** and a **Left Sidebar** for quick access. This structure ensures users can navigate rapidly during crises.

**Color Palette:**
* **Primary:** `Deep Blue (#1E88E5)` for trust and stability.
* **Emergency:** `Emergency Orange (#FF7043)` for alerts and primary actions.
* **Background:** `Soft Gray (#F3F4F6)` for reduced eye strain.
* **Cards/Panes:** `Pure White (#FFFFFF)` with soft drop-shadows (elevation) for high readability.

**Top Bar Components:**
* System Logo
* Global Search
* Notification Bell
* Emergency Alerts
* User Profile Dropdown

---

## 3. Role-Based Dashboards
The system serves three distinct roles. When a user logs in, their sidebar and main dashboard will adapt to show only what is relevant to their responsibilities.

### 🔴 Administrator (Full System Access)
The Admin has a macro-level view of the entire operation.
* **Sidebar Access:** All modules (Disasters, Areas, Centers, Inventory, Requests, Allocations, Dispatch, Analytics, Settings).
* **Main Dashboard View:**
  * **Top KPI Cards:** Active Disasters, Affected Areas, Pending Requests, Resources Allocated, Dispatches Today, Deliveries Completed.
  * **Disaster Map:** An interactive map showing all affected areas color-coded by risk (Red, Orange, Green).
  * **Global Activity Feed:** Live updates on floods, requests, allocations, and deliveries.

### 🟠 Relief Center Manager (Inventory & Logistics Focus)
The Center Manager focuses entirely on fulfilling requests and managing warehouse limits.
* **Sidebar Access:** Relief Centers, Inventory Management, Dispatch Tracking, Delivery Reports, Alert System.
* **Main Dashboard View:**
  * **Top KPI Cards:** Total Inventory, Reserved Buffer Health, Pending Dispatches, Incoming Area Requests.
  * **Inventory Alerts:** Immediate warnings for low stock levels.
  * **Dispatch Queue:** A priority list of approved allocations awaiting physical dispatch.

### 🟢 Area Officer (Ground Zero Focus)
The Area Officer needs to request supplies rapidly and track inbound aid.
* **Sidebar Access:** Affected Areas, Area Requests, Delivery Reports, Weather Monitoring, Risk Prediction.
* **Main Dashboard View:**
  * **Top KPI Cards:** Local Population Impact, Severity Score, Pending Requests, In-Transit Deliveries.
  * **Localized Map/Weather:** Focuses only on their assigned region, showing live weather trends and predicted risks.
  * **Request Status Tracker:** A quick-view timeline of their submitted requests (Pending → Approved → Dispatched → Delivered).

---

## 4. Module Mapping & Detailed Page Layouts

Each system module connects user views to specific backend operations managing core database tables.

### A. Core Management (`/disasters`, `/areas`, `/centers`)
* **Disaster Management:** Features an "Add Disaster" form (Type, Start Date, Severity). Below it, a data table lists all events with quick actions to View, Edit, or Delete. Mapped to the `DISASTER` table.
* **Affected Areas:** A master table displaying Area ID, Disaster, Population, and Severity Score. Clicking a row opens an Area Detail Panel containing live weather data and risk predictions. Mapped to `AFFECTED_AREA`.
* **Relief Centers:** A tabular view of all centers and their storage capacities. Drilling down shows center-specific inventory levels and dispatch history. Mapped to `RELIEF_CENTER`.

### B. Inventory & Logistics (`/inventory`, `/requests`, `/allocations`, `/dispatch`, `/deliveries`)
* **Inventory Management:** A master table showing Available vs Reserved Buffer stocks. It includes quick filters by center and resource type, alongside visual Stock Level charts. Mapped to `INVENTORY` & `RESOURCE_TYPE` tables.
* **Area Request Management:** An intuitive form for Area Officers to request specific resources and quantities. A tracking table shows request statuses (Pending, Approved, Allocated, Dispatched, Delivered). Mapped to `AREA_REQUEST`.
* **Allocation Management:** An Admin-only panel where they view pending requests side-by-side with available center resources, allowing them to instantly hit "Allocate Quantity". Mapped to `ALLOCATION`.
* **Dispatch Tracking:** A table displaying expected delivery dates with a visual map tracking the route from Center to Affected Area. Mapped to `DISPATCH`.
* **Delivery Reports:** A simple confirmation page to log actual received quantities against dispatched quantities. Mapped to `DELIVERY_REPORT`.

### C. AI, Analytics & Alerts (`/weather`, `/history`, `/predictions`, `/reports`)
* **Weather Monitoring:** Visual charts for Rainfall Trends, Temperature, Humidity, and Wind Speed. Mapped to `WEATHER_DATA`.
* **Risk Prediction & History:** Machine learning outputs predicting future disasters, displayed alongside a Risk Heatmap and Prediction Timeline. Disaster history tables serve as reference data. Mapped to `RISK_PREDICTION` & `DISASTER_HISTORY`.
* **Reports & Analytics:** A visual analytics dashboard containing charts for Resource Usage, Allocation Efficiency, and Delivery Success Rates.
* **Alert System:** Global toast notifications and a dedicated panel for High-Risk Predictions, Low Inventory, and Emergency Disasters.

---

## 5. Security and Connectivity Considerations
* **Authentication:** A JWT-based auth system tracking session state for User Roles (Admin, Manager, Officer). Role-Based Access Control (RBAC) middleware guarding API endpoints and frontend routes.
* **Database ORM:** To seamlessly connect the Node.js/Python backend to the relational schema, Prisma (Node) or SQLAlchemy (Python) is highly recommended.
* **API Structure:** Use a unified error handling logic so frontend components can display graceful "Failed to connect to backend/database" toast notifications.

---

## 6. Implementation Prerequisites / Details to Build the Website

To translate this plan into code, the following setup is required:

### Frontend Tooling
1. **Next.js 14+ (App Router):** Start the project using `npx create-next-app@latest` ensuring Tailwind CSS is enabled.
2. **UI Framework:** Integrate `shadcn/ui` for rapid, accessible, and customizable components (Tables, Inputs, Modals, Buttons).
3. **Data Visualization:** Install `recharts` for rendering the Weather Monitoring, Analytics, and Stock Level charts.
4. **Mapping:** Install `react-leaflet` and `leaflet` for the interactive disaster & dispatch route tracking maps.
5. **Icons:** Use `lucide-react` for standard UI iconography.

### Layout Wrappers
Establish component wrappers that handle the role-based conditional rendering:
* `src/components/layouts/DashboardLayout.tsx` (Handles global TopBar and Sidebar logic).
* Implement route guarding (`src/middleware.ts` in Next.js) to redirect users attempting to access endpoints outside their role bounds (e.g., an Area Officer visiting `/allocations`).

### Database Infrastructure
1. Initialize a PostgreSQL/MySQL database instance based strictly on the provided relational schema.
2. Draft SQL seed scripts or ORM seeders to populate initial lookup tables (like `RESOURCE_TYPE`) and test records to safely review the UI.
