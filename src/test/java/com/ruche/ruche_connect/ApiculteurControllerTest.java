package com.ruche.ruche_connect;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.database.DatabaseReference;
import com.ruche.ruche_connect.controller.ApiculteurController;
import com.ruche.ruche_connect.model.Apiculteur;
import com.ruche.ruche_connect.service.EmailService;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.concurrent.ExecutionException;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ApiculteurControllerTest {

    private MockMvc mockMvc;

    @Mock
    private EmailService emailService;

    @Mock
    private DatabaseReference usersRef;

    @Mock
    private HttpSession session;

    @InjectMocks
    private ApiculteurController apiculteurController;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(apiculteurController).build();
    }

    @Test
    void testCreateApiculteurNonAdmin() throws Exception {
        when(session.getAttribute("role")).thenReturn("User");

        mockMvc.perform(post("/apiculteurs/create")
                        .param("password", "test123")
                        .flashAttr("apiculteur", new Apiculteur()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));
    }

    @Test
    void testDeleteApiculteurNonAdmin() throws Exception {
        when(session.getAttribute("role")).thenReturn("User");

        mockMvc.perform(post("/apiculteurs/delete")
                        .param("id", "abc123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));
    }

    // ⚠️ Pour tester la création avec FirebaseAuth, il faudra mocker FirebaseAuth via un "mockStatic"
    // Exemple :
    /*
    @Test
    void testCreateApiculteurAdmin() throws Exception {
        when(session.getAttribute("uid")).thenReturn("user123");
        when(session.getAttribute("role")).thenReturn("Admin");

        Apiculteur apiculteur = new Apiculteur();
        apiculteur.setEmail("test@test.com");
        apiculteur.setPrenom("John");
        apiculteur.setNom("Doe");

        try (MockedStatic<FirebaseAuth> mocked = mockStatic(FirebaseAuth.class)) {
            FirebaseAuth auth = mock(FirebaseAuth.class);
            UserRecord record = mock(UserRecord.class);

            when(record.getUid()).thenReturn("uid123");
            when(auth.createUser(any())).thenReturn(record);
            mocked.when(FirebaseAuth::getInstance).thenReturn(auth);

            mockMvc.perform(post("/apiculteurs/create")
                            .flashAttr("apiculteur", apiculteur)
                            .param("password", "123456"))
                    .andExpect(status().is3xxRedirection())
                    .andExpect(redirectedUrl("/apiculteurs"));
        }
    }
    */
}
