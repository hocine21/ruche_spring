package com.ruche.ruche_connect;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import com.google.firebase.database.DatabaseReference;
import com.ruche.ruche_connect.controller.MesureController;
import com.ruche.ruche_connect.service.EmailService;

@WebMvcTest(MesureController.class)
public class MesureControllerTest {
   
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmailService emailService;
    @MockBean(name = "ruchesRef")
    private DatabaseReference ruchesRef;
    @MockBean(name = "ruchersRef")
    private DatabaseReference ruchersRef;
    @MockBean(name = "mesuresRef")
    private DatabaseReference mesuresRef;
    @MockBean(name = "usersRef")
    private DatabaseReference usersRef;
    @MockBean(name = "interventionsRef")
    private DatabaseReference interventionsRef;

    
    /**
     * ✅ Cas SANS session — accès interdit => redirection vers /login
     */
    @Test
    @DisplayName("GET /mesures sans session redirige vers /login")
    void getMesures_shouldRedirectToLogin_ifNotLoggedIn() throws Exception {
        mockMvc.perform(get("/mesures"))
            .andExpect(status().is3xxRedirection())
            .andExpect(redirectedUrl("/login"));
    }

    /**
     * ✅ Cas AVEC session — accès autorisé (pas de redirection)
     */
    @ParameterizedTest
    @DisplayName("Toutes les routes /mesures accessibles avec session active")
    @ValueSource(strings = {
            "/mesures",
            "/mesures/couvercles"
    })
    void routesMesures_withSession_returnOkOrView(String url) throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("uid", "fakeUserId");

        mockMvc.perform(get(url).session(session))
                .andExpect(status().isOk());
    }

    /**
     * ✅ Exemple de test POST (fermer couvercle)
     */
    @Test
    @DisplayName("GET /mesures avec session retourne 200 OK")
    void getMesures_shouldReturnOk_ifLoggedIn() throws Exception {
        mockMvc.perform(get("/mesures")
                .sessionAttr("uid", "fakeUserId"))
            .andExpect(status().isOk())
            .andExpect(view().name("mesures")); // ou "mesures" si tu veux tester le nom du template
    }

}
