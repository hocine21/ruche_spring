package com.ruche.ruche_connect.controller;

import com.google.firebase.database.*;
import com.ruche.ruche_connect.model.Ruche;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Controller
@RequestMapping("/ruches")
public class RucheController {

    private final DatabaseReference ruchesRef;
    private final DatabaseReference ruchersRef;
    private final DatabaseReference mesuresRef;

    public RucheController(DatabaseReference ruchesRef,
                           DatabaseReference ruchersRef,
                           DatabaseReference mesuresRef) {
        this.ruchesRef = ruchesRef;
        this.ruchersRef = ruchersRef;
        this.mesuresRef = mesuresRef;
    }

    private boolean isUserConnected(HttpSession session) {
        return session.getAttribute("uid") != null;
    }

    @GetMapping
    public String listRuches(HttpSession session, Model model,
                             @RequestParam(required = false) String error,
                             @RequestParam(required = false) String filterRucherId) throws InterruptedException {
        if (!isUserConnected(session)) return "redirect:/login";

        String apiculteurId = (String) session.getAttribute("uid");
        Set<String> ruchersUser = new HashSet<>();
        Map<String, String> ruchersMap = new HashMap<>();
        List<Ruche> ruches = new ArrayList<>();
        final Object lockRuchers = new Object();

        ruchersRef.orderByChild("apiculteurId").equalTo(apiculteurId)
            .addListenerForSingleValueEvent(new ValueEventListener() {
                public void onDataChange(DataSnapshot snapshot) {
                    for (DataSnapshot node : snapshot.getChildren()) {
                        ruchersUser.add(node.getKey());
                        ruchersMap.put(node.getKey(), node.child("nom").getValue(String.class));
                    }
                    synchronized (lockRuchers) { lockRuchers.notify(); }
                }
                public void onCancelled(DatabaseError error) { synchronized (lockRuchers) { lockRuchers.notify(); } }
            });

        synchronized (lockRuchers) { lockRuchers.wait(2000); }

        final Object lockRuches = new Object();

        ruchesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot node : snapshot.getChildren()) {
                    Ruche ruche = node.getValue(Ruche.class);
                    if (ruchersUser.contains(ruche.getRucherId())) {
                        if (filterRucherId == null || filterRucherId.isEmpty() || ruche.getRucherId().equals(filterRucherId)) {
                            ruches.add(ruche);
                        }
                    }
                }
                synchronized (lockRuches) { lockRuches.notify(); }
            }
            public void onCancelled(DatabaseError error) { synchronized (lockRuches) { lockRuches.notify(); } }
        });

        synchronized (lockRuches) { lockRuches.wait(2000); }

        model.addAttribute("ruches", ruches);
        model.addAttribute("ruchersMap", ruchersMap);
        model.addAttribute("ruchers", ruchersUser);
        model.addAttribute("error", error);
        model.addAttribute("filterRucherId", filterRucherId);

        return "ruches/list";
    }

    @GetMapping("/new")
    public String showForm(HttpSession session, Model model) throws InterruptedException {
        if (!isUserConnected(session)) return "redirect:/login";

        String apiculteurId = (String) session.getAttribute("uid");
        List<Map<String, String>> ruchersUser = new ArrayList<>();
        final Object lock = new Object();

        ruchersRef.orderByChild("apiculteurId").equalTo(apiculteurId)
            .addListenerForSingleValueEvent(new ValueEventListener() {
                public void onDataChange(DataSnapshot snapshot) {
                    for (DataSnapshot node : snapshot.getChildren()) {
                        Map<String, String> data = new HashMap<>();
                        data.put("id", node.getKey());
                        data.put("nom", node.child("nom").getValue(String.class));
                        ruchersUser.add(data);
                    }
                    synchronized (lock) { lock.notify(); }
                }
                public void onCancelled(DatabaseError error) { synchronized (lock) { lock.notify(); } }
            });

        synchronized (lock) { lock.wait(2000); }

        // 1. Récupérer tous les refCapteur présents dans les mesures
        final Set<String> tousLesCapteurs = new HashSet<>();
        final Object lockMesures = new Object();
        mesuresRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot node : snapshot.getChildren()) {
                    if (node.hasChild("refCapteur")) {
                        String ref = node.child("refCapteur").getValue(String.class);
                        if (ref != null && !ref.isBlank()) {
                            tousLesCapteurs.add(ref);
                        }
                    }
                }
                synchronized (lockMesures) { lockMesures.notify(); }
            }
            public void onCancelled(DatabaseError error) { synchronized (lockMesures) { lockMesures.notify(); } }
        });
        synchronized (lockMesures) { lockMesures.wait(2000); }

        // 2. Récupérer tous les capteurs déjà utilisés par une ruche
        final Set<String> capteursUtilises = new HashSet<>();
        final Object lockRuches = new Object();
        ruchesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot node : snapshot.getChildren()) {
                    String ref = node.child("referenceCapteur").getValue(String.class);
                    if (ref != null && !ref.isBlank()) {
                        capteursUtilises.add(ref);
                    }
                }
                synchronized (lockRuches) { lockRuches.notify(); }
            }
            public void onCancelled(DatabaseError error) { synchronized (lockRuches) { lockRuches.notify(); } }
        });
        synchronized (lockRuches) { lockRuches.wait(2000); }

        // 3. Si édition, autoriser le capteur déjà attribué à la ruche courante
        // Note: rucheEnCoursEdition is not defined in this method, so this block is commented out.
        // if (rucheEnCoursEdition != null && rucheEnCoursEdition.getReferenceCapteur() != null) {
        //     capteursUtilises.remove(rucheEnCoursEdition.getReferenceCapteur());
        // }

        // 4. Capteurs disponibles = tous - déjà utilisés
        Set<String> capteursDispos = new HashSet<>(tousLesCapteurs);
        capteursDispos.removeAll(capteursUtilises);

        if (capteursDispos.isEmpty()) {
            model.addAttribute("error", "Aucun capteur disponible. Veuillez contacter l’équipe technique pour en obtenir un nouveau.");
            return "ruches/form";
        }

        model.addAttribute("ruche", new Ruche());
        model.addAttribute("ruchers", ruchersUser);
        model.addAttribute("capteursDispos", capteursDispos);
        return "ruches/form";
    }

    @PostMapping
    public String saveRuche(@ModelAttribute Ruche ruche, HttpSession session, Model model) throws InterruptedException {
        if (!isUserConnected(session)) return "redirect:/login";

        // Vérifier que le capteur n'est pas déjà utilisé
        final Set<String> capteursUtilises = new HashSet<>();
        final Object lock = new Object();

        ruchesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot node : snapshot.getChildren()) {
                    Ruche r = node.getValue(Ruche.class);
                    if (r.getReferenceCapteur() != null) {
                        capteursUtilises.add(r.getReferenceCapteur());
                    }
                }
                synchronized (lock) { lock.notify(); }
            }
            public void onCancelled(DatabaseError error) { synchronized (lock) { lock.notify(); } }
        });

        synchronized (lock) { lock.wait(2000); }

        if (capteursUtilises.contains(ruche.getReferenceCapteur())) {
            model.addAttribute("error", "Ce capteur est déjà attribué à une autre ruche.");
            // Recharger les listes pour le formulaire
            // ... (ajoute ici le code pour recharger ruchers et capteursDispos)
            model.addAttribute("ruche", ruche);
            return "ruches/form";
        }

        String id = ruchesRef.push().getKey();
        ruche.setId(id);
        // NE PAS écraser la valeur du capteur choisie par l'utilisateur
        ruchesRef.child(id).setValueAsync(ruche);

        return "redirect:/ruches";
    }

    @GetMapping("/edit/{id}")
    public String editRuche(@PathVariable String id, HttpSession session, Model model) throws InterruptedException {
        if (!isUserConnected(session)) return "redirect:/login";

        String apiculteurId = (String) session.getAttribute("uid");
        List<Map<String, String>> ruchersUser = new ArrayList<>();
        final Object lockRuchers = new Object();

        ruchersRef.orderByChild("apiculteurId").equalTo(apiculteurId)
            .addListenerForSingleValueEvent(new ValueEventListener() {
                public void onDataChange(DataSnapshot snapshot) {
                    for (DataSnapshot node : snapshot.getChildren()) {
                        Map<String, String> data = new HashMap<>();
                        data.put("id", node.getKey());
                        data.put("nom", node.child("nom").getValue(String.class));
                        ruchersUser.add(data);
                    }
                    synchronized (lockRuchers) { lockRuchers.notify(); }
                }
                public void onCancelled(DatabaseError error) { synchronized (lockRuchers) { lockRuchers.notify(); } }
            });

        synchronized (lockRuchers) { lockRuchers.wait(2000); }

        final Ruche[] ruche = new Ruche[1];
        final Object lockRuche = new Object();

        ruchesRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                ruche[0] = snapshot.getValue(Ruche.class);
                synchronized (lockRuche) { lockRuche.notify(); }
            }
            public void onCancelled(DatabaseError error) { synchronized (lockRuche) { lockRuche.notify(); } }
        });

        synchronized (lockRuche) { lockRuche.wait(2000); }

        final Set<String> capteursUtilises = new HashSet<>();
        final List<String> capteursDispos = new ArrayList<>();
        final Object lock = new Object();

        ruchesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot node : snapshot.getChildren()) {
                    Ruche r = node.getValue(Ruche.class);
                    if (r.getReferenceCapteur() != null && !r.getId().equals(ruche[0].getId())) {
                        capteursUtilises.add(r.getReferenceCapteur());
                    }
                }
                synchronized (lock) { lock.notify(); }
            }
            public void onCancelled(DatabaseError error) { synchronized (lock) { lock.notify(); } }
        });

        synchronized (lock) { lock.wait(2000); }

        final Object lock2 = new Object();
        mesuresRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot node : snapshot.getChildren()) {
                    String ref = node.getKey();
                    if (!capteursUtilises.contains(ref) || ref.equals(ruche[0].getReferenceCapteur())) {
                        capteursDispos.add(ref);
                    }
                }
                synchronized (lock2) { lock2.notify(); }
            }
            public void onCancelled(DatabaseError error) { synchronized (lock2) { lock2.notify(); } }
        });

        synchronized (lock2) { lock2.wait(2000); }

        model.addAttribute("ruche", ruche[0]);
        model.addAttribute("ruchers", ruchersUser);
        model.addAttribute("capteursDispos", capteursDispos);
        return "ruches/form";
    }

    @PostMapping("/update")
    public String updateRuche(@ModelAttribute Ruche ruche, HttpSession session) {
        if (!isUserConnected(session)) return "redirect:/login";
        ruchesRef.child(ruche.getId()).setValueAsync(ruche);
        return "redirect:/ruches";
    }

    @GetMapping("/delete/{id}")
    public String delete(@PathVariable String id, HttpSession session) {
        if (!isUserConnected(session)) return "redirect:/login";
        ruchesRef.child(id).removeValueAsync();
        return "redirect:/ruches";
    }

    // -------------------- Nouvelle route pour retourner ruches + mesures au format JSON --------------------

    @GetMapping("/mesures")
    @ResponseBody
    public Map<String, Object> getMesuresParRuche(HttpSession session) throws InterruptedException {
        if (!isUserConnected(session)) return Collections.singletonMap("error", "Utilisateur non connecté");

        String apiculteurId = (String) session.getAttribute("uid");
        Set<String> ruchersUser = new HashSet<>();
        final Object lockRuchers = new Object();

        // Récupérer ruchers de l'utilisateur
        ruchersRef.orderByChild("apiculteurId").equalTo(apiculteurId)
            .addListenerForSingleValueEvent(new ValueEventListener() {
                public void onDataChange(DataSnapshot snapshot) {
                    for (DataSnapshot node : snapshot.getChildren()) {
                        ruchersUser.add(node.getKey());
                    }
                    synchronized (lockRuchers) { lockRuchers.notify(); }
                }
                public void onCancelled(DatabaseError error) { synchronized (lockRuchers) { lockRuchers.notify(); } }
            });
        synchronized (lockRuchers) { lockRuchers.wait(2000); }

        // Récupérer ruches pour ces ruchers
        List<Ruche> ruchesUser = new ArrayList<>();
        final Object lockRuches = new Object();

        ruchesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot node : snapshot.getChildren()) {
                    Ruche ruche = node.getValue(Ruche.class);
                    if (ruche != null && ruchersUser.contains(ruche.getRucherId())) {
                        ruchesUser.add(ruche);
                    }
                }
                synchronized (lockRuches) { lockRuches.notify(); }
            }
            public void onCancelled(DatabaseError error) { synchronized (lockRuches) { lockRuches.notify(); } }
        });

        synchronized (lockRuches) { lockRuches.wait(2000); }

        // Pour chaque ruche, récupérer la dernière mesure associée (par horodatage)
        Map<String, Object> result = new HashMap<>();
        final Object lockMesures = new Object();

        mesuresRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (Ruche ruche : ruchesUser) {
                    Map<String, Object> rucheData = new HashMap<>();
                    rucheData.put("id", ruche.getId());
                    rucheData.put("nom", ruche.getNom());
                    rucheData.put("rucherId", ruche.getRucherId());
                    rucheData.put("referenceCapteur", ruche.getReferenceCapteur());

                    // Chercher la dernière mesure de ce capteur
                    Map<String, Object> lastMesure = null;
                    String lastHorodatage = null;
                    for (DataSnapshot mesureSnap : snapshot.getChildren()) {
                        Object refCapteurObj = mesureSnap.child("refCapteur").getValue();
                        if (refCapteurObj != null && ruche.getReferenceCapteur() != null &&
                            refCapteurObj.toString().equalsIgnoreCase(ruche.getReferenceCapteur())) {
                            String horodatage = mesureSnap.child("horodatage").getValue(String.class);
                            if (horodatage != null && (lastHorodatage == null || horodatage.compareTo(lastHorodatage) > 0)) {
                                lastHorodatage = horodatage;
                                lastMesure = (Map<String, Object>) mesureSnap.getValue();
                            }
                        }
                    }
                    rucheData.put("mesure", lastMesure); // une seule mesure (la plus récente)
                    result.put(ruche.getId(), rucheData);
                }
                synchronized (lockMesures) { lockMesures.notify(); }
            }
            public void onCancelled(DatabaseError error) { synchronized (lockMesures) { lockMesures.notify(); } }
        });
        synchronized (lockMesures) { lockMesures.wait(2000); }

        return result;
    }
}
