package com.ruche.ruche_connect;

import com.google.firebase.auth.FirebaseToken;
import com.ruche.ruche_connect.controller.AuthController;
import com.ruche.ruche_connect.service.FirebaseUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FirebaseUserService firebaseUserService;

    private MockHttpSession session;

    @BeforeEach
    void setup() {
        session = new MockHttpSession();
    }

    @Test
    void testShowLoginPage() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(status().isOk())
                .andExpect(view().name("login"));
    }

    @Test
    void testProcessLoginInvalidCredentials() throws Exception {
        when(firebaseUserService.signInAndGetIdToken(anyString(), anyString()))
                .thenReturn(null);

        mockMvc.perform(post("/login")
                        .param("email", "wrong@test.com")
                        .param("password", "badpass"))
                .andExpect(status().isOk())
                .andExpect(view().name("login"))
                .andExpect(model().attributeExists("error"));
    }

    @Test
    void testProcessLoginValidAdmin() throws Exception {
        // Mock Firebase Auth
        when(firebaseUserService.signInAndGetIdToken(anyString(), anyString()))
                .thenReturn("token123");

        FirebaseToken mockToken = Mockito.mock(FirebaseToken.class);
        when(mockToken.getUid()).thenReturn("user123");

        when(firebaseUserService.verifyToken("token123")).thenReturn(mockToken);
        when(firebaseUserService.getUserRole("user123")).thenReturn("Admin");

        mockMvc.perform(post("/login")
                        .param("email", "admin@test.com")
                        .param("password", "pass")
                        .session(session))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin"));

        // Vérifier que les attributs sont bien en session
        assert session.getAttribute("uid").equals("user123");
        assert session.getAttribute("role").equals("Admin");
    }

    @Test
    void testProcessLoginUnauthorizedRole() throws Exception {
        when(firebaseUserService.signInAndGetIdToken(anyString(), anyString()))
                .thenReturn("token123");

        FirebaseToken mockToken = Mockito.mock(FirebaseToken.class);
        when(mockToken.getUid()).thenReturn("user456");

        when(firebaseUserService.verifyToken("token123")).thenReturn(mockToken);
        when(firebaseUserService.getUserRole("user456")).thenReturn("Visiteur");

        mockMvc.perform(post("/login")
                        .param("email", "visitor@test.com")
                        .param("password", "pass"))
                .andExpect(status().isOk())
                .andExpect(view().name("login"))
                .andExpect(model().attributeExists("error"));
    }

    @Test
    void testLogout() throws Exception {
        session.setAttribute("uid", "user123");

        mockMvc.perform(get("/logout").session(session))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?logout"));

        // La session doit être invalidée
        assert session.isInvalid();
    }
}
