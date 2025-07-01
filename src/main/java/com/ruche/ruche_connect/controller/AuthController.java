package com.ruche.ruche_connect.controller;

import com.google.firebase.auth.FirebaseToken;
import com.ruche.ruche_connect.service.FirebaseUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class AuthController {

    @Autowired
    private FirebaseUserService firebaseUserService;

    @GetMapping("/login")
    public String showLoginPage() {
        return "login";
    }

    @PostMapping("/login")
    public String processLogin(@RequestParam String email,
                               @RequestParam String password,
                               HttpSession session,
                               Model model) {
        try {
            // Authentifier avec Firebase Auth REST API
            String idToken = firebaseUserService.signInAndGetIdToken(email, password);
            if (idToken == null) {
                model.addAttribute("error", "Email ou mot de passe invalide.");
                return "login";
            }

            // Vérifier le token avec Firebase Admin
            FirebaseToken decoded = firebaseUserService.verifyToken(idToken);
            String uid = decoded.getUid();

            // Lire le rôle depuis Realtime Database
            String role = firebaseUserService.getUserRole(uid);

            if (role == null || !(role.equalsIgnoreCase("Admin") || role.equalsIgnoreCase("Apiculteur"))) {
                model.addAttribute("error", "Accès refusé : rôle non autorisé.");
                return "login";
            }

            // Stocker en session
            session.setAttribute("uid", uid);
            session.setAttribute("email", email);
            session.setAttribute("role", role);

            return "redirect:/admin";

        } catch (Exception e) {
            model.addAttribute("error", "Erreur : " + e.getMessage());
            return "login";
        }
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login?logout";
    }
}
