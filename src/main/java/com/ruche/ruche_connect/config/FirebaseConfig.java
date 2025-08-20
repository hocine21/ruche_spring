package com.ruche.ruche_connect.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import jakarta.annotation.PostConstruct;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {


    @PostConstruct
    public void initFirebase() throws Exception {
        InputStream serviceAccount = getClass()
        .getClassLoader()
        .getResourceAsStream("rucheconnectFireBase.json");

        
        System.out.println("Classpath: " + System.getProperty("java.class.path"));
        System.out.println("Recherche rucheconnectFireBase.json dans le classpath...");
        
        if (serviceAccount == null) {
            throw new FileNotFoundException("Fichier Firebase introuvable dans les ressources !");
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setDatabaseUrl("https://rucheconnect-d9225-default-rtdb.europe-west1.firebasedatabase.app")
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
    }
    

    @Bean
    public DatabaseReference databaseReference() {
        return FirebaseDatabase.getInstance().getReference();
    }

    @Bean(name = "usersRef")
    public DatabaseReference usersRef() {
        return databaseReference().child("users");
    }

    @Bean(name = "ruchesRef")
    public DatabaseReference ruchesRef() {
        return databaseReference().child("ruches");
    }

    @Bean(name = "ruchersRef")
    public DatabaseReference ruchersRef() {
        return databaseReference().child("ruchers");
    }

    @Bean(name = "mesuresRef")
    public DatabaseReference mesuresRef() {
        return databaseReference().child("mesures");
    }

    @Bean(name = "interventionsRef") // 👈 ajout du bean manquant
    public DatabaseReference interventionsRef() {
        return databaseReference().child("interventions");
    }

}
