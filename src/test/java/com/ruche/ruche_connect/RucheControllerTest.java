package com.ruche.ruche_connect;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.ruche.ruche_connect.controller.RucheController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@WebMvcTest(RucheController.class)
public class RucheControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean(name = "ruchesRef")
    private DatabaseReference ruchesRef;
    @MockBean(name = "ruchersRef")
    private DatabaseReference ruchersRef;
    @MockBean(name = "mesuresRef")
    private DatabaseReference mesuresRef;

    @Test
    @DisplayName("GET /ruches sans session doit rediriger vers /login")
    void listRuches_redirectsToLogin_whenNotConnected() throws Exception {
        mockMvc.perform(get("/ruches"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));
    }

    @Test
    @DisplayName("GET /ruches/new sans session doit rediriger vers /login")
    void showForm_redirectsToLogin_whenNotConnected() throws Exception {
        mockMvc.perform(get("/ruches/new"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));
    }

    @Test
    @DisplayName("GET /ruches/edit/{id} sans session doit rediriger vers /login")
    void editRuche_redirectsToLogin_whenNotConnected() throws Exception {
        mockMvc.perform(get("/ruches/edit/rucheId"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));
    }

    @Test
    @DisplayName("GET /ruches/delete/{id} sans session doit rediriger vers /login")
    void deleteRuche_redirectsToLogin_whenNotConnected() throws Exception {
        mockMvc.perform(get("/ruches/delete/rucheId"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));
    }

    @Test
    @DisplayName("GET /ruches/mesures sans session retourne erreur JSON")
    void getMesuresParRuche_returnsError_whenNotConnected() throws Exception {
        mockMvc.perform(get("/ruches/mesures"))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"error\":\"Utilisateur non connecté\"}"));
    }
}
