package com.ruche.ruche_connect.controller;

import com.google.firebase.database.*;
import com.ruche.ruche_connect.model.Mesure;
import com.ruche.ruche_connect.model.Ruche;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;

@Controller
@RequestMapping("/mesures")
public class MesureController {

    private final DatabaseReference ruchesRef = FirebaseDatabase.getInstance().getReference("ruches");
    private final DatabaseReference ruchersRef = FirebaseDatabase.getInstance().getReference("ruchers");
    private final DatabaseReference mesuresRef = FirebaseDatabase.getInstance().getReference("mesures");

    @GetMapping
    public String afficherMesures(
            @RequestParam(value = "rucheId", required = false) String rucheId,
            HttpSession session,
            Model model
    ) throws InterruptedException {
        if (session.getAttribute("uid") == null) return "redirect:/login";
        String uid = (String) session.getAttribute("uid");

        List<Ruche> ruchesUtilisateur = new ArrayList<>();
        final Object lock = new Object();

        // Charger toutes les ruches appartenant à l'utilisateur
        ruchesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot ruchesSnapshot) {
                for (DataSnapshot rucheNode : ruchesSnapshot.getChildren()) {
                    Ruche ruche = rucheNode.getValue(Ruche.class);
                    if (ruche != null && ruche.getRucherId() != null) {
                        ruchersRef.child(ruche.getRucherId()).addListenerForSingleValueEvent(new ValueEventListener() {
                            public void onDataChange(DataSnapshot rucherSnapshot) {
                                String apiculteurId = rucherSnapshot.child("apiculteurId").getValue(String.class);
                                if (uid.equals(apiculteurId)) {
                                    ruchesUtilisateur.add(ruche);
                                }
                                synchronized (lock) { lock.notify(); }
                            }

                            public void onCancelled(DatabaseError error) {
                                synchronized (lock) { lock.notify(); }
                            }
                        });
                    }
                }
            }

            public void onCancelled(DatabaseError error) {
                synchronized (lock) { lock.notify(); }
            }
        });

        synchronized (lock) { lock.wait(2000); }

        model.addAttribute("ruches", ruchesUtilisateur);
        model.addAttribute("rucheIdSelected", rucheId);

        if (rucheId != null && !rucheId.isBlank()) {
            return getMesuresByRuche(rucheId, session, model);
        }

        return "mesures";
    }

    public String getMesuresByRuche(String rucheId, HttpSession session, Model model) throws InterruptedException {
        final String[] refCapteur = new String[1];
        final Object lock1 = new Object();

        // Obtenir capteur lié à la ruche
        ruchesRef.child(rucheId).addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                refCapteur[0] = snapshot.child("referenceCapteur").getValue(String.class);
                synchronized (lock1) { lock1.notify(); }
            }

            public void onCancelled(DatabaseError error) {
                synchronized (lock1) { lock1.notify(); }
            }
        });

        synchronized (lock1) { lock1.wait(2000); }

        if (refCapteur[0] == null) {
            model.addAttribute("derniereMesure", null);
            model.addAttribute("mesures", new ArrayList<>());
            return "mesures";
        }

        final List<Mesure> mesures = new ArrayList<>();
        final Object lock2 = new Object();

        // Récupérer toutes les mesures du capteur
        mesuresRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot mNode : snapshot.getChildren()) {
                    if (mNode.hasChild("refCapteur")) {
                        Mesure m = mNode.getValue(Mesure.class);
                        if (refCapteur[0].equals(m.getRefCapteur())) {
                            mesures.add(m);
                        }
                    }
                }
                synchronized (lock2) { lock2.notify(); }
            }

            public void onCancelled(DatabaseError error) {
                synchronized (lock2) { lock2.notify(); }
            }
        });

        synchronized (lock2) { lock2.wait(2000); }

        mesures.sort((m1, m2) -> {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                Date d1 = sdf.parse(m1.getHorodatage());
                Date d2 = sdf.parse(m2.getHorodatage());
                return d2.compareTo(d1);
            } catch (Exception e) {
                return 0;
            }
        });

        Mesure derniere = mesures.isEmpty() ? null : mesures.get(0);
        model.addAttribute("mesures", mesures);
        model.addAttribute("derniereMesure", derniere);
        return "mesures";
    }
}
