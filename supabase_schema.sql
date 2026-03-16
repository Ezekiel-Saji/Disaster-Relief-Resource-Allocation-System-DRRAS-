-- SQL DDL for Disaster Relief Resource Allocation System (DRRAS)

-- 1. DISASTER
CREATE TABLE disasters (
    disaster_id SERIAL PRIMARY KEY,
    disaster_type VARCHAR(255) NOT NULL,
    severity_level VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AFFECTED_AREA
CREATE TABLE affected_areas (
    area_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    population INT NOT NULL,
    last_assistance_date DATE,
    severity_score DECIMAL(4,2),
    disaster_id INT REFERENCES disasters(disaster_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RESOURCE_TYPE
CREATE TABLE resource_types (
    resource_id SERIAL PRIMARY KEY,
    resource_name VARCHAR(255) NOT NULL,
    unit_of_measurement VARCHAR(100),
    priority_level INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AREA_REQUEST
CREATE TABLE area_requests (
    request_id SERIAL PRIMARY KEY,
    request_date DATE DEFAULT CURRENT_DATE,
    requested_quantity INT NOT NULL,
    request_status VARCHAR(50) DEFAULT 'Pending',
    urgency VARCHAR(50) DEFAULT 'Medium',
    area_id INT REFERENCES affected_areas(area_id) ON DELETE CASCADE,
    resource_id INT REFERENCES resource_types(resource_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RELIEF_CENTER
CREATE TABLE relief_centers (
    center_id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    storage_capacity INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INVENTORY
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    available_quantity INT DEFAULT 0,
    reserved_buffer_quantity INT DEFAULT 0,
    center_id INT REFERENCES relief_centers(center_id) ON DELETE CASCADE,
    resource_id INT REFERENCES resource_types(resource_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ALLOCATION
CREATE TABLE allocations (
    allocation_id SERIAL PRIMARY KEY,
    allocation_date DATE DEFAULT CURRENT_DATE,
    allocated_quantity INT NOT NULL,
    request_id INT REFERENCES area_requests(request_id) ON DELETE CASCADE,
    center_id INT REFERENCES relief_centers(center_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DISPATCH
CREATE TABLE dispatches (
    dispatch_id SERIAL PRIMARY KEY,
    dispatch_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    allocation_id INT REFERENCES allocations(allocation_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. DELIVERY_REPORT
CREATE TABLE delivery_reports (
    id SERIAL PRIMARY KEY,
    received_quantity INT NOT NULL,
    delivery_date DATE DEFAULT CURRENT_DATE,
    dispatch_id INT REFERENCES dispatches(dispatch_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. WEATHER_DATA
CREATE TABLE weather_monitoring (
    id SERIAL PRIMARY KEY,
    rainfall VARCHAR(50),
    humidity VARCHAR(50),
    wind_speed VARCHAR(50),
    temperature VARCHAR(50),
    observation_date DATE DEFAULT CURRENT_DATE,
    area_id INT REFERENCES affected_areas(area_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. DISASTER_HISTORY
CREATE TABLE disaster_history (
    id SERIAL PRIMARY KEY,
    area_id INT REFERENCES affected_areas(area_id) ON DELETE CASCADE,
    disaster_type VARCHAR(255),
    severity_level VARCHAR(50),
    year INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. RISK_PREDICTION
CREATE TABLE risk_predictions (
    id SERIAL PRIMARY KEY,
    risk_score DECIMAL(5,2),
    predicted_disaster_type VARCHAR(255),
    predicted_date DATE,
    confidence_level DECIMAL(5,2),
    area_id INT REFERENCES affected_areas(area_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
