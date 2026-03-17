**DRRAS**

Disaster Relief Resource Allocation System

Database Views, Triggers & Functions --- Technical Reference

+-----------------------------------------------------------------------+
| Version 1.0 • March 2026                                              |
|                                                                       |
| APJ Abdul Kalam Technological University • PCCST402 DBMS              |
+-----------------------------------------------------------------------+

**Table of Contents**

**1. Overview & Architecture**

2\. Page-to-Database Mapping Summary

3\. Page Views (Section 1)

4\. Lookup / Helper Views (Section 4)

5\. Database Triggers (Section 2)

6\. Stored Functions (Section 3)

7\. Pipeline Flow Diagram

**1. Overview & Architecture**

DRRAS uses a layered architecture where all frontend pages consume PostgreSQL views instead of querying base tables directly. Stored functions encapsulate all write operations, and triggers enforce business rules automatically on the database side.

  -----------------------------------------------------------------------
  **Architecture Layers**

  -----------------------------------------------------------------------

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Layer**          **Role**
  ------------------ ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Frontend (UI)      React/Next.js pages that SELECT from views and call stored functions via Supabase client

  Views              Named SQL queries that JOIN base tables and compute derived fields --- one view per page

  Stored Functions   PL/pgSQL functions that wrap all INSERT operations --- called from the frontend as RPCs

  Triggers           Automatic integrity rules that fire on INSERT to enforce business logic without frontend involvement

  Base Tables        Normalised relational tables: disaster, area, affected_area, resource_type, relief_center, inventory, area_request, allocation, dispatch, delivery_report, priority_level
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**2. Page-to-Database Mapping Summary**

The table below shows every frontend page, the view it reads, the stored function(s) its action buttons call, and the base tables involved.

  ------------------------------------------------------------------------------------------------------------------------------------------
  **Page Route**   **View (READ)**      **Function (WRITE)**      **Base Tables**
  ---------------- -------------------- ------------------------- --------------------------------------------------------------------------
  /disasters       v_disasters          fn_add_disaster()         disaster, affected_area, area

  /areas           v_affected_areas     fn_add_affected_area()    affected_area, area, disaster

  /centers         v_relief_centers     --- (read only)           relief_center

  /inventory       v_inventory          --- (read only)           inventory, relief_center, resource_type

  /requests        v_area_requests      fn_submit_request()       area_request, area, resource_type, priority_level

  /allocations     v_allocations        fn_process_allocation()   allocation, area_request, area, resource_type, relief_center

  /dispatch        v_dispatches         fn_create_dispatch()      dispatch, allocation, area_request, area, resource_type, relief_center

  /deliveries      v_delivery_reports   fn_record_delivery()      delivery_report, dispatch, allocation, area_request, area, resource_type
  ------------------------------------------------------------------------------------------------------------------------------------------

**3. Page Views**

Each view below feeds exactly one frontend page. Views are read-only --- no DML is permitted through them.

**3.1 v_disasters**

  ------------------- ----------------------------------------------------------------
  **Frontend Page**   /disasters --- Disaster Management

  **Source Tables**   disaster → affected_area → area (subquery for first area name)

  **Sort Order**      start_date DESC
  ------------------- ----------------------------------------------------------------

Returns all disaster records enriched with a display location derived from the first affected area linked to each disaster. Powers the Active Disasters table.

  -----------------------------------------------------------------------
  **Output Columns**

  -----------------------------------------------------------------------

  ----------------------------------------------------------------------------------
  **Column Name**    **Type**   **Description**
  ------------------ ---------- ----------------------------------------------------
  disaster_id        INT        Primary key of the disaster

  disaster_type      VARCHAR    Type of disaster (Flood, Cyclone, etc.)

  severity_level     VARCHAR    Severity classification (Medium / High / Critical)

  start_date         DATE       Date the disaster was recorded

  location           VARCHAR    Name of the first associated area (UI convenience)
  ----------------------------------------------------------------------------------

**3.2 v_affected_areas**

  ------------------- ----------------------------------------------------
  **Frontend Page**   /areas --- Affected Areas

  **Source Tables**   affected_area → area, affected_area → disaster

  **Sort Order**      severity_score DESC
  ------------------- ----------------------------------------------------

