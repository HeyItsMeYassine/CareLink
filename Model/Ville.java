package com.medisync.utils;

public record Ville(String nom, String wilaya) implements GeographicComponent {
    @Override
    public void displayHierarchy(int depth) { 
        String indent = new String(new char[depth]).replace('\0', ' '); 
        System.out.println(indent + "   ├─ Ville : " + nom + " (" + wilaya + ")");
    }
}
