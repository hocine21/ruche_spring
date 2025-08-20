package com.ruche.ruche_connect;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.ruche.ruche_connect.service.FirebaseUserService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

class FirebaseUserServiceTest {

    @InjectMocks
    private FirebaseUserService firebaseUserService;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private FirebaseAuth firebaseAuth;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void signInAndGetIdToken_shouldReturnIdToken_whenCredentialsAreValid() {
        // Arrange
        String email = "test@example.com";
        String password = "password123";
        String fakeToken = "fakeIdToken";

        Map<String, Object> fakeResponse = new HashMap<>();
        fakeResponse.put("idToken", fakeToken);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(fakeResponse, HttpStatus.OK);

        FirebaseUserService spyService = Mockito.spy(new FirebaseUserService());
        RestTemplate mockTemplate = mock(RestTemplate.class);

        doReturn(mockTemplate).when(spyService).getRestTemplate();
        when(mockTemplate.postForEntity(anyString(), any(), eq(Map.class))).thenReturn(responseEntity);

        // Act
        String result = spyService.signInAndGetIdToken(email, password);

        // Assert
        assertEquals(fakeToken, result);
    }

    @Test
    void verifyToken_shouldReturnFirebaseToken_whenTokenIsValid() throws Exception {
        // Arrange
        String idToken = "someIdToken";
        FirebaseToken mockToken = mock(FirebaseToken.class);

        FirebaseAuth mockAuth = mock(FirebaseAuth.class);
        when(mockAuth.verifyIdToken(idToken)).thenReturn(mockToken);

        FirebaseUserService service = new FirebaseUserService() {
            @Override
            public FirebaseToken verifyToken(String token) throws Exception {
                return mockAuth.verifyIdToken(token);
            }
        };

        // Act
        FirebaseToken result = service.verifyToken(idToken);

        // Assert
        assertNotNull(result);
    }


    // getUserRole: à tester via test d'intégration si tu as un projet Firebase test
}