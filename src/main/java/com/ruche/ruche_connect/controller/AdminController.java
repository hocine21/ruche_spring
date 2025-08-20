package com.ruche.ruche_connect.controller;

import com.google.firebase.database.*;
import com.ruche.ruche_connect.model.Mesure;
import com.ruche.ruche_connect.model.Ruche;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.*;

@Controller
public class AdminController {

	private final DatabaseReference dbRef;

    public AdminController(@Qualifier("dbRef") DatabaseReference dbRef) {
        this.dbRef = dbRef;
    }

    @GetMapping("/admin")
    public String afficherDashboardAdmin(HttpSession session,
                                         @RequestParam(value = "rucheId", required = false) String rucheId,
                                         Model model) throws InterruptedException {

        String uid = (String) session.getAttribute("uid");
        String role = (String) session.getAttribute("role");

        if (uid == null || role == null || !(role.equalsIgnoreCase("Admin") || role.equalsIgnoreCase("Apiculteur"))) {
            return "redirect:/login";
        }

        // Gestion désactivation globale alertes (session)
        Boolean alertsDisabled = (Boolean) session.getAttribute("alertsDisabled");
        Instant tempDisabledUntil = (Instant) session.getAttribute("alertsTempDisabledUntil");
        boolean alertesDesactiveesGlobal = false;
        if ((alertsDisabled != null && alertsDisabled) ||
            (tempDisabledUntil != null && Instant.now().isBefore(tempDisabledUntil))) {
            alertesDesactiveesGlobal = true;
        } else if (tempDisabledUntil != null && Instant.now().isAfter(tempDisabledUntil)) {
            session.removeAttribute("alertsTempDisabledUntil");
        }
        model.addAttribute("alertesDesactiveesGlobal", alertesDesactiveesGlobal);

        // Récupérer ruches avec alertes désactivées individuellement
        @SuppressWarnings("unchecked")
        Set<String> ruchesAlertesDesactivees = (Set<String>) session.getAttribute("ruchesAlertesDesactivees");
        if (ruchesAlertesDesactivees == null) {
            ruchesAlertesDesactivees = new HashSet<>();
        }
        model.addAttribute("ruchesAlertesDesactivees", ruchesAlertesDesactivees);

        // 1. Récupérer les ruchers de l'utilisateur
        Set<String> rucherIds = new HashSet<>();
        final Object lockRuchers = new Object();
        dbRef.child("ruchers").orderByChild("apiculteurId").equalTo(uid)
            .addListenerForSingleValueEvent(new ValueEventListener() {
                public void onDataChange(DataSnapshot snapshot) {
                    for (DataSnapshot snap : snapshot.getChildren()) {
                        rucherIds.add(snap.getKey());
                    }
                    synchronized (lockRuchers) { lockRuchers.notify(); }
                }
                public void onCancelled(DatabaseError error) {
                    synchronized (lockRuchers) { lockRuchers.notify(); }
                }
            });
        synchronized (lockRuchers) { lockRuchers.wait(2000); }

        // 2. Charger les ruches appartenant à ces ruchers
        List<Ruche> ruchesFiltrees = new ArrayList<>();
        final Object lockRuches = new Object();
        dbRef.child("ruches").addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot snap : snapshot.getChildren()) {
                    Ruche ruche = snap.getValue(Ruche.class);
                    if (ruche != null && rucherIds.contains(ruche.getRucherId())) {
                        ruche.setId(snap.getKey());
                        ruchesFiltrees.add(ruche);
                    }
                }
                synchronized (lockRuches) { lockRuches.notify(); }
            }
            public void onCancelled(DatabaseError error) {
                synchronized (lockRuches) { lockRuches.notify(); }
            }
        });
        synchronized (lockRuches) { lockRuches.wait(2000); }

        // 3. Charger les mesures et associer la dernière par ruche
        Map<String, Mesure> dernieresMesures = new HashMap<>();
        final Object lockMesures = new Object();

        dbRef.child("mesures").addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                Map<String, List<Mesure>> mesuresParCapteur = new HashMap<>();

                for (DataSnapshot snap : snapshot.getChildren()) {
                    Mesure m = snap.getValue(Mesure.class);
                    if (m != null && m.getRefCapteur() != null) {
                        mesuresParCapteur.computeIfAbsent(m.getRefCapteur(), k -> new ArrayList<>()).add(m);
                    }
                }

                for (Ruche ruche : ruchesFiltrees) {
                    String refCapteur = ruche.getReferenceCapteur();
                    List<Mesure> mesures = mesuresParCapteur.get(refCapteur);
                    if (mesures != null && !mesures.isEmpty()) {
                        mesures.sort((m1, m2) -> {
                            try {
                                return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").parse(m2.getHorodatage())
                                        .compareTo(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").parse(m1.getHorodatage()));
                            } catch (Exception e) {
                                return 0;
                            }
                        });
                        dernieresMesures.put(ruche.getId(), mesures.get(0));
                    }
                }

                synchronized (lockMesures) { lockMesures.notify(); }
            }

            public void onCancelled(DatabaseError error) {
                synchronized (lockMesures) { lockMesures.notify(); }
            }
        });
        synchronized (lockMesures) { lockMesures.wait(2000); }

        // 4. Générer les alertes seulement si elles ne sont pas désactivées globalement
        List<Map<String, Object>> alertes = new ArrayList<>();
        if (!alertesDesactiveesGlobal) {
            for (Ruche ruche : ruchesFiltrees) {
                if (ruchesAlertesDesactivees.contains(ruche.getId())) {
                    // Skip alertes pour cette ruche désactivée individuellement
                    continue;
                }

                Mesure mesure = dernieresMesures.get(ruche.getId());
                if (mesure == null) continue;

                String etatCouvercle = mesure.getEtatCouvercle();
                Double temperature = getDouble(mesure.getTemperature());
                Double humidite = getDouble(mesure.getHumidite());

                if ("OUVERT".equalsIgnoreCase(etatCouvercle)) {
                    Map<String, Object> alerteInfo = new HashMap<>();
                    alerteInfo.put("typeAlerte", "Couvercle ouvert");
                    alerteInfo.put("ruche", ruche);
                    alerteInfo.put("mesure", mesure);
                    alertes.add(alerteInfo);
                }
                if (temperature != null && temperature > 25) {
                    Map<String, Object> alerteInfo = new HashMap<>();
                    alerteInfo.put("typeAlerte", "Température élevée");
                    alerteInfo.put("ruche", ruche);
                    alerteInfo.put("mesure", mesure);
                    alertes.add(alerteInfo);
                }
                if (humidite != null && humidite > 60) {
                    Map<String, Object> alerteInfo = new HashMap<>();
                    alerteInfo.put("typeAlerte", "Humidité élevée");
                    alerteInfo.put("ruche", ruche);
                    alerteInfo.put("mesure", mesure);
                    alertes.add(alerteInfo);
                }
            }
        }
        model.addAttribute("alertes", alertes);

        // Injecter autres attributs dans la vue
        model.addAttribute("ruches", ruchesFiltrees);
        model.addAttribute("dernieresMesures", dernieresMesures);
        model.addAttribute("rucheIdSelected", rucheId);
        model.addAttribute("derniereMesure", rucheId != null ? dernieresMesures.get(rucheId) : null);
        model.addAttribute("email", session.getAttribute("email"));
        model.addAttribute("role", role);

        return "admin";
    }

    @PostMapping("/admin/alertes/toggle")
    public String toggleAlertesRuche(@RequestParam("rucheId") String rucheId,
                                     HttpSession session) {
        @SuppressWarnings("unchecked")
        Set<String> ruchesAlertesDesactivees = (Set<String>) session.getAttribute("ruchesAlertesDesactivees");
        if (ruchesAlertesDesactivees == null) {
            ruchesAlertesDesactivees = new HashSet<>();
        }

        if (ruchesAlertesDesactivees.contains(rucheId)) {
            ruchesAlertesDesactivees.remove(rucheId);
        } else {
            ruchesAlertesDesactivees.add(rucheId);
        }
        session.setAttribute("ruchesAlertesDesactivees", ruchesAlertesDesactivees);

        return "redirect:/admin?rucheId=" + rucheId;
    }

    private Double getDouble(Object obj) {
        if (obj instanceof Number) {
            return ((Number) obj).doubleValue();
        }
        try {
            return obj != null ? Double.parseDouble(obj.toString()) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
