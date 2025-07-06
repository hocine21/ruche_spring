package com.ruche.ruche_connect.controller;

import com.google.firebase.database.*;
import com.ruche.ruche_connect.model.Mesure;
import com.ruche.ruche_connect.service.EmailService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableScheduling
@SpringBootApplication
@Controller
@RequestMapping("/alertes")
public class AlerteController {

    private final DatabaseReference mesuresRef = FirebaseDatabase.getInstance().getReference("mesures");
    private final DatabaseReference ruchesRef = FirebaseDatabase.getInstance().getReference("ruches");
    private final DatabaseReference ruchersRef = FirebaseDatabase.getInstance().getReference("ruchers");
    private final DatabaseReference usersRef = FirebaseDatabase.getInstance().getReference("users");

    @Autowired
    private EmailService emailService;

    // Pour éviter d'envoyer plusieurs fois la même alerte
    private final Set<String> capteursNotifies = new HashSet<>();
    // Pour éviter d'envoyer plusieurs fois la même alerte sur la même mesure
    private final Map<String, String> capteurDerniereAlerte = new HashMap<>(); // refCapteur -> horodatage

    private boolean alertesActives = true;

    // Toutes les 10 secondes
    @Scheduled(fixedRate = 10000)
    public void verifierAlertesAutomatique() {
        System.out.println("[ALERTES] Vérification automatique...");
        ruchesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot ruchesSnapshot) {
                for (DataSnapshot rucheSnap : ruchesSnapshot.getChildren()) {
                    Boolean alertesActive = rucheSnap.child("alertes").getValue(Boolean.class);
                    String refCapteur = rucheSnap.child("referenceCapteur").getValue(String.class);
                    String rucherId = rucheSnap.child("rucherId").getValue(String.class);
                    String rucheId = rucheSnap.getKey();
                    String nomRuche = rucheSnap.child("nom").getValue(String.class);

                    if (alertesActive == null || !alertesActive || refCapteur == null || rucherId == null) continue;

                    mesuresRef.orderByChild("refCapteur").equalTo(refCapteur)
                        .addListenerForSingleValueEvent(new ValueEventListener() {
                            @Override
                            public void onDataChange(DataSnapshot mesuresSnapshot) {
                                Mesure lastMesure = null;
                                String lastHorodatage = null;
                                for (DataSnapshot snap : mesuresSnapshot.getChildren()) {
                                    String horodatage = snap.child("horodatage").getValue(String.class);
                                    Mesure m = snap.getValue(Mesure.class);
                                    if (m != null && horodatage != null &&
                                        (lastHorodatage == null || horodatage.compareTo(lastHorodatage) > 0)) {
                                        lastMesure = m;
                                        lastHorodatage = horodatage;
                                    }
                                }
                                if (lastMesure == null) {
                                    System.out.println("[ALERTES] Aucune mesure trouvée pour capteur " + refCapteur);
                                    return;
                                }
                                System.out.println("[ALERTES] Dernière mesure pour ruche " + rucheId + " (capteur " + refCapteur + ") : " + lastMesure.getEtatCouvercle() + ", temp=" + lastMesure.getTemperature() + ", hum=" + lastMesure.getHumidite());

                                boolean alerte = false;
                                StringBuilder raisons = new StringBuilder();

                                if ("OUVERT".equalsIgnoreCase(lastMesure.getEtatCouvercle())) {
                                    alerte = true;
                                    raisons.append("- Couvercle ouvert\n");
                                }
                                Double temperature = lastMesure.getTemperature();
                                Double humidite = lastMesure.getHumidite();
                                if (temperature != null && (temperature < 10 || temperature > 35)) {
                                    alerte = true;
                                    raisons.append("- Température anormale (" + temperature + "°C)\n");
                                }
                                if (humidite != null && (humidite < 30 || humidite > 70)) {
                                    alerte = true;
                                    raisons.append("- Humidité anormale (" + humidite + "%)\n");
                                }

                                // Empêche l'envoi multiple pour la même mesure
                                String horodatage = lastMesure.getHorodatage();
                                if (alerte && horodatage != null) {
                                    String lastNotified = capteurDerniereAlerte.get(refCapteur);
                                    if (horodatage.equals(lastNotified)) {
                                        System.out.println("[ALERTES] Déjà notifié pour cette mesure (" + horodatage + ")");
                                        return;
                                    }
                                    capteurDerniereAlerte.put(refCapteur, horodatage);

                                    ruchersRef.child(rucherId).addListenerForSingleValueEvent(new ValueEventListener() {
                                        @Override
                                        public void onDataChange(DataSnapshot rucherSnap) {
                                            String apiculteurId = rucherSnap.child("apiculteurId").getValue(String.class);
                                            if (apiculteurId != null) {
                                                usersRef.child(apiculteurId).addListenerForSingleValueEvent(new ValueEventListener() {
                                                    @Override
                                                    public void onDataChange(DataSnapshot userSnap) {
                                                        String email = userSnap.child("email").getValue(String.class);
                                                        if (email != null && !email.isBlank()) {
                                                            StringBuilder corps = new StringBuilder();
                                                            corps.append("Bonjour,\n\n");
                                                            corps.append("Une alerte a été détectée sur votre ruche : ").append(nomRuche != null ? nomRuche : rucheId).append("\n");
                                                            corps.append("Heure de la mesure : ").append(horodatage != null ? horodatage : "inconnue").append("\n");
                                                            corps.append("Détail :\n").append(raisons);
                                                            corps.append("\nMerci de vérifier rapidement l'état de votre ruche.\n\nCordialement,\nRucheConnect");
                                                            System.out.println("[ALERTES] Envoi d'alerte à " + email + " pour ruche " + rucheId + " :\n" + raisons);
                                                            emailService.envoyer(
                                                                email,
                                                                "🚨 Alerte ruche : état anormal détecté",
                                                                corps.toString()
                                                            );
                                                        } else {
                                                            System.out.println("[ALERTES] Email apiculteur introuvable pour ruche " + rucheId);
                                                        }
                                                    }
                                                    @Override public void onCancelled(DatabaseError error) {}
                                                });
                                            } else {
                                                System.out.println("[ALERTES] apiculteurId introuvable pour rucher " + rucherId);
                                            }
                                        }
                                        @Override public void onCancelled(DatabaseError error) {}
                                    });
                                } else if (!alerte) {
                                    System.out.println("[ALERTES] Pas d'alerte à envoyer pour ruche " + rucheId);
                                }
                            }
                            @Override public void onCancelled(DatabaseError error) {}
                        });
                }
            }
            @Override public void onCancelled(DatabaseError error) {}
        });
    }

    @GetMapping
    public String pageAlertes(Model model) {
        model.addAttribute("alertesActives", alertesActives);
        return "alertes";
    }

    @PostMapping("/activer")
    public String activerAlertes() {
        alertesActives = true;
        return "redirect:/alertes";
    }

    @PostMapping("/desactiver")
    public String desactiverAlertes() {
        alertesActives = false;
        capteursNotifies.clear();
        return "redirect:/alertes";
    }

    @GetMapping("/verifier")
    public String verifierAlertes(Model model) throws InterruptedException {
        if (!alertesActives) {
            model.addAttribute("message", "Les alertes sont désactivées.");
            return "alertes";
        }

        List<Mesure> mesuresAlertes = new ArrayList<>();
        final Object lock = new Object();

        mesuresRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot snap : snapshot.getChildren()) {
                    Mesure m = snap.getValue(Mesure.class);
                    if (m != null) {
                        Boolean alertesActivesMesure = snap.child("alertes").getValue(Boolean.class);
                        if (alertesActivesMesure == null || !alertesActivesMesure) {
                            continue; // Si la mesure ne souhaite pas de vérification, on skip
                        }

                        boolean alerteTemp = false;
                        boolean alerteHum = false;
                        boolean alerteCouvercle = false;

                        try {
                            double temp = m.getTemperature();
                            double hum = m.getHumidite();

                            if (temp < 10 || temp > 35) alerteTemp = true;
                            if (hum < 30 || hum > 70) alerteHum = true;
                        } catch (Exception e) {
                            // Erreur de lecture température/humidité
                        }

                        if ("OUVERT".equalsIgnoreCase(m.getEtatCouvercle())) {
                            alerteCouvercle = true;
                        }

                        if (alerteTemp || alerteHum || alerteCouvercle) {
                            mesuresAlertes.add(m);

                            if (!capteursNotifies.contains(m.getRefCapteur())) {
                                envoyerAlerteEmail(m, alerteTemp, alerteHum, alerteCouvercle);
                                capteursNotifies.add(m.getRefCapteur());
                            }
                        }
                    }
                }
                synchronized (lock) { lock.notify(); }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                synchronized (lock) { lock.notify(); }
            }
        });

        synchronized (lock) { lock.wait(2000); }

        model.addAttribute("mesuresAlertes", mesuresAlertes);
        model.addAttribute("alertesActives", alertesActives);
        return "alertes";
    }

    private void envoyerAlerteEmail(Mesure mesure, boolean alerteTemp, boolean alerteHum, boolean alerteCouvercle) {
        String refCapteur = mesure.getRefCapteur();

        ruchesRef.orderByChild("referenceCapteur").equalTo(refCapteur)
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        for (DataSnapshot rucheSnap : snapshot.getChildren()) {
                            String rucherId = rucheSnap.child("rucherId").getValue(String.class);
                            String rucheId = rucheSnap.getKey();
                            if (rucherId != null && rucheId != null) {
                                ruchersRef.child(rucherId).addListenerForSingleValueEvent(new ValueEventListener() {
                                    @Override
                                    public void onDataChange(DataSnapshot rucherSnap) {
                                        String uid = rucherSnap.child("apiculteurId").getValue(String.class);
                                        if (uid != null) {
                                            usersRef.child(uid).addListenerForSingleValueEvent(new ValueEventListener() {
                                                @Override
                                                public void onDataChange(DataSnapshot userSnap) {
                                                    String email = userSnap.child("email").getValue(String.class);
                                                    if (email != null && !email.isBlank()) {
                                                        StringBuilder corps = new StringBuilder("🚨 Alerte sur votre ruche (ID: " + rucheId + ") :\n");
                                                        if (alerteTemp)
                                                            corps.append("- Température anormale détectée\n");
                                                        if (alerteHum)
                                                            corps.append("- Humidité anormale détectée\n");
                                                        if (alerteCouvercle)
                                                            corps.append("- Couvercle ouvert détecté\n");
                                                        corps.append("Merci de vérifier rapidement.");

                                                        emailService.envoyer(
                                                                email,
                                                                "🚨 Alerte ruche : état anormal détecté",
                                                                corps.toString()
                                                        );
                                                    }
                                                }

                                                @Override public void onCancelled(DatabaseError error) {}
                                            });
                                        }
                                    }

                                    @Override public void onCancelled(DatabaseError error) {}
                                });
                            }
                        }
                    }

                    @Override
                    public void onCancelled(DatabaseError error) {}
                });
    }

    // --- AJOUT : Endpoints pour état d'alerte par ruche ---

    @PostMapping("/etat/{rucheId}/toggle")
    @ResponseBody
    public Map<String, Object> toggleEtatAlerte(@PathVariable String rucheId, HttpSession session) throws InterruptedException {
        if (session.getAttribute("uid") == null) return Map.of("success", false, "error", "Non connecté");
        final Object lock = new Object();
        final Boolean[] newState = new Boolean[1];

        ruchesRef.child(rucheId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot rucheSnap) {
                Boolean alertesActive = rucheSnap.child("alertes").getValue(Boolean.class);
                boolean next = (alertesActive == null) ? true : !alertesActive;
                ruchesRef.child(rucheId).child("alertes").setValueAsync(next);

                // --- AJOUT : vider le cache si on désactive l'alerte ---
                if (!next) {
                    String refCapteur = rucheSnap.child("referenceCapteur").getValue(String.class);
                    if (refCapteur != null) {
                        capteurDerniereAlerte.remove(refCapteur);
                    }
                }

                newState[0] = next;
                synchronized (lock) { lock.notify(); }
            }
            @Override public void onCancelled(DatabaseError error) { synchronized (lock) { lock.notify(); } }
        });
        synchronized (lock) { lock.wait(2000); }
        return Map.of("success", true, "alertes", newState[0]);
    }

    @GetMapping("/etat/all")
    @ResponseBody
    public Map<String, Boolean> getEtatsAlertes(HttpSession session) throws InterruptedException {
        if (session.getAttribute("uid") == null) return Map.of();
        final Map<String, Boolean> etats = new HashMap<>();
        final Object lock = new Object();
        ruchesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot node : snapshot.getChildren()) {
                    String id = node.getKey();
                    Boolean etat = node.child("alertes").getValue(Boolean.class);
                    etats.put(id, etat != null ? etat : false);
                }
                synchronized (lock) { lock.notify(); }
            }
            @Override public void onCancelled(DatabaseError error) { synchronized (lock) { lock.notify(); } }
        });
        synchronized (lock) { lock.wait(2000); }
        return etats;
    }
}
