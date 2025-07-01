package com.ruche.ruche_connect.controller;

import com.google.firebase.database.*;
import com.ruche.ruche_connect.model.Rucher;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Controller
@RequestMapping("/ruchers")
public class RucherController {

    private final DatabaseReference ruchersRef = FirebaseDatabase.getInstance().getReference("ruchers");

    @GetMapping
    public String listRuchers(HttpSession session, Model model) throws InterruptedException {
        String apiculteurId = (String) session.getAttribute("uid");
        List<Rucher> ruchers = new ArrayList<>();
        final Object lock = new Object();

        ruchersRef.orderByChild("apiculteurId").equalTo(apiculteurId)
            .addListenerForSingleValueEvent(new ValueEventListener() {
                public void onDataChange(DataSnapshot snapshot) {
                    for (DataSnapshot child : snapshot.getChildren()) {
                        Rucher rucher = child.getValue(Rucher.class);
                        ruchers.add(rucher);
                    }
                    synchronized (lock) {
                        lock.notify();
                    }
                }

                public void onCancelled(DatabaseError error) {
                    synchronized (lock) {
                        lock.notify();
                    }
                }
            });

        synchronized (lock) { lock.wait(3000); }

        model.addAttribute("ruchers", ruchers);
        return "ruchers/list";
    }

    @GetMapping("/new")
    public String showForm(Model model) {
        model.addAttribute("rucher", new Rucher());
        return "ruchers/form";
    }

    @PostMapping
    public String saveRucher(@ModelAttribute Rucher rucher, HttpSession session) {
        String apiculteurId = (String) session.getAttribute("uid");
        String id = ruchersRef.push().getKey();
        rucher.setId(id);
        rucher.setApiculteurId(apiculteurId);

        ruchersRef.child(id).setValueAsync(rucher);
        return "redirect:/ruchers";
    }

    @GetMapping("/edit/{id}")
    public String editRucher(@PathVariable String id, Model model) throws InterruptedException {
        final Rucher[] rucher = new Rucher[1];
        final Object lock = new Object();

        ruchersRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                rucher[0] = snapshot.getValue(Rucher.class);
                synchronized (lock) {
                    lock.notify();
                }
            }

            public void onCancelled(DatabaseError error) {
                synchronized (lock) {
                    lock.notify();
                }
            }
        });

        synchronized (lock) { lock.wait(3000); }

        model.addAttribute("rucher", rucher[0]);
        return "ruchers/form";
    }

    @PostMapping("/update")
    public String updateRucher(@ModelAttribute Rucher rucher, HttpSession session) {
        String apiculteurId = (String) session.getAttribute("uid");
        rucher.setApiculteurId(apiculteurId);
        ruchersRef.child(rucher.getId()).setValueAsync(rucher);
        return "redirect:/ruchers";
    }

    @GetMapping("/delete/{id}")
    public String deleteRucher(@PathVariable String id) {
        ruchersRef.child(id).removeValueAsync();
        return "redirect:/ruchers";
    }
}
