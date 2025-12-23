package com.carelink.demo.model;

public record City(String nom, String wilaya) implements GeographicComponent {

    @Override
    public String getName() {
        return nom;
    }

    @Override
    public void displayHierarchy(int depth) {
        String indent = new String(new char[depth]).replace('\0', ' ');
        System.out.println(indent + "   ├─ Ville : " + nom + " (" + wilaya + ")");
    }
}
