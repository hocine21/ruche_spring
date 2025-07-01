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

    private final DatabaseReference ruchesRef = FirebaseDatabase.getInstance().getReference("ruches");
    private final DatabaseReference ruchersRef = FirebaseDatabase.getInstance().getReference("ruchers");
    private final DatabaseReference mesuresRef = FirebaseDatabase.getInstance().getReference("mesures");

    private boolean isUserConnected(HttpSession session) {
        return session.getAttribute("uid") != null;
    }

    @GetMapping
    public String listRuches(HttpSession session, Model model, @RequestParam(required = false) String error) throws InterruptedException {
        if (!isUserConnected(session)) return "redirect:/login";

        String apiculteurId = (String) session.getAttribute("uid");
        Set<String> ruchersUser = new HashSet<>();
        List<Ruche> ruches = new ArrayList<>();
        final Object lock = new Object();

        ruchersRef.orderByChild("apiculteurId").equalTo(apiculteurId)
            .addListenerForSingleValueEvent(new ValueEventListener() {
                public void onDataChange(DataSnapshot snapshot) {
                    for (DataSnapshot node : snapshot.getChildren()) {
                        ruchersUser.add(node.getKey());
                    }
                    synchronized (lock) { lock.notify(); }
                }
                public void onCancelled(DatabaseError error) { synchronized (lock) { lock.notify(); } }
            });

        synchronized (lock) { lock.wait(2000); }

        final Object lock2 = new Object();
        ruchesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot node : snapshot.getChildren()) {
                    Ruche ruche = node.getValue(Ruche.class);
                    if (ruchersUser.contains(ruche.getRucherId())) {
                        ruches.add(ruche);
                    }
                }
                synchronized (lock2) { lock2.notify(); }
            }
            public void onCancelled(DatabaseError error) { synchronized (lock2) { lock2.notify(); } }
        });

        synchronized (lock2) { lock2.wait(2000); }

        model.addAttribute("ruches", ruches);
        model.addAttribute("error", error);
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

        model.addAttribute("ruche", new Ruche());
        model.addAttribute("ruchers", ruchersUser);
        return "ruches/form";
    }

    @PostMapping
    public String saveRuche(@ModelAttribute Ruche ruche, HttpSession session) throws InterruptedException {
        if (!isUserConnected(session)) return "redirect:/login";

        final Set<String> capteursUtilises = new HashSet<>();
        final List<String> capteursDispos = new ArrayList<>();
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

        final Object lock2 = new Object();
        mesuresRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot node : snapshot.getChildren()) {
                    String ref = node.getKey();
                    if (!capteursUtilises.contains(ref)) {
                        capteursDispos.add(ref);
                    }
                }
                synchronized (lock2) { lock2.notify(); }
            }
            public void onCancelled(DatabaseError error) { synchronized (lock2) { lock2.notify(); } }
        });

        synchronized (lock2) { lock2.wait(2000); }

        if (capteursDispos.isEmpty()) {
            return "redirect:/ruches?error=aucun_capteur_libre";
        }

        String capteurAttribue = capteursDispos.get(0); // 1er capteur libre
        String id = ruchesRef.push().getKey();
        ruche.setId(id);
        ruche.setReferenceCapteur(capteurAttribue);
        ruchesRef.child(id).setValueAsync(ruche);

        return "redirect:/ruches";
    }

    @GetMapping("/edit/{id}")
    public String editRuche(@PathVariable String id, HttpSession session, Model model) throws InterruptedException {
        if (!isUserConnected(session)) return "redirect:/login";

        final Ruche[] ruche = new Ruche[1];
        final Object lock = new Object();

        ruchesRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                ruche[0] = snapshot.getValue(Ruche.class);
                synchronized (lock) { lock.notify(); }
            }

            public void onCancelled(DatabaseError error) { synchronized (lock) { lock.notify(); } }
        });

        synchronized (lock) { lock.wait(2000); }

        model.addAttribute("ruche", ruche[0]);
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
}
