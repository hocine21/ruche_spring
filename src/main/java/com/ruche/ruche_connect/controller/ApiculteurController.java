package com.ruche.ruche_connect.controller;

import com.google.firebase.auth.ActionCodeSettings;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.database.*;
import com.ruche.ruche_connect.model.Apiculteur;
import com.ruche.ruche_connect.service.EmailService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ExecutionException;

import com.google.firebase.auth.UserRecord.CreateRequest;

@Controller
@RequestMapping("/apiculteurs")
public class ApiculteurController {

	private final DatabaseReference usersRef;

    public ApiculteurController(@Qualifier("usersRef") DatabaseReference userRef) {
        this.usersRef = userRef;
    }

    @Autowired
    private EmailService emailService;

    private boolean isAdmin(HttpSession session) {
        return session.getAttribute("uid") != null &&
               "Admin".equals(session.getAttribute("role"));
    }

    @GetMapping
    public String listApiculteurs(HttpSession session, Model model) throws InterruptedException {
        if (!isAdmin(session)) return "redirect:/login";

        List<Apiculteur> list = new ArrayList<>();
        final Object lock = new Object();

        usersRef.addListenerForSingleValueEvent(new ValueEventListener() {
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot node : snapshot.getChildren()) {
                    String role = node.child("role").getValue(String.class);
                    if ("Apiculteur".equalsIgnoreCase(role)) {
                        Apiculteur a = node.getValue(Apiculteur.class);
                        list.add(a);
                    }
                }
                synchronized (lock) { lock.notify(); }
            }

            public void onCancelled(DatabaseError error) {
                synchronized (lock) { lock.notify(); }
            }
        });

        synchronized (lock) { lock.wait(2000); }

        model.addAttribute("apiculteurs", list);
        return "apiculteurs";
    }

    @PostMapping("/create")
    public String create(@ModelAttribute Apiculteur apiculteur,
                         @RequestParam String password,
                         HttpSession session,
                         Model model) throws ExecutionException, InterruptedException {
        if (!isAdmin(session)) return "redirect:/login";

        try {
            // 1. Création Firebase Auth
            CreateRequest request = new CreateRequest()
                    .setEmail(apiculteur.getEmail())
                    .setPassword(password)
                    .setDisplayName(apiculteur.getPrenom() + " " + apiculteur.getNom());

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);

            // 2. Enregistrement en DB
            apiculteur.setId(userRecord.getUid());
            apiculteur.setRole("Apiculteur");
            usersRef.child(userRecord.getUid()).setValueAsync(apiculteur);

            // 3. Générer le lien de réinitialisation
            ActionCodeSettings settings = ActionCodeSettings.builder()
                    .setUrl("https://rucheconnect-d9225.firebaseapp.com")
                    .setHandleCodeInApp(false)
                    .build();

            String lienReset = FirebaseAuth.getInstance().generatePasswordResetLink(apiculteur.getEmail(), settings);

            // 4. Envoi de l'email
            String sujet = "Bienvenue sur RucheConnect";
            String message = "Bonjour " + apiculteur.getPrenom() + ",\n\n" +
                    "Votre compte a été créé avec succès.\n" +
                    "Cliquez sur le lien suivant pour définir votre mot de passe :\n\n" +
                    lienReset + "\n\nÀ bientôt,\nL'équipe RucheConnect";

            emailService.envoyer(apiculteur.getEmail(), sujet, message);

        } catch (FirebaseAuthException e) {
            model.addAttribute("error", "Erreur : " + e.getMessage());
            model.addAttribute("apiculteurs", Collections.emptyList());
            return "apiculteurs";
        }

        return "redirect:/apiculteurs";
    }

    @PostMapping("/delete")
    public String delete(@RequestParam String id, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/login";

        usersRef.child(id).removeValueAsync();
        try {
            FirebaseAuth.getInstance().deleteUser(id);
        } catch (FirebaseAuthException e) {
            e.printStackTrace();
        }

        return "redirect:/apiculteurs";
    }
}
