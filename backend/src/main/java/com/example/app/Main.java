package com.carelink;

import com.carelink.controller.LoginController;

import static spark.Spark.*;

public class Main {
    public static void main(String[] args) {
        // Configure Spark
        port(4567); // Spark runs on port 4567 by default
        staticFiles.location("/public"); // Serve static files from public directory
        
        // Initialize controllers
        new LoginController();
        
        System.out.println("CareLink Backend Server running on http://localhost:4567");
        System.out.println("API Endpoints:");
        System.out.println("  POST /api/login/doctor");
        System.out.println("  POST /api/login/patient");
        System.out.println("  POST /api/logout");
        System.out.println("  GET  /api/check-session");
    }
}
