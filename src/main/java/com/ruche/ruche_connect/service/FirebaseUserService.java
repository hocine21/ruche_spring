package com.ruche.ruche_connect.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.database.*;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class FirebaseUserService {

    private final String FIREBASE_API_KEY = "AIzaSyA2XMx0mSXYYUP2ISfYqXWVzppA39cDymc";

    public String signInAndGetIdToken(String email, String password) {
        String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + FIREBASE_API_KEY;
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> payload = new HashMap<>();
        payload.put("email", email);
        payload.put("password", password);
        payload.put("returnSecureToken", true);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, payload, Map.class);
            Map<String, Object> body = response.getBody();
            return (String) body.get("idToken");
        } catch (Exception e) {
            return null;
        }
    }

    public FirebaseToken verifyToken(String idToken) throws Exception {
        return FirebaseAuth.getInstance().verifyIdToken(idToken);
    }

    public String getUserRole(String uid) throws InterruptedException {
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users").child(uid);
        final String[] role = {null};
        final Object lock = new Object();

        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    role[0] = snapshot.child("role").getValue(String.class);
                }
                synchronized (lock) {
                    lock.notify();
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                synchronized (lock) {
                    lock.notify();
                }
            }
        });

        synchronized (lock) {
            lock.wait(3000); // max 3s
        }

        return role[0];
    }
}
