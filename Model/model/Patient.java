package com.carelink.model;

public class Patient implements Observer {
    private String id;
    private String email;
    private String password;
    private String lastName;
    private String firstName;
    private String wilaya;
    private String city;
    private String phone;


    public Patient() {}

    public Patient(String id, String email, String password, String lastName, String firstName,
                   String wilaya, String city, String phone) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.lastName = lastName;
        this.firstName = firstName;
        this.wilaya = wilaya;
        this.city = city;
        this.phone = phone;
    }

    @Override
    public void update(String message) {
        System.out.println("[ALERTE - Patient " + firstName + " " + lastName + "] " + message);
    }

    // Getters
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getLastName() { return lastName; }
    public String getFirstName() { return firstName; }
    public String getWilaya() { return wilaya; }
    public String getCity() { return city; }
    public String getPhone() { return phone; }


    // Setters
    public void setId(String id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setWilaya(String wilaya) { this.wilaya = wilaya; }
    public void setCity(String city) { this.city = city; }
    public void setPhone(String phone) { this.phone = phone; }

    // Méthode pour CSV
    public String toCSV() {
        return id + "," + email + "," + password + "," + lastName + "," + firstName + "," +
                wilaya + "," + city + "," + phone;
    }

    public static Patient fromCSV(String csvLine) {
        String[] parts = csvLine.split(",");
        if (parts.length != 8) {
            throw new IllegalArgumentException("Invalid CSV line");
        }
        return new Patient(parts[0], parts[1], parts[2], parts[3], parts[4],
                parts[5], parts[6], parts[7]);
    }

    @Override
    public String toString() {
        return "Patient: " + firstName + " " + lastName;
    }
}