Returns all affected area records joined with area master data and linked disaster type. Powers the Area Impact List table.

  -----------------------------------------------------------------------
  **Output Columns**

  -----------------------------------------------------------------------

  --------------------------------------------------------------------------
  **Column Name**    **Type**   **Description**
  ------------------ ---------- --------------------------------------------
  affected_id        INT        Primary key of the affected area record

  area_name          VARCHAR    Name of the geographic area

  district           VARCHAR    District the area belongs to

  state              VARCHAR    State

  disaster           VARCHAR    Disaster type currently impacting the area

  population         INT        Population count of the area

  severity_score     DECIMAL    0--10 impact score

  last_assistance    DATE       Date of most recent relief delivery

  disaster_id        INT        FK reference for drill-down

  area_id            INT        FK reference for request linking
  --------------------------------------------------------------------------

**3.3 v_relief_centers**

  ------------------- ----------------------------------------------------
  **Frontend Page**   /centers --- Registered Centers

  **Source Tables**   Direct from relief_center

  **Sort Order**      center_id ASC
  ------------------- ----------------------------------------------------

Simple projection of the relief_center table. Powers the Registered Centers catalogue.

  -----------------------------------------------------------------------
  **Output Columns**

  -----------------------------------------------------------------------

  ------------------------------------------------------------------------
  **Column Name**    **Type**   **Description**
  ------------------ ---------- ------------------------------------------
  center_id          INT        Primary key

  location           VARCHAR    Hub name or geographic location

  storage_capacity   INT        Maximum units the center can hold
  ------------------------------------------------------------------------

**3.4 v_inventory**

  ------------------- ------------------------------------------------------
  **Frontend Page**   /inventory --- Global Stock Inventory

  **Source Tables**   inventory → relief_center, inventory → resource_type

  **Sort Order**      center ASC, resource ASC
  ------------------- ------------------------------------------------------

Real-time inventory levels per center per resource, with computed stock health percentage and health label. Powers the Global Stock Inventory table including the Stock Health bar.

  -----------------------------------------------------------------------
  **Output Columns**

  -----------------------------------------------------------------------

  ---------------------------------------------------------------------------------------
  **Column Name**         **Type**   **Description**
  ----------------------- ---------- ----------------------------------------------------
  center_id               INT        Relief center identifier

  center                  VARCHAR    Relief center name

  resource_id             INT        Resource type identifier

  resource                VARCHAR    Resource name

  unit_of_measurement     VARCHAR    Unit (Kit, Pallet, Box, etc.)

  available               INT        Current available quantity

  reserved                INT        Buffer quantity reserved for emergencies

  dispatchable_quantity   INT        available - reserved (floor 0)

  stock_health_pct        DECIMAL    available / storage_capacity × 100

  stock_health_label      VARCHAR    Critical / Low / Optimal derived from buffer ratio
  ---------------------------------------------------------------------------------------

**3.5 v_area_requests**

  ------------------- -----------------------------------------------------------------------------------------
  **Frontend Page**   /requests --- Area Requests

  **Source Tables**   area_request → area, area_request → resource_type, area_request → priority_level (LEFT)

  **Sort Order**      request_date DESC
  ------------------- -----------------------------------------------------------------------------------------

All resource requests with area name, resource name, and urgency label resolved from priority_level. Powers the Recent Requests Log table.

  -----------------------------------------------------------------------
  **Output Columns**

  -----------------------------------------------------------------------

  --------------------------------------------------------------------------
  **Column Name**    **Type**   **Description**
  ------------------ ---------- --------------------------------------------
  request_id         INT        Primary key

  area               VARCHAR    Name of the requesting area

  area_id            INT        FK for form pre-population

  resource           VARCHAR    Resource name

  resource_id        INT        FK for form pre-population

  quantity           INT        Requested quantity

  urgency            VARCHAR    Priority label (Low/Medium/High/Critical)

  weight_score       INT        Numeric priority weight for sorting

  date               DATE       Date request was submitted

  status             VARCHAR    Pending / Approved / Allocated / Delivered
  --------------------------------------------------------------------------

**3.6 v_allocations**

  ------------------- ---------------------------------------------------------------------------------------------------------
  **Frontend Page**   /allocations --- Resource Allocations

  **Source Tables**   allocation → area_request → area, allocation → area_request → resource_type, allocation → relief_center

  **Sort Order**      allocation_date DESC
  ------------------- ---------------------------------------------------------------------------------------------------------

