# CareLink / MediSync – Medical Appointment Management System

CareLink (also referred to as MediSync) is a medical appointment management platform built with **Spring Boot** and **Thymeleaf**, using **CSV files** as an in-memory data source.  
The project focuses on clean architecture and explicitly implements multiple **design patterns**.

---

## Design Patterns Implemented

### 1) Observer 
The Observer pattern is used to notify patients when the status of their appointment changes.

- `Observer` interface
- `Patient` acts as an Observer
- Appointment status changes trigger notifications:
  - CONFIRMED
  - RESCHEDULED
  - CANCELLED
  - COMPLETED

This ensures loose coupling between appointment logic and notification logic and allows easy extension (email, SMS, push notifications).

---

### 2) Composite 
Used to model the geographic hierarchy.

- `GeographicComponent` interface
- `Wilaya` (Composite)
- `City` (Leaf)

This allows wilayas and cities to be treated uniformly and enables hierarchical display of geographic data.

---

### 3) Singleton 
Ensures a single instance of the CSV repository.

- `CsvDataRepository` implemented as a thread-safe Singleton
- CSV data is loaded once at application startup
- Centralized in-memory data management

---

### 4) Strategy 
Used for flexible doctor search behavior.

Package:
**com.carelink.demo.model.strategy**


Strategies implemented:
- `SearchBySpecialty`
- `SearchByLocation`
- `SearchByAvailability`

Context:
- `DoctorSearchContext`

Allows dynamic switching of doctor search logic without modifying existing code.

Example API:
**GET /api/doctors/search-strategy?type=specialty&criteria=Cardiology**


---

## Features

### Patient
- Browse doctors by wilaya, city, specialty, or availability
- Book appointments (initial state: **PENDING**)
- View appointments with doctor details
- Cancel or reschedule appointments **only after doctor response**
- View completed appointment count
- Update profile (restricted fields)

---

### Doctor
- View dashboard statistics
- Manage appointments:
  - Confirm
  - Reschedule
  - Cancel
  - Complete
- Update profile (restricted fields)

---

## Appointment Lifecycle


---

## Features

### Patient
- Browse doctors by wilaya, city, specialty, or availability
- Book appointments (initial state: **PENDING**)
- View appointments with doctor details
- Cancel or reschedule appointments **only after doctor response**
- View completed appointment count
- Update profile (restricted fields)

---

### Doctor
- View dashboard statistics
- Manage appointments:
  - Confirm
  - Reschedule
  - Cancel
  - Complete
- Update profile (restricted fields)

---

## Appointment Lifecycle

**PENDING → CONFIRMED → COMPLETED**
- RESCHEDULED
- CANCELLED


Rules:
- Patient cannot cancel or reschedule while status is **PENDING**
- Doctor must respond first
- Only doctors can mark appointments as **COMPLETED**

---

## Tech Stack

- Java 17+
- Spring Boot
- Spring MVC
- Thymeleaf
- CSV-based persistence (in-memory)

---


---

## Running the Application

### Using Maven
```bash
mvn spring-boot:run

