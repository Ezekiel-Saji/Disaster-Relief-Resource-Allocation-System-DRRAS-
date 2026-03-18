-- =============================================================================
-- DRRAS — Complete Database Schema
-- Disaster Relief Resource Allocation System
-- APJ Abdul Kalam Technological University | PCCST402 DBMS
-- Version 1.0 | March 2026
-- =============================================================================
-- Run this entire file in your Supabase SQL Editor.
-- Order follows the dependency chain from the Program Workflow Guide.
-- =============================================================================


-- =============================================================================
-- PHASE A — MASTER DATA (no FK dependencies)
-- =============================================================================

-- Step 1 — Priority Level lookup
CREATE TABLE IF NOT EXISTS priority_level (
    priority_id   SERIAL PRIMARY KEY,
    level_name    VARCHAR(50)  NOT NULL UNIQUE,
    weight_score  INT          NOT NULL  -- higher value = allocated first
);

-- Step 2 — Resource Type lookup
CREATE TABLE IF NOT EXISTS resource_type (
    resource_id          SERIAL PRIMARY KEY,
    resource_name        VARCHAR(255) NOT NULL,
    unit_of_measurement  VARCHAR(100) NOT NULL
);

-- Step 3 — Geographic Area master
CREATE TABLE IF NOT EXISTS area (
    area_id     SERIAL PRIMARY KEY,
    name        VARCHAR(255)     NOT NULL,
    district    VARCHAR(255),
    state       VARCHAR(255),
    population  INT,
    latitude    DECIMAL(9, 6),
    longitude   DECIMAL(9, 6),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- PHASE B — DISASTER REGISTRATION
-- =============================================================================

-- Step 4 — Disaster event (no FKs)
CREATE TABLE IF NOT EXISTS disaster (
    disaster_id    SERIAL PRIMARY KEY,
    disaster_type  VARCHAR(255) NOT NULL,
    severity       VARCHAR(50)  NOT NULL CHECK (severity IN ('Medium','High','Critical')),
    start_date     DATE         NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5 — Link areas to a disaster (FK → area + disaster)
CREATE TABLE IF NOT EXISTS affected_area (
    area_id               INT  NOT NULL REFERENCES area(area_id)         ON DELETE CASCADE,
    disaster_id           INT  NOT NULL REFERENCES disaster(disaster_id)  ON DELETE CASCADE,
    severity_score        DECIMAL(4,2) CHECK (severity_score BETWEEN 0 AND 10),
    last_assistance_date  DATE,          -- set to NULL; auto-updated by delivery trigger
    PRIMARY KEY (area_id, disaster_id)
);


-- =============================================================================
-- PHASE C — RELIEF CENTERS & INVENTORY
-- =============================================================================

-- Step 6a — Relief Center (no FKs)
CREATE TABLE IF NOT EXISTS relief_center (
    center_id        SERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    location         VARCHAR(255) NOT NULL,
    storage_capacity INT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6b — Inventory (FK → relief_center + resource_type)
--           Composite PK prevents duplicate stock per center+resource
CREATE TABLE IF NOT EXISTS inventory (
    center_id                 INT NOT NULL REFERENCES relief_center(center_id) ON DELETE CASCADE,
    resource_id               INT NOT NULL REFERENCES resource_type(resource_id) ON DELETE CASCADE,
    available_quantity        INT NOT NULL DEFAULT 0,
    reserved_buffer_quantity  INT NOT NULL DEFAULT 0,
    PRIMARY KEY (center_id, resource_id)
);


-- =============================================================================
-- PHASE D — REQUESTS & ALLOCATIONS
-- =============================================================================

-- Step 7 — Area Request (FK → area + resource_type + priority_level)
CREATE TABLE IF NOT EXISTS area_request (
    request_id        SERIAL PRIMARY KEY,
    area_id           INT NOT NULL REFERENCES area(area_id)             ON DELETE CASCADE,
    resource_id       INT NOT NULL REFERENCES resource_type(resource_id) ON DELETE CASCADE,
    priority_id       INT NOT NULL REFERENCES priority_level(priority_id),
    requested_quantity INT NOT NULL CHECK (requested_quantity > 0),
    request_status    VARCHAR(50) NOT NULL DEFAULT 'Pending'
                          CHECK (request_status IN ('Pending','Approved','Allocated','Delivered','Rejected','Cancelled')),
    request_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Step 8 — Allocation (FK → area_request + relief_center)
CREATE TABLE IF NOT EXISTS allocation (
    allocation_id      SERIAL PRIMARY KEY,
    request_id         INT NOT NULL REFERENCES area_request(request_id)  ON DELETE CASCADE,
    center_id          INT NOT NULL REFERENCES relief_center(center_id),
    allocated_quantity INT NOT NULL CHECK (allocated_quantity > 0),
    allocation_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- PHASE E — DISPATCH & DELIVERY
-- =============================================================================

-- Step 9 — Dispatch (FK → allocation)
CREATE TABLE IF NOT EXISTS dispatch (
    dispatch_id            SERIAL PRIMARY KEY,
    allocation_id          INT NOT NULL REFERENCES allocation(allocation_id) ON DELETE CASCADE,
    dispatch_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE NOT NULL,
    status                 VARCHAR(50) NOT NULL DEFAULT 'In Transit'
                               CHECK (status IN ('Pending','In Transit','Delivered')),
    created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Step 10 — Delivery Report (FK → dispatch)
CREATE TABLE IF NOT EXISTS delivery_report (
    report_id            SERIAL PRIMARY KEY,
    dispatch_id          INT NOT NULL REFERENCES dispatch(dispatch_id) ON DELETE CASCADE,
    received_quantity    INT NOT NULL CHECK (received_quantity >= 0),
    discrepancy          INT GENERATED ALWAYS AS (0) STORED,  -- computed by trigger / function
    verification_status  VARCHAR(20) NOT NULL DEFAULT 'Pending'
                             CHECK (verification_status IN ('Verified','Partial','Failed','Pending')),
    delivery_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Alter delivery_report to allow discrepancy to be set properly
-- (GENERATED columns can't be updated by triggers in all PG versions;
--  use a regular column instead)
ALTER TABLE delivery_report
    DROP COLUMN discrepancy;

ALTER TABLE delivery_report
    ADD COLUMN discrepancy INT;


-- =============================================================================
-- SEED DATA — Phase A (Steps 1–2)
-- =============================================================================

-- Priority Levels (Step 1)
INSERT INTO priority_level (level_name, weight_score) VALUES
    ('Low',      10),
    ('Medium',   20),
    ('High',     30),
    ('Critical', 40)
ON CONFLICT (level_name) DO NOTHING;

-- Resource Types (Step 2)
INSERT INTO resource_type (resource_name, unit_of_measurement) VALUES
    ('Food Kits',         'Kit'),
    ('Water Pallets',     'Pallet'),
    ('Medical Supplies',  'Box'),
    ('Tents',             'Unit')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- VIEWS
-- =============================================================================

-- View: allocations ready to be dispatched (not yet dispatched)
CREATE OR REPLACE VIEW v_ready_for_dispatch AS
SELECT
    al.allocation_id,
    al.request_id,
    al.center_id,
    al.allocated_quantity,
    al.allocation_date,
    rc.name        AS center_name,
    ar.area_id,
    a.name         AS area_name,
    rt.resource_name
FROM allocation al
JOIN area_request ar  ON ar.request_id  = al.request_id
JOIN relief_center rc ON rc.center_id   = al.center_id
JOIN area          a  ON a.area_id      = ar.area_id
JOIN resource_type rt ON rt.resource_id = ar.resource_id
WHERE al.allocation_id NOT IN (SELECT allocation_id FROM dispatch);


-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger 1: trg_prevent_duplicate_request
-- Fires BEFORE INSERT on area_request.
-- Blocks a second ACTIVE request for the same area + resource.
-- "Active" = any status except Delivered, Rejected, Cancelled.
-- Implements FR-10.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_check_duplicate_request()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM area_request
        WHERE area_id   = NEW.area_id
          AND resource_id = NEW.resource_id
          AND request_status NOT IN ('Delivered', 'Rejected', 'Cancelled')
    ) THEN
        RAISE EXCEPTION
            'Duplicate request blocked: an active request already exists for area_id=% and resource_id=%. '
            'Resolve or cancel the existing request before submitting a new one.',
            NEW.area_id, NEW.resource_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_prevent_duplicate_request
BEFORE INSERT ON area_request
FOR EACH ROW EXECUTE FUNCTION fn_check_duplicate_request();


-- -----------------------------------------------------------------------------
-- Trigger 2: trg_check_inventory_buffer
-- Fires BEFORE INSERT on allocation.
-- Aborts the allocation if dispatchable stock (available - reserved) < requested qty.
-- Implements FR-08.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_check_inventory_buffer()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    v_available  INT;
    v_reserved   INT;
    v_resource   INT;
BEGIN
    -- Get the resource_id from the linked request
    SELECT resource_id INTO v_resource
    FROM area_request WHERE request_id = NEW.request_id;

    -- Get current stock at the chosen center for that resource
    SELECT available_quantity, reserved_buffer_quantity
    INTO v_available, v_reserved
    FROM inventory
    WHERE center_id  = NEW.center_id
      AND resource_id = v_resource;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Inventory record not found for center_id=% and resource_id=%.', 
            NEW.center_id, v_resource;
    END IF;

    IF (v_available - v_reserved) < NEW.allocated_quantity THEN
        RAISE EXCEPTION
            'Insufficient dispatchable stock: available=%, reserved=%, dispatchable=%, requested=%. '
            'Choose a different center or reduce the allocated quantity.',
            v_available, v_reserved, (v_available - v_reserved), NEW.allocated_quantity;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_check_inventory_buffer
BEFORE INSERT ON allocation
FOR EACH ROW EXECUTE FUNCTION fn_check_inventory_buffer();


-- -----------------------------------------------------------------------------
-- Trigger 3: trg_deduct_inventory
-- Fires AFTER INSERT on allocation.
-- Subtracts allocated_quantity from inventory.available_quantity.
-- Implements FR-07.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_deduct_inventory()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    v_resource INT;
BEGIN
    SELECT resource_id INTO v_resource
    FROM area_request WHERE request_id = NEW.request_id;

    UPDATE inventory
       SET available_quantity = available_quantity - NEW.allocated_quantity
     WHERE center_id   = NEW.center_id
       AND resource_id = v_resource;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_deduct_inventory
AFTER INSERT ON allocation
FOR EACH ROW EXECUTE FUNCTION fn_deduct_inventory();


-- -----------------------------------------------------------------------------
-- Trigger 4: trg_set_request_allocated
-- Fires AFTER INSERT on allocation.
-- Sets area_request.request_status = 'Allocated'.
-- Implements FR-11.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_request_allocated()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE area_request
       SET request_status = 'Allocated'
     WHERE request_id = NEW.request_id;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_set_request_allocated
AFTER INSERT ON allocation
FOR EACH ROW EXECUTE FUNCTION fn_set_request_allocated();


-- -----------------------------------------------------------------------------
-- Trigger 5: trg_on_delivery_report
-- Fires AFTER INSERT on delivery_report.
-- (a) Sets dispatch.status = 'Delivered'.
-- (b) Updates affected_area.last_assistance_date for the relevant area.
-- Implements FR-16 and FR-17.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_on_delivery_report()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    v_allocation_id INT;
    v_request_id    INT;
    v_area_id       INT;
    v_alloc_qty     INT;
    v_discrepancy   INT;
    v_verification  VARCHAR(20);
BEGIN
    -- 1. Mark the dispatch as Delivered
    UPDATE dispatch
       SET status = 'Delivered'
     WHERE dispatch_id = NEW.dispatch_id;

    -- 2. Resolve the allocation → request → area chain
    SELECT d.allocation_id INTO v_allocation_id
    FROM dispatch d WHERE d.dispatch_id = NEW.dispatch_id;

    SELECT al.request_id, al.allocated_quantity INTO v_request_id, v_alloc_qty
    FROM allocation al WHERE al.allocation_id = v_allocation_id;

    SELECT ar.area_id INTO v_area_id
    FROM area_request ar WHERE ar.request_id = v_request_id;

    -- 3. Compute discrepancy and verification status
    v_discrepancy  := v_alloc_qty - NEW.received_quantity;

    IF NEW.received_quantity = 0 THEN
        v_verification := 'Failed';
    ELSIF v_discrepancy > 0 THEN
        v_verification := 'Partial';
    ELSE
        v_verification := 'Verified';
    END IF;

    -- 4. Write discrepancy + verification back into the new row
    UPDATE delivery_report
       SET discrepancy         = v_discrepancy,
           verification_status = v_verification
     WHERE report_id = NEW.report_id;

    -- 5. Update the affected area's last assistance date
    UPDATE affected_area
       SET last_assistance_date = NEW.delivery_date
     WHERE area_id = v_area_id;

    -- 6. Mark the original request as Delivered
    UPDATE area_request
       SET request_status = 'Delivered'
     WHERE request_id = v_request_id;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_on_delivery_report
AFTER INSERT ON delivery_report
FOR EACH ROW EXECUTE FUNCTION fn_on_delivery_report();


-- =============================================================================
-- STORED FUNCTIONS
-- =============================================================================

-- fn_add_disaster — Step 4
-- Registers a new disaster. Returns the new disaster_id.
CREATE OR REPLACE FUNCTION fn_add_disaster(
    p_type       VARCHAR,
    p_severity   VARCHAR,
    p_start_date DATE
)
RETURNS INT
LANGUAGE plpgsql AS $$
DECLARE
    v_id INT;
BEGIN
    INSERT INTO disaster (disaster_type, severity, start_date)
    VALUES (p_type, p_severity, p_start_date)
    RETURNING disaster_id INTO v_id;

    RETURN v_id;
END;
$$;


-- fn_add_affected_area — Step 5
-- Links a geographic area to a disaster with an initial severity score.
CREATE OR REPLACE FUNCTION fn_add_affected_area(
    p_area_id        INT,
    p_disaster_id    INT,
    p_severity_score DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO affected_area (area_id, disaster_id, severity_score, last_assistance_date)
    VALUES (p_area_id, p_disaster_id, p_severity_score, NULL);
END;
$$;


-- fn_submit_request — Step 7
-- Submits a resource request from an affected area.
-- The trg_prevent_duplicate_request trigger fires automatically.
-- Returns the new request_id.
CREATE OR REPLACE FUNCTION fn_submit_request(
    p_area_id    INT,
    p_resource_id INT,
    p_quantity   INT,
    p_priority_id INT
)
RETURNS INT
LANGUAGE plpgsql AS $$
DECLARE
    v_id INT;
BEGIN
    INSERT INTO area_request (area_id, resource_id, requested_quantity, priority_id, request_status, request_date)
    VALUES (p_area_id, p_resource_id, p_quantity, p_priority_id, 'Pending', CURRENT_DATE)
    RETURNING request_id INTO v_id;

    RETURN v_id;
END;
$$;


-- fn_process_allocation — Step 8
-- Allocates resources from a relief center to a pending request.
-- Fully transactional: triggers fire in order:
--   (1) trg_check_inventory_buffer  [BEFORE INSERT — may abort]
--   (2) trg_deduct_inventory         [AFTER INSERT]
--   (3) trg_set_request_allocated    [AFTER INSERT]
-- Returns the new allocation_id.
CREATE OR REPLACE FUNCTION fn_process_allocation(
    p_request_id INT,
    p_center_id  INT,
    p_quantity   INT
)
RETURNS INT
LANGUAGE plpgsql AS $$
DECLARE
    v_id INT;
BEGIN
    INSERT INTO allocation (request_id, center_id, allocated_quantity, allocation_date)
    VALUES (p_request_id, p_center_id, p_quantity, CURRENT_DATE)
    RETURNING allocation_id INTO v_id;

    RETURN v_id;
END;
$$;


-- fn_create_dispatch — Step 9
-- Creates a dispatch shipment for a completed allocation.
-- Returns the new dispatch_id.
CREATE OR REPLACE FUNCTION fn_create_dispatch(
    p_allocation_id   INT,
    p_expected_delivery DATE
)
RETURNS INT
LANGUAGE plpgsql AS $$
DECLARE
    v_id INT;
BEGIN
    INSERT INTO dispatch (allocation_id, dispatch_date, expected_delivery_date, status)
    VALUES (p_allocation_id, CURRENT_DATE, p_expected_delivery_date, 'In Transit')
    RETURNING dispatch_id INTO v_id;

    RETURN v_id;
END;
$$;


-- fn_record_delivery — Step 10
-- Records actual delivery. Triggers fire automatically:
--   trg_on_delivery_report [AFTER INSERT]:
--     - sets dispatch.status = 'Delivered'
--     - sets affected_area.last_assistance_date
--     - sets area_request.request_status = 'Delivered'
--     - computes discrepancy and verification_status
-- Returns: TABLE(report_id INT, discrepancy INT, verification_status TEXT)
CREATE OR REPLACE FUNCTION fn_record_delivery(
    p_dispatch_id       INT,
    p_received_quantity INT
)
RETURNS TABLE(report_id INT, discrepancy INT, verification_status VARCHAR)
LANGUAGE plpgsql AS $$
DECLARE
    v_report_id INT;
BEGIN
    INSERT INTO delivery_report (dispatch_id, received_quantity, delivery_date, verification_status)
    VALUES (p_dispatch_id, p_received_quantity, CURRENT_DATE, 'Pending')
    RETURNING delivery_report.report_id INTO v_report_id;

    -- Return the row after the trigger has updated it
    RETURN QUERY
        SELECT dr.report_id, dr.discrepancy, dr.verification_status
        FROM delivery_report dr
        WHERE dr.report_id = v_report_id;
END;
$$;


-- =============================================================================
-- MAINTENANCE — Sequence Reset
-- Run this if records were inserted manually via the Supabase dashboard,
-- which can cause the SERIAL sequence to fall out of sync and trigger
-- "duplicate key value violates unique constraint" errors on the next INSERT.
-- Applied: 2026-03-18
-- =============================================================================

SELECT setval(pg_get_serial_sequence('disaster',       'disaster_id'),   (SELECT MAX(disaster_id)   FROM disaster));
SELECT setval(pg_get_serial_sequence('priority_level', 'priority_id'),   (SELECT MAX(priority_id)   FROM priority_level));
SELECT setval(pg_get_serial_sequence('resource_type',  'resource_id'),   (SELECT MAX(resource_id)   FROM resource_type));
SELECT setval(pg_get_serial_sequence('area',           'area_id'),       (SELECT MAX(area_id)       FROM area));
SELECT setval(pg_get_serial_sequence('relief_center',  'center_id'),     (SELECT MAX(center_id)     FROM relief_center));
SELECT setval(pg_get_serial_sequence('area_request',   'request_id'),    (SELECT MAX(request_id)    FROM area_request));
SELECT setval(pg_get_serial_sequence('allocation',     'allocation_id'), (SELECT MAX(allocation_id) FROM allocation));
SELECT setval(pg_get_serial_sequence('dispatch',       'dispatch_id'),   (SELECT MAX(dispatch_id)   FROM dispatch));
SELECT setval(pg_get_serial_sequence('delivery_report','report_id'),     (SELECT MAX(report_id)     FROM delivery_report));


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
