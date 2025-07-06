package com.ruche.ruche_connect.model;

public class Intervention {
    private String apiculteurId;
    private String rucheId;
    private String commentaire;
    private boolean intervention;
    private String dateHeure;

    public Intervention() {
        // Constructeur vide requis par Firebase
    }

    public Intervention(String apiculteurId, String rucheId, String commentaire, boolean intervention, String dateHeure) {
        this.apiculteurId = apiculteurId;
        this.rucheId = rucheId;
        this.commentaire = commentaire;
        this.intervention = intervention;
        this.dateHeure = dateHeure;
    }

    // Getters et Setters
    public String getApiculteurId() { return apiculteurId; }
    public void setApiculteurId(String apiculteurId) { this.apiculteurId = apiculteurId; }

    public String getRucheId() { return rucheId; }
    public void setRucheId(String rucheId) { this.rucheId = rucheId; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public boolean isIntervention() { return intervention; }
    public void setIntervention(boolean intervention) { this.intervention = intervention; }

    public String getDateHeure() {
        return dateHeure;
    }
    public void setDateHeure(String dateHeure) {
        this.dateHeure = dateHeure;
    }
}
