# CareLink / MediSync (Spring Boot)

A simple medical appointment platform built with **Spring Boot + Thymeleaf** using **CSV files** as the data source (in-memory), and implementing several design patterns:
- **Composite** (Wilaya → City)
- **Singleton** (CsvDataRepository)
- **Strategy** (Doctor search strategies)

---

## Features

### Patient
- Browse doctors (filter by wilaya/city/specialty)
- Book appointment (creates **PENDING**)
- View appointments with doctor details
- Cancel / reschedule **only after doctor responds** (not allowed while PENDING)
- Profile update (restricted fields)

### Doctor
- View dashboard stats and appointments
- Confirm appointment (**PENDING → CONFIRMED**)
- Reschedule appointment (**→ RESCHEDULED**)
- Complete appointment (**→ COMPLETED**)
- Profile update (restricted fields)

### Location & Specialty
- Load wilayas/cities from CSV
- Load specialties from CSV

---

## Tech Stack

- Java 17+ (recommended)
- Spring Boot
- Spring MVC
- Thymeleaf
- CSV files (resources/data/*.csv)

---

## Design Patterns Implemented

### 1) Composite
- `GeographicComponent` interface
- `City` implements `GeographicComponent`
- `Wilaya` implements `GeographicComponent` and contains a list of `City`

### 2) Singleton
- `CsvDataRepository` is a Singleton:
  - `private static volatile CsvDataRepository instance;`
  - `public static CsvDataRepository getInstance()`

### 3) Strategy
Doctor search strategies under: `com.carelink.demo.model.strategy`
- `SearchStrategy`
- `SearchBySpecialty`
- `SearchByLocation`
- `SearchByAvailability`
- `DoctorSearchContext`

Service method:
- `searchDoctorsByStrategy(String type, String criteria)`

Controller endpoint:
- `GET /api/doctors/search-strategy?type=specialty&criteria=Cardiology`

---

## Project Structure (Simplified)