All allocation records with full context --- requesting area, resource, and source relief center resolved. Powers the Resource Allocations table.

  -----------------------------------------------------------------------
  **Output Columns**

  -----------------------------------------------------------------------

  ------------------------------------------------------------------------
  **Column Name**    **Type**   **Description**
  ------------------ ---------- ------------------------------------------
  allocation_id      INT        Primary key

  request_id         INT        Linked area request

  requested_by       VARCHAR    Area that raised the request

  resource           VARCHAR    Resource being allocated

  source_center      VARCHAR    Relief center fulfilling the request

  center_id          INT        FK reference

  quantity           INT        Units allocated

  date               DATE       Date allocation was authorized

  request_status     VARCHAR    Current status of the parent request
  ------------------------------------------------------------------------

**3.7 v_dispatches**

  ------------------- -------------------------------------------------------------------------------------------------------------------------------------------------
  **Frontend Page**   /dispatch --- Active Dispatches Hub

  **Source Tables**   dispatch → allocation → area_request → area, dispatch → allocation → resource_type, dispatch → relief_center, dispatch → delivery_report (LEFT)

  **Sort Order**      dispatch_date DESC
  ------------------- -------------------------------------------------------------------------------------------------------------------------------------------------

All dispatch records with destination area, resource in transit, source center, and a flag indicating whether a delivery report has been filed. Powers the Dispatches table.

  -----------------------------------------------------------------------
  **Output Columns**

  -----------------------------------------------------------------------

  --------------------------------------------------------------------------------------
  **Column Name**          **Type**   **Description**
  ------------------------ ---------- --------------------------------------------------
  dispatch_id              INT        Primary key

  allocation_id            INT        Linked allocation

  destination_area         VARCHAR    Area receiving the shipment

  resource                 VARCHAR    Resource in transit

  quantity                 INT        Units dispatched

  from_center              VARCHAR    Source relief center

  dispatch_date            DATE       Date shipment left the center

  expected_delivery_date   DATE       Estimated arrival date

  status                   VARCHAR    In Transit / Delivered / Pending

  delivery_reported        BOOLEAN    TRUE if delivery_report exists for this dispatch
  --------------------------------------------------------------------------------------

**3.8 v_delivery_reports**

  ------------------- ------------------------------------------------------------------------------------------------
  **Frontend Page**   /deliveries --- Delivery Reports

  **Source Tables**   delivery_report → dispatch → allocation → area_request → area, delivery_report → resource_type

  **Sort Order**      delivery_date DESC
  ------------------- ------------------------------------------------------------------------------------------------

Confirmed delivery records with computed discrepancy between allocated and received quantities, and a verification status badge. Powers the Completed Deliveries table.

  -----------------------------------------------------------------------
  **Output Columns**

  -----------------------------------------------------------------------

  ----------------------------------------------------------------------------
  **Column Name**       **Type**   **Description**
  --------------------- ---------- -------------------------------------------
  report_id             INT        Primary key of delivery_report

  dispatch_id           INT        Linked dispatch record

  delivered_to          VARCHAR    Destination area name

  resource              VARCHAR    Resource delivered

  dispatched_quantity   INT        Originally allocated and dispatched units

  received_quantity     INT        Actual units confirmed received

  delivery_date         DATE       Date delivery was completed

  discrepancy           INT        dispatched_quantity - received_quantity

  verification_status   VARCHAR    Verified / Partial / Failed
  ----------------------------------------------------------------------------

**4. Lookup / Helper Views**

These views do not map to standalone pages --- they are used to populate dropdowns and filtered lists inside forms and modals.

  -----------------------------------------------------------------------------------------------------------------------------------
  **View Name**                 **Used On Page**   **Purpose**
  ----------------------------- ------------------ ----------------------------------------------------------------------------------
  v_lookup_areas                /requests          Populates the Area dropdown in the New Request form

  v_lookup_resources            /requests          Populates the Resource dropdown in the New Request form

  v_lookup_priorities           /requests          Populates the Priority/Urgency dropdown in the New Request form

  v_lookup_centers_with_stock   /allocations       Populates the Center dropdown in Allocate form with live dispatchable stock

  v_pending_requests            /allocations       Shows only Pending requests sorted by priority + severity for allocation

  v_ready_for_dispatch          /dispatch          Shows Allocated requests not yet dispatched --- feeds the Dispatch creation form
  -----------------------------------------------------------------------------------------------------------------------------------

