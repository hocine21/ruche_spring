package com.ruche.ruche_connect.controller;

import com.google.firebase.database.*;
import com.google.firebase.database.FirebaseDatabase;
import com.ruche.ruche_connect.model.Intervention;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/interventions")
public class InterventionController {

    private final DatabaseReference interventionsRef = FirebaseDatabase.getInstance().getReference("interventions");

    @PostMapping("/ajouter")
    public String ajouterIntervention(HttpSession session,
                                      @RequestParam String rucheId,
                                      @RequestParam String commentaire,
                                      @RequestParam(defaultValue = "false") boolean intervention) {

        // Vérifier que l'utilisateur est connecté
        String apiculteurId = (String) session.getAttribute("uid");
        if (apiculteurId == null) {
            return "redirect:/login";
        }

        // Ajoute la date/heure
        String dateHeure = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        // Créer l'objet Intervention
        Intervention nouvelleIntervention = new Intervention(
                apiculteurId,
                rucheId,
                commentaire,
                intervention,
                dateHeure // <-- ajoute ce champ dans le modèle Intervention
        );

        // Enregistrer dans Firebase
        interventionsRef.push().setValueAsync(nouvelleIntervention);

        return "redirect:/ruches/" + rucheId; // ou une autre redirection pertinente
    }

    @GetMapping("/count")
    @ResponseBody
    public Map<String, Integer> getInterventionsCount() throws InterruptedException {
        Map<String, Integer> counts = new HashMap<>();
        final Object lock = new Object();

        interventionsRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot snap : snapshot.getChildren()) {
                    Intervention i = snap.getValue(Intervention.class);
                    if (i != null) {
                        counts.put(i.getRucheId(), counts.getOrDefault(i.getRucheId(), 0) + 1);
                    }
                }
                synchronized (lock) { lock.notify(); }
            }
            @Override
            public void onCancelled(DatabaseError error) { synchronized (lock) { lock.notify(); } }
        });
        synchronized (lock) { lock.wait(2000); }
        System.out.println("Interventions count : " + counts);
        return counts;
    }

    @GetMapping("/liste")
    @ResponseBody
    public List<Intervention> getInterventionsParRuche(@RequestParam String rucheId) throws InterruptedException {
        List<Intervention> interventions = new ArrayList<>();
        final Object lock = new Object();

        interventionsRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot snap : snapshot.getChildren()) {
                    Intervention i = snap.getValue(Intervention.class);
                    if (i != null && rucheId.equals(i.getRucheId())) {
                        interventions.add(i);
                    }
                }
                synchronized (lock) { lock.notify(); }
            }
            @Override
            public void onCancelled(DatabaseError error) { synchronized (lock) { lock.notify(); } }
        });
        synchronized (lock) { lock.wait(2000); }
        System.out.println("Interventions pour ruche " + rucheId + " : " + interventions.size());
        // Trie par date décroissante (si tu veux)
        interventions.sort((a, b) -> {
            String da = a.getDateHeure();
            String db = b.getDateHeure();
            if (da == null && db == null) return 0;
            if (da == null) return 1;
            if (db == null) return -1;
            return db.compareTo(da);
        });
        return interventions;
    }
}
