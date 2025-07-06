package com.ruche.ruche_connect.controller;

import com.google.firebase.database.*;
import com.ruche.ruche_connect.model.Intervention;
import com.ruche.ruche_connect.model.Mesure;
import com.ruche.ruche_connect.model.Ruche;
import com.ruche.ruche_connect.service.EmailService;
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
    private final DatabaseReference usersRef = FirebaseDatabase.getInstance().getReference("users");
    private final DatabaseReference interventionsRef = FirebaseDatabase.getInstance().getReference("interventions");

    private final EmailService emailService;
    private final Set<String> capteursNotifies = new HashSet<>();

    public MesureController(EmailService emailService) {
        this.emailService = emailService;
    }

    // --- AFFICHER MESURES ---
    @GetMapping
    public String afficherMesures(@RequestParam(value = "rucheId", required = false) String rucheId,
                                  HttpSession session, Model model) throws InterruptedException {

        if (session.getAttribute("uid") == null) return "redirect:/login";
        String uid = (String) session.getAttribute("uid");

        Set<String> rucherIds = new HashSet<>();
        final Object lock1 = new Object();

        ruchersRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot rucher : snapshot.getChildren()) {
                    String apiculteurId = rucher.child("apiculteurId").getValue(String.class);
                    if (uid.equals(apiculteurId)) {
                        rucherIds.add(rucher.getKey());
                    }
                }
                synchronized (lock1) { lock1.notify(); }
            }
            public void onCancelled(DatabaseError error) {
                synchronized (lock1) { lock1.notify(); }
            }
        });
        synchronized (lock1) { lock1.wait(2000); }

        List<Ruche> ruchesUtilisateur = new ArrayList<>();
        final Object lock2 = new Object();

        ruchesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot rucheSnap : snapshot.getChildren()) {
                    Ruche ruche = rucheSnap.getValue(Ruche.class);
                    if (ruche != null && rucherIds.contains(ruche.getRucherId())) {
                        ruchesUtilisateur.add(ruche);
                    }
                }
                synchronized (lock2) { lock2.notify(); }
            }
            public void onCancelled(DatabaseError error) {
                synchronized (lock2) { lock2.notify(); }
            }
        });
        synchronized (lock2) { lock2.wait(2000); }

        model.addAttribute("ruches", ruchesUtilisateur);
        model.addAttribute("rucheIdSelected", rucheId);

        if (rucheId != null && !rucheId.isBlank()) {
            return getMesuresByRuche(rucheId, model);
        }

        model.addAttribute("derniereMesure", null);
        model.addAttribute("mesures", Collections.emptyList());
        return "mesures";
    }

    // --- MESURES PAR RUCHE ---
    public String getMesuresByRuche(String rucheId, Model model) throws InterruptedException {
        final String[] refCapteur = new String[1];
        final Object lock1 = new Object();

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
            model.addAttribute("mesures", Collections.emptyList());
            return "mesures";
        }

        List<Mesure> mesures = new ArrayList<>();
        final Object lock2 = new Object();

        mesuresRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot snap : snapshot.getChildren()) {
                    Mesure m = snap.getValue(Mesure.class);
                    if (m != null && refCapteur[0].equals(m.getRefCapteur())) {
                        mesures.add(m);
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
                return sdf.parse(m2.getHorodatage()).compareTo(sdf.parse(m1.getHorodatage()));
            } catch (Exception e) { return 0; }
        });

        Mesure derniere = mesures.isEmpty() ? null : mesures.get(0);
        model.addAttribute("derniereMesure", derniere);
        model.addAttribute("mesures", mesures);

        if (derniere != null && "OUVERT".equalsIgnoreCase(derniere.getEtatCouvercle())) {
            notifierOuverture(rucheId, refCapteur[0]);
        }

        return "mesures";
    }

    // --- RUCHES OUVERTES ---
    @GetMapping("/couvercles")
    public String ruchesOuvertes(Model model) throws InterruptedException {
        List<Mesure> ouvertes = new ArrayList<>();
        final Object lock = new Object();

        mesuresRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot snap : snapshot.getChildren()) {
                    Mesure m = snap.getValue(Mesure.class);
                    if (m != null && "OUVERT".equalsIgnoreCase(m.getEtatCouvercle())) {
                        ouvertes.add(m);
                    }
                }
                synchronized (lock) { lock.notify(); }
            }
            public void onCancelled(DatabaseError error) {
                synchronized (lock) { lock.notify(); }
            }
        });

        synchronized (lock) { lock.wait(2000); }

        model.addAttribute("mesuresOuvertes", ouvertes);
        return "mesures/couvercles";
    }

    // --- FERMER COUVERCLE ---
    @PostMapping("/fermer")
    public String fermerCouvercle(@RequestParam String refCapteur) throws InterruptedException {
        final Object lock = new Object();

        mesuresRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot snap : snapshot.getChildren()) {
                    Mesure m = snap.getValue(Mesure.class);
                    if (m != null && refCapteur.equals(m.getRefCapteur()) &&
                        "OUVERT".equalsIgnoreCase(m.getEtatCouvercle())) {
                        snap.getRef().child("etatCouvercle").setValueAsync("FERME");
                        capteursNotifies.remove(refCapteur);
                    }
                }
                synchronized (lock) { lock.notify(); }
            }
            public void onCancelled(DatabaseError error) {
                synchronized (lock) { lock.notify(); }
            }
        });

        synchronized (lock) { lock.wait(2000); }
        return "redirect:/mesures/couvercles";
    }

    // --- NOTIFIER OUVERTURE ---
    private void notifierOuverture(String rucheId, String refCapteur) {
        if (capteursNotifies.contains(refCapteur)) return;

        ruchesRef.child(rucheId).addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot rucheSnap) {
                String rucherId = rucheSnap.child("rucherId").getValue(String.class);
                if (rucherId != null) {
                    ruchersRef.child(rucherId).addListenerForSingleValueEvent(new ValueEventListener() {
                        public void onDataChange(DataSnapshot rucherSnap) {
                            String uid = rucherSnap.child("apiculteurId").getValue(String.class);
                            if (uid != null) {
                                usersRef.child(uid).addListenerForSingleValueEvent(new ValueEventListener() {
                                    public void onDataChange(DataSnapshot userSnap) {
                                        String email = userSnap.child("email").getValue(String.class);
                                        if (email != null && !email.isBlank()) {
                                            emailService.envoyer(
                                                    email,
                                                    "🚨 Alerte : Ruche ouverte",
                                                    "Votre ruche (ID : " + rucheId + ") a été détectée OUVERTE. Merci de vérifier immédiatement."
                                            );
                                            capteursNotifies.add(refCapteur);
                                        }
                                    }
                                    public void onCancelled(DatabaseError error) {}
                                });
                            }
                        }
                        public void onCancelled(DatabaseError error) {}
                    });
                }
            }
            public void onCancelled(DatabaseError error) {}
        });
    }
}
