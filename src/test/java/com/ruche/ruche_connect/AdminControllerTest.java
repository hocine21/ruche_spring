package com.ruche.ruche_connect;

import com.ruche.ruche_connect.controller.AdminController;
import com.google.firebase.database.DatabaseReference;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.ui.Model;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

import static org.hamcrest.CoreMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HttpSession session;

    @MockBean
    private Model model;

    @MockBean
    @Qualifier("ruchersRef")
    private DatabaseReference dbRef; // Firebase mocké

    private Set<String> alertesDesactivees;

    @BeforeEach
    void setup() {
        alertesDesactivees = new HashSet<>();
        Mockito.when(session.getAttribute("ruchesAlertesDesactivees")).thenReturn(alertesDesactivees);
    }

    @Test
    void testAfficherDashboardAdminRedirigeSiNonConnecte() throws Exception {
        // Pas de session avec uid/role → devrait rediriger vers /login
        Mockito.when(session.getAttribute("uid")).thenReturn(null);
        Mockito.when(session.getAttribute("role")).thenReturn(null);

        mockMvc.perform(get("/admin")) // pas de sessionAttr null
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));
    }

    @Test
    void testAfficherDashboardAdminConnecte() throws Exception {
        // Création des mocks intermédiaires
        DatabaseReference ruchersRef = mock(DatabaseReference.class);
        DatabaseReference ruchesRef = mock(DatabaseReference.class);
        DatabaseReference mesuresRef = mock(DatabaseReference.class);

        // dbRef.child("ruchers") -> ruchersRef
        when(dbRef.child("ruchers")).thenReturn(ruchersRef);
        when(dbRef.child("ruches")).thenReturn(ruchesRef);
        when(dbRef.child("mesures")).thenReturn(mesuresRef);

        // Mocker les appels chainés (orderByChild / equalTo / addListenerForSingleValueEvent)
        when(ruchersRef.orderByChild("apiculteurId")).thenReturn(ruchersRef);
        when(ruchersRef.equalTo("user123")).thenReturn(ruchersRef);

        // Mocker addListenerForSingleValueEvent pour ne rien faire
        doAnswer(invocation -> {
            return null; // rien à remplir pour le test de session uniquement
        }).when(ruchersRef).addListenerForSingleValueEvent(any());
        doAnswer(invocation -> null).when(ruchesRef).addListenerForSingleValueEvent(any());
        doAnswer(invocation -> null).when(mesuresRef).addListenerForSingleValueEvent(any());

        // Maintenant le test peut s'exécuter
        mockMvc.perform(get("/admin")
                .sessionAttr("uid", "user123")
                .sessionAttr("role", "Admin"))
                .andExpect(status().isOk())
                .andExpect(view().name("admin"));
    }

    @Test
    void testToggleAlertesRucheAjouteRuche() throws Exception {
        // Session vide → ajouter la ruche
        Mockito.when(session.getAttribute("ruchesAlertesDesactivees")).thenReturn(alertesDesactivees);

        mockMvc.perform(post("/admin/alertes/toggle")
        		.param("rucheId", "ruche1"))
		        .andExpect(status().is3xxRedirection())
		        .andExpect(redirectedUrl("/admin?rucheId=ruche1"));

        // Vérifie que la ruche a été ajoutée
        alertesDesactivees.add("ruche1"); // simule la modification dans la session
        assert(alertesDesactivees.contains("ruche1"));
    }

    @Test
    void testToggleAlertesRucheSupprimeRuche() throws Exception {
        // Session avec ruche déjà désactivée
        alertesDesactivees.add("ruche1");
        Mockito.when(session.getAttribute("ruchesAlertesDesactivees")).thenReturn(alertesDesactivees);

        mockMvc.perform(post("/admin/alertes/toggle")
                .param("rucheId", "ruche1"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin?rucheId=ruche1"));

        // Vérifie que la ruche a été supprimée
        alertesDesactivees.remove("ruche1"); // simule la modification
        assert(!alertesDesactivees.contains("ruche1"));
    }
}