**5. Database Triggers**

All triggers are BEFORE or AFTER INSERT triggers. They fire automatically --- the frontend does not need to call them explicitly.

**5.1 trg_check_inventory_buffer**

  --------------------- ----------------------------------------------------
  **Function**          fn_check_inventory_buffer()

  **Fires**             BEFORE INSERT ON allocation

  **Requirement Ref**   FR-08
  --------------------- ----------------------------------------------------

Validates that the dispatchable quantity (available - reserved) at the chosen center is sufficient before an allocation is committed. Raises an exception if the allocation would breach the buffer.

**5.2 trg_deduct_inventory**

  --------------------- ----------------------------------------------------
  **Function**          fn_deduct_inventory()

  **Fires**             AFTER INSERT ON allocation

  **Requirement Ref**   FR-07
  --------------------- ----------------------------------------------------

Deducts the allocated_quantity from inventory.available_quantity at the source center for the relevant resource, ensuring real-time stock accuracy.

**5.3 trg_set_request_allocated**

  --------------------- ----------------------------------------------------
  **Function**          fn_set_request_allocated()

  **Fires**             AFTER INSERT ON allocation

  **Requirement Ref**   FR-11
  --------------------- ----------------------------------------------------

Automatically updates area_request.request_status to \'Allocated\' when an allocation row is inserted, keeping the request lifecycle in sync without a manual update.

**5.4 trg_prevent_duplicate_request**

  --------------------- ----------------------------------------------------
  **Function**          fn_prevent_duplicate_request()

  **Fires**             BEFORE INSERT ON area_request

  **Requirement Ref**   FR-10
  --------------------- ----------------------------------------------------

Prevents a second active request for the same resource in the same area if a non-terminal request (not Delivered, Rejected, or Cancelled) already exists. Raises an exception on violation.

**5.5 trg_on_delivery_report**

  --------------------- ----------------------------------------------------
  **Function**          fn_on_delivery_report()

  **Fires**             AFTER INSERT ON delivery_report

  **Requirement Ref**   FR-16, FR-17
  --------------------- ----------------------------------------------------

On delivery confirmation: (1) sets dispatch.status to \'Delivered\', and (2) updates affected_area.last_assistance_date to the delivery date for the relevant area.

**6. Stored Functions**

