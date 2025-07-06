package com.ruche.ruche_connect.model;

public class Ruche {
    private String id;
    private String nom;
    private String emplacement;
    private String etat;
    private int nombreCadres;
    private String referenceCapteur;
    private String rucherId;
    private String apiculteurId;
    private Boolean alertes; // ou boolean alertes;

    public Ruche() {}

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getEmplacement() { return emplacement; }
    public void setEmplacement(String emplacement) { this.emplacement = emplacement; }

    public String getEtat() { return etat; }
    public void setEtat(String etat) { this.etat = etat; }

    public int getNombreCadres() { return nombreCadres; }
    public void setNombreCadres(int nombreCadres) { this.nombreCadres = nombreCadres; }

    public String getReferenceCapteur() { return referenceCapteur; }
    public void setReferenceCapteur(String referenceCapteur) { this.referenceCapteur = referenceCapteur; }

    public String getRucherId() { return rucherId; }
    public void setRucherId(String rucherId) { this.rucherId = rucherId; }

    public String getApiculteurId() { return apiculteurId; }
    public void setApiculteurId(String apiculteurId) { this.apiculteurId = apiculteurId; }

    // Getter
    public Boolean getAlertes() {
        return alertes;
    }

    // Setter
    public void setAlertes(Boolean alertes) {
        this.alertes = alertes;
    }

    public void setNomRucher(String get) {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }
}
