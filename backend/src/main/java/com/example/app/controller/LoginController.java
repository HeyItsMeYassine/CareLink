package com.carelink.controller;

import com.carelink.service.AuthService;
import com.google.gson.Gson;
import spark.Request;
import spark.Response;
import spark.Route;

import java.util.HashMap;
import java.util.Map;

import static spark.Spark.*;

public class LoginController {
    private final AuthService authService;
    private final Gson gson;
    
    public LoginController() {
        this.authService = new AuthService();
        this.gson = new Gson();
        setupRoutes();
    }
    
    private void setupRoutes() {
        // Enable CORS
        options("/*", (request, response) -> {
            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }
            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            }
            return "OK";
        });
        
        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Request-Method", "GET,POST,PUT,DELETE,OPTIONS");
            response.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,Content-Length,Accept,Origin");
            response.type("application/json");
        });
        
        // Login routes
        post("/api/login/doctor", handleDoctorLogin);
        post("/api/login/patient", handlePatientLogin);
        post("/api/logout", handleLogout);
        get("/api/check-session", checkSession);
        
        // Home and register navigation
        get("/api/home", (req, res) -> {
            Map<String, String> response = new HashMap<>();
            response.put("redirect", "../index.html");
            return gson.toJson(response);
        });
        
        get("/api/register", (req, res) -> {
            Map<String, String> response = new HashMap<>();
            response.put("redirect", "../pages/register.html");
            return gson.toJson(response);
        });
    }
    
    private final Route handleDoctorLogin = (Request req, Response res) -> {
        Map<String, Object> requestBody = gson.fromJson(req.body(), Map.class);
        String email = (String) requestBody.get("email");
        String password = (String) requestBody.get("password");
        
        Map<String, Object> result = authService.loginDoctor(email, password);
        
        if (result != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful!");
            response.put("user", result);
            response.put("redirect", "../pages/doctordashboard.html");
            return gson.toJson(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid email or password");
            res.status(401);
            return gson.toJson(response);
        }
    };
    
    private final Route handlePatientLogin = (Request req, Response res) -> {
        Map<String, Object> requestBody = gson.fromJson(req.body(), Map.class);
        String email = (String) requestBody.get("email");
        String password = (String) requestBody.get("password");
        
        Map<String, Object> result = authService.loginPatient(email, password);
        
        if (result != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful!");
            response.put("user", result);
            response.put("redirect", "../pages/patientdashboard.html");
            return gson.toJson(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid email or password");
            res.status(401);
            return gson.toJson(response);
        }
    };
    
    private final Route handleLogout = (Request req, Response res) -> {
        String sessionId = req.headers("Session-ID");
        if (sessionId != null) {
            authService.logout(sessionId);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        response.put("redirect", "../index.html");
        return gson.toJson(response);
    };
    
    private final Route checkSession = (Request req, Response res) -> {
        String sessionId = req.headers("Session-ID");
        Map<String, Object> response = new HashMap<>();
        
        if (sessionId != null && authService.validateSession(sessionId)) {
            response.put("valid", true);
            response.put("user", authService.getUserFromSession(sessionId));
        } else {
            response.put("valid", false);
        }
        
        return gson.toJson(response);
    };
}
