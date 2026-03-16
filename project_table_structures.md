# Project Data Table Structures Analysis

This document provides a comprehensive overview of the data table structures used across the various pages of the Disaster Relief Resource Allocation System (DRRAS). It includes fields shown in the UI and their corresponding mappings to the database schema.

---

## 1. Disasters Table
**Page:** `/disasters`
**Description:** Tracks active and historical disaster events.

| UI Column | Data Field | Type | Description |
|-----------|------------|------|-------------|
| ID | `disaster_id` | INT | Unique identifier for the disaster. |
| Type | `disaster_type` | VARCHAR | Type of disaster (e.g., Flood, Earthquake). |
| Location | `location` | VARCHAR | Primary location affected by the disaster. |
| Severity | `severity_level` | ENUM | Intensity (Medium, High, Critical). |
| Start Date | `start_date` | DATE | Date when the disaster was recorded. |

> [!NOTE]
> The `location` field is used in the UI for clarity, while the database schema primarily links locations through the `AFFECTED_AREA` table.

---

## 2. Affected Areas Table
**Page:** `/areas`
**Description:** Monitors regions impacted by disasters and their current status.

| UI Column | Data Field | Type | Description |
|-----------|------------|------|-------------|
| Area Name | `name` | VARCHAR | Name of the affected sector or village. |
| Disaster | `disaster` | VARCHAR | Type of disaster currently impacting the area. |
| Population | `population` | INT | Number of people residing in the area. |
| Severity Score | `severity_score` | DECIMAL | 0-10 score representing impact magnitude. |
| Last Assistance | `last_assistance` | DATE | Date of most recent relief delivery. |

---

## 3. Delivery Reports Table
**Page:** `/deliveries`
**Description:** Logs confirmed receipts of resources at affected areas.

| UI Column | Data Field | Type | Description |
|-----------|------------|------|-------------|
| Report ID | `id` | INT | Unique identifier for the delivery report. |
| Dispatch ID | `dispatch_id` | INT | Link to the original dispatch record. |
| Received Qty | `received_quantity` | INT | Quantity of items successfully delivered. |
| Delivery Date | `delivery_date` | DATE | Date when delivery was completed. |

---

## 4. Resource Allocations Table
**Page:** `/allocations`
**Description:** Tracks the assignment of resources from relief centers to area requests.

| UI Column | Data Field | Type | Description |
|-----------|------------|------|-------------|
| Alloc ID | `allocation_id` | INT | Unique identifier for the allocation. |
| Request ID | `request_id` | INT | Link to the area's resource request. |
| Source Center | `center` | VARCHAR | Relief center providing the resources. |
| Quantity | `quantity` | INT | Number of units allocated. |
| Date | `date` | DATE | Date the allocation was authorized. |

---

## 5. Area Requests Table
**Page:** `/requests`
**Description:** Central log for resource requests submitted by ground officers.

| UI Column | Data Field | Type | Description |
|-----------|------------|------|-------------|
| Req ID | `request_id` | INT | Unique identifier for the request. |
| Area | `area` | VARCHAR | The area requiring resources. |
| Resource | `resource` | VARCHAR | Specific type of supply requested. |
| Quantity | `quantity` | INT | Amount needed. |
| Urgency | `urgency` | ENUM | Priority (Medium, High, Critical). |
| Date | `date` | DATE | Date the request was submitted. |
| Status | `status` | ENUM | Current stage (Pending, Approved, Allocated). |

---

## 6. Global Stock Inventory Table
**Page:** `/inventory`
**Description:** Real-time monitoring of resource levels across all relief centers.

| UI Column | Data Field | Type | Description |
|-----------|------------|------|-------------|
| Center | `center` | VARCHAR | Name of the relief center hub. |
| Resource | `resource` | VARCHAR | Type of stock item. |
| Available | `available` | INT | Quantity ready for immediate allocation. |
| Reserved | `reserved` | INT | Buffer stock kept for emergencies. |
| Trend | `trend` | STRING | Stock level movement (up, down, stable). |

---

## 7. Registered Centers Table
**Page:** `/centers`
**Description:** Catalog of supply distribution hubs and warehouses.

| UI Column | Data Field | Type | Description |
|-----------|------------|------|-------------|
| Center ID | `center_id` | INT | Unique identifier for the center. |
| Location | `location` | VARCHAR | Geographical area or hub name. |
| Storage Capacity (units) | `storage_capacity` | INT | Maximum items the center can hold. |

---

## 8. Active Dispatches Hub Table
**Page:** `/dispatch`
**Description:** Tracks the movement of resources from hubs to the field.

| UI Column | Data Field | Type | Description |
|-----------|------------|------|-------------|
| Disp. ID | `dispatch_id` | INT | Unique tracking ID for the shipment. |
| Alloc. ID | `allocation_id` | INT | Link to the verified resource allocation. |
| Dispatch Date | `dispatch_date` | DATE | Date the shipment left the center. |
| Exp. Delivery | `expected_delivery` | DATE | Estimated arrival date at destination. |
| Status | `status` | ENUM | Current state (In Transit, Delivered, Pending). |

---

## 9. Weather Monitoring Table
**Page:** `/weather`
**Description:** Real-time environmental data for disaster-prone areas.

| UI Column | Data Field | Type | Description |
|-----------|------------|------|-------------|
| Area | `area` | VARCHAR | Region where observation was recorded. |
| Rainfall | `rainfall` | VARCHAR | Amount of precipitation (e.g., 25mm). |
| Humidity | `humidity` | VARCHAR | Atmospheric moisture percentage. |
| Wind Speed | `wind` | VARCHAR | Velocity of wind (e.g., 30km/h). |
| Temp | `temp` | VARCHAR | Temperature recorded (e.g., 22°C). |
| Date | `date` | DATE | Date of the weather observation. |

---

## Database Schema Highlights
The project utilizes a relational structure defined in `database_schema.md`. Key entities include:
- **DISASTER**: Core disaster event data.
- **AFFECTED_AREA**: Details on specific regions linked to disasters.
- **RESOURCE_TYPE**: Catalog of relief supplies.
- **RELIEF_CENTER**: Locations where stock is managed.
- **AREA_REQUEST**: Requests originating from affected areas.
- **INVENTORY**: Stock levels per center and resource.
- **ALLOCATION / DISPATCH / DELIVERY_REPORT**: The full lifecycle of relief logistics.
