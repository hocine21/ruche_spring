package com.ruche.ruche_connect.model;

public class Rucher {
    private String id;
    private String nom;
    private String description;
    private String adresse;
    private String ville;
    private String codePostal;
    private String apiculteurId;

    // ✅ Constructeur vide requis par Firebase
    public Rucher() {
    }

    // ✅ Getters & Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getCodePostal() {
        return codePostal;
    }

    public void setCodePostal(String codePostal) {
        this.codePostal = codePostal;
    }

    public String getApiculteurId() {
        return apiculteurId;
    }

    public void setApiculteurId(String apiculteurId) {
        this.apiculteurId = apiculteurId;
    }
}
