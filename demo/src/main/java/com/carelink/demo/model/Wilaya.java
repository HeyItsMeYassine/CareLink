package com.carelink.demo.model;

import java.util.ArrayList;
import java.util.List;

public class Wilaya implements GeographicComponent {

    private String name;
    private final List<GeographicComponent> cities = new ArrayList<>();

    public Wilaya() {
    }

    public Wilaya(String name) {
        this.name = name;
    }

    public void addCity(GeographicComponent city) {
        if (city == null)
            return;

        boolean exists = cities.stream()
                .anyMatch(c -> c.getName().equalsIgnoreCase(city.getName()));

        if (!exists) {
            cities.add(city);
        }
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public void displayHierarchy(int depth) {
        String indent = new String(new char[depth]).replace('\0', ' ');
        System.out.println(indent + "Wilaya : " + name);
        for (GeographicComponent city : cities) {
            city.displayHierarchy(depth + 2);
        }
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<GeographicComponent> getCities() {
        return cities;
    }

    @Override
    public String toString() {
        return name;
    }
}
