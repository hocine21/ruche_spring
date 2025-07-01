package com.ruche.ruche_connect.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminController {

    @GetMapping("/admin")
    public String showAdminPage(HttpSession session, Model model) {
        // Vérifier que l'utilisateur est connecté
        String uid = (String) session.getAttribute("uid");
        String role = (String) session.getAttribute("role");

        if (uid == null || role == null ||
                !(role.equalsIgnoreCase("Admin") || role.equalsIgnoreCase("Apiculteur"))) {
            return "redirect:/login";
        }

        // Injecter les infos en vue
        model.addAttribute("email", session.getAttribute("email"));
        model.addAttribute("role", role);
        return "admin";
    }
}
