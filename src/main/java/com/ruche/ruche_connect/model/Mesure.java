package com.ruche.ruche_connect.model;

public class Mesure {
    private String horodatage;
    private double humidite;
    private double temperature;
    private String etatCouvercle;
    private String evenement;
    private String raison;
    private String refCapteur;

    public Mesure() {}

    // Getters & Setters
    public String getHorodatage() { return horodatage; }
    public void setHorodatage(String horodatage) { this.horodatage = horodatage; }

    public double getHumidite() { return humidite; }
    public void setHumidite(double humidite) { this.humidite = humidite; }

    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }

    public String getEtatCouvercle() { return etatCouvercle; }
    public void setEtatCouvercle(String etatCouvercle) { this.etatCouvercle = etatCouvercle; }

    public String getEvenement() { return evenement; }
    public void setEvenement(String evenement) { this.evenement = evenement; }

    public String getRaison() { return raison; }
    public void setRaison(String raison) { this.raison = raison; }

    public String getRefCapteur() { return refCapteur; }
    public void setRefCapteur(String refCapteur) { this.refCapteur = refCapteur; }
}
