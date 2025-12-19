package com.carelink.model;

public class Patient {
    private String id;
    private String firstName;
    private String lastName;
    private String wilaya;
    private String city;
    private String email;
    private String password;
    private String phoneNumber;
    private String sex;
    
    // Constructor
    public Patient(String id, String firstName, String lastName, String wilaya, String city,
                   String email, String password, String phoneNumber, String sex) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.wilaya = wilaya;
        this.city = city;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.sex = sex;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getWilaya() { return wilaya; }
    public void setWilaya(String wilaya) { this.wilaya = wilaya; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }
    
    @Override
    public String toString() {
        return "Patient{id='" + id + "', name='" + firstName + " " + lastName + "', email='" + email + "'}";
    }
}
