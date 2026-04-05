# Disaster Management System
## Relational Database Schema

---

## 1. DISASTER

### Attributes

| Attribute | Type (Suggested) | Constraint |
|-----------|------------------|-----------|
| disaster_id | INT | Primary Key |
| disaster_type | VARCHAR | NOT NULL |
| severity_level | VARCHAR | NOT NULL |
| start_date | DATE | NOT NULL |

### Constraints
- **Primary Key:** disaster_id

---

## 2. AREA

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| area_id | INT | Primary Key |
| area_name | VARCHAR | NOT NULL |
| district | VARCHAR |  |
| state | VARCHAR |  |
| population | INT |  |
| latitude | DECIMAL |  |
| longitude | DECIMAL |  |

### Constraints
- **Primary Key:** area_id

---

## 3. AFFECTED_AREA

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| affected_id | INT | Primary Key |
| disaster_id | INT | Foreign Key |
| area_id | INT | Foreign Key |
| severity_score | DECIMAL |  |
| last_assistance_date | DATE |  |

### Constraints
- **Primary Key:** affected_id  
- **Foreign Keys:**
  - disaster_id → DISASTER(disaster_id)
  - area_id → AREA(area_id)

### Relationships
- **DISASTER (1) → (N) AFFECTED_AREA**
- **AREA (1) → (N) AFFECTED_AREA**

---

## 4. DISASTER_HISTORY

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| id | INT | Primary Key |
| area_id | INT | Foreign Key |
| disaster_type | VARCHAR |  |
| severity_level | VARCHAR |  |
| year | YEAR |  |

### Constraints
- **Primary Key:** id  
- **Foreign Key:** area_id → AREA(area_id)

### Relationship
- **AREA (1) → (N) DISASTER_HISTORY**

---

## 5. WEATHER_DATA

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| id | INT | Primary Key |
| rainfall | DECIMAL |  |
| humidity | DECIMAL |  |
| wind_speed | DECIMAL |  |
| temperature | DECIMAL |  |
| observation_date | DATE |  |
| area_id | INT | Foreign Key |

### Constraints
- **Primary Key:** id  
- **Foreign Key:** area_id → AREA(area_id)

### Relationship
- **AREA (1) → (N) WEATHER_DATA**

---

## 6. RISK_PREDICTION

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| id | INT | Primary Key |
| risk_score | DECIMAL |  |
| predicted_disaster_type | VARCHAR |  |
| predicted_date | DATE |  |
| confidence_level | DECIMAL |  |
| area_id | INT | Foreign Key |

### Constraints
- **Primary Key:** id  
- **Foreign Key:** area_id → AREA(area_id)

### Relationship
- **AREA (1) → (N) RISK_PREDICTION**

---

## 7. PRIORITY_LEVEL

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| priority_id | INT | Primary Key |
| level_name | VARCHAR |  |
| weight_score | INT |  |

### Constraints
- **Primary Key:** priority_id

---

## 8. RESOURCE_TYPE

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| resource_id | INT | Primary Key |
| resource_name | VARCHAR | NOT NULL |
| unit_of_measurement | VARCHAR |  |

### Constraints
- **Primary Key:** resource_id

---

## 9. AREA_REQUEST

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| request_id | INT | Primary Key |
| area_id | INT | Foreign Key |
| resource_id | INT | Foreign Key |
| prediction_id | INT | Foreign Key |
| priority_id | INT | Foreign Key |
| requested_quantity | INT |  |
| request_date | DATE |  |
| request_status | VARCHAR |  |

### Constraints
- **Primary Key:** request_id  
- **Foreign Keys:** - area_id → AREA(area_id)  
  - resource_id → RESOURCE_TYPE(resource_id)
  - prediction_id → RISK_PREDICTION(id)
  - priority_id → PRIORITY_LEVEL(priority_id)

### Relationships
- **AREA (1) → (N) AREA_REQUEST** - **RESOURCE_TYPE (1) → (N) AREA_REQUEST**
- **RISK_PREDICTION (1) → (N) AREA_REQUEST**
- **PRIORITY_LEVEL (1) → (N) AREA_REQUEST**

---

## 10. RELIEF_CENTER

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| center_id | INT | Primary Key |
| location | VARCHAR |  |
| storage_capacity | INT |  |

### Constraints
- **Primary Key:** center_id

---

## 11. INVENTORY

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| center_id | INT | Primary Key, Foreign Key |
| resource_id | INT | Primary Key, Foreign Key |
| available_quantity | INT |  |
| reserved_buffer_quantity | INT |  |

### Constraints
- **Primary Key:** (center_id, resource_id)  
- **Foreign Keys:** - center_id → RELIEF_CENTER(center_id)  
  - resource_id → RESOURCE_TYPE(resource_id)

### Relationships
- **RELIEF_CENTER (1) → (N) INVENTORY** - **RESOURCE_TYPE (1) → (N) INVENTORY**

---

## 12. ALLOCATION

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| allocation_id | INT | Primary Key |
| allocation_date | DATE |  |
| allocated_quantity | INT |  |
| request_id | INT | Foreign Key |
| center_id | INT | Foreign Key |

### Constraints
- **Primary Key:** allocation_id  
- **Foreign Keys:** - request_id → AREA_REQUEST(request_id)  
  - center_id → RELIEF_CENTER(center_id)

### Relationships
- **AREA_REQUEST (1) → (N) ALLOCATION** - **RELIEF_CENTER (1) → (N) ALLOCATION**

---

## 13. DISPATCH

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| dispatch_id | INT | Primary Key |
| dispatch_date | DATE |  |
| expected_delivery_date | DATE |  |
| allocation_id | INT | Foreign Key |

### Constraints
- **Primary Key:** dispatch_id  
- **Foreign Key:** allocation_id → ALLOCATION(allocation_id)

### Relationship
- **ALLOCATION (1) → (N) DISPATCH**

---

## 14. DELIVERY_REPORT

### Attributes

| Attribute | Type | Constraint |
|----------|------|-----------|
| id | INT | Primary Key |
| received_quantity | INT |  |
| delivery_date | DATE |  |
| dispatch_id | INT | Foreign Key |

### Constraints
- **Primary Key:** id  
- **Foreign Key:** dispatch_id → DISPATCH(dispatch_id)

### Relationship
- **DISPATCH (1) → (1) DELIVERY_REPORT**


---