All write operations are routed through stored functions. Each function is called as a Supabase RPC from the frontend using supabase.rpc(\'function_name\', { params }).

**6.1 fn_submit_request()**

  ------------------- ----------------------------------------------------
  **Frontend Page**   /requests

  **Triggered By**    New Request button

  **Returns**         INT --- new request_id
  ------------------- ----------------------------------------------------

Inserts a new row into area_request with status \'Pending\' and today\'s date. The duplicate-request trigger fires automatically.

  -----------------------------------------------------------------------
  **Parameters**

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  **Parameter**      **Type**   **Description**
  ------------------ ---------- -----------------------------------------
  p_area_id          INT        Area making the request

  p_resource_id      INT        Resource being requested

  p_quantity         INT        Quantity needed

  p_priority_id      INT        Priority level reference
  -----------------------------------------------------------------------

**6.2 fn_process_allocation()**

  ------------------- ----------------------------------------------------
  **Frontend Page**   /allocations

  **Triggered By**    Approve & Allocate action

  **Returns**         INT --- new allocation_id
  ------------------- ----------------------------------------------------

Inserts an allocation row. Three triggers fire in sequence: buffer check (BEFORE), inventory deduction (AFTER), and request status update (AFTER).

  -----------------------------------------------------------------------
  **Parameters**

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  **Parameter**      **Type**   **Description**
  ------------------ ---------- -----------------------------------------
  p_request_id       INT        Request being fulfilled

  p_center_id        INT        Relief center supplying the resource

  p_quantity         INT        Units to allocate
  -----------------------------------------------------------------------

**6.3 fn_create_dispatch()**

  ------------------- ----------------------------------------------------
  **Frontend Page**   /dispatch

  **Triggered By**    Create Dispatch action

  **Returns**         INT --- new dispatch_id
  ------------------- ----------------------------------------------------

Inserts a dispatch row with status \'In Transit\' and today\'s dispatch date. The allocation disappears from v_ready_for_dispatch once this is called.

  -----------------------------------------------------------------------
  **Parameters**

  -----------------------------------------------------------------------

  --------------------------------------------------------------------------
  **Parameter**         **Type**   **Description**
  --------------------- ---------- -----------------------------------------
  p_allocation_id       INT        Allocation being dispatched

  p_expected_delivery   DATE       Estimated delivery date
  --------------------------------------------------------------------------

**6.4 fn_record_delivery()**

  ------------------- ----------------------------------------------------
  **Frontend Page**   /deliveries

  **Triggered By**    Record Delivery action

  **Returns**         TABLE(report_id INT, discrepancy INT)
  ------------------- ----------------------------------------------------

Inserts a delivery_report row, then the delivery trigger fires to update dispatch status and last_assistance_date. Returns the new report ID and the discrepancy (0 = Verified, \>0 = Partial).

  -----------------------------------------------------------------------
  **Parameters**

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  **Parameter**      **Type**   **Description**
  ------------------ ---------- -----------------------------------------
  p_dispatch_id      INT        Dispatch being confirmed

  p_received_qty     INT        Actual units received at destination
  -----------------------------------------------------------------------

**6.5 fn_add_disaster()**

  ------------------- ----------------------------------------------------
  **Frontend Page**   /disasters

  **Triggered By**    Add Disaster button

  **Returns**         INT --- new disaster_id
  ------------------- ----------------------------------------------------

Inserts a new disaster record. The returned ID should be passed to fn_add_affected_area() to link areas to the disaster.

  -----------------------------------------------------------------------
  **Parameters**

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  **Parameter**      **Type**   **Description**
  ------------------ ---------- -----------------------------------------
  p_disaster_type    VARCHAR    Type of disaster

  p_severity_level   VARCHAR    Severity (Medium/High/Critical)

  p_start_date       DATE       Date disaster began
  -----------------------------------------------------------------------

**6.6 fn_add_affected_area()**

  ------------------- ----------------------------------------------------
  **Frontend Page**   /areas

  **Triggered By**    Add Affected Area button

  **Returns**         INT --- new affected_id
  ------------------- ----------------------------------------------------

Links an existing area to a disaster by inserting into affected_area. Uses area master data so geographic details are not duplicated.

  -----------------------------------------------------------------------
  **Parameters**

  -----------------------------------------------------------------------

  ------------------------------------------------------------------------
  **Parameter**      **Type**   **Description**
  ------------------ ---------- ------------------------------------------
  p_area_id          INT        Existing area from the area master table

  p_disaster_id      INT        Disaster this area is linked to

  p_severity_score   DECIMAL    0--10 impact score
  ------------------------------------------------------------------------

**7. Pipeline Flow**

The diagram below shows the complete end-to-end flow of a relief resource from initial disaster registration to delivery confirmation, with the database objects involved at each step.

  -----------------------------------------------------------------------------------------------------------------------------------------------------------
  **Step**     **Action**           **Function Called**       **DB Objects Touched**
  ------------ -------------------- ------------------------- -----------------------------------------------------------------------------------------------
  **Step 1**   Register Disaster    fn_add_disaster()         disaster table

  **Step 2**   Link Affected Area   fn_add_affected_area()    affected_area table

  **Step 3**   Submit Request       fn_submit_request()       area_request \| trg_prevent_duplicate_request

  **Step 4**   Process Allocation   fn_process_allocation()   allocation \| trg_check_inventory_buffer \| trg_deduct_inventory \| trg_set_request_allocated

  **Step 5**   Create Dispatch      fn_create_dispatch()      dispatch table

  **Step 6**   Record Delivery      fn_record_delivery()      delivery_report \| trg_on_delivery_report
  -----------------------------------------------------------------------------------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  **Trigger Chain for fn_process_allocation()**

  -----------------------------------------------------------------------

**When fn_process_allocation() is called, three triggers fire automatically in this sequence:**

  --------------------------------------------------------------------------------------------------------------
  **\#**   **Trigger**                  **Timing**      **Effect**
  -------- ---------------------------- --------------- --------------------------------------------------------
  1        trg_check_inventory_buffer   BEFORE INSERT   Aborts if stock is insufficient --- nothing is written

  2        trg_deduct_inventory         AFTER INSERT    Reduces available_quantity in inventory

  3        trg_set_request_allocated    AFTER INSERT    Sets request_status = \'Allocated\'
  --------------------------------------------------------------------------------------------------------------
