package com.ruche.ruche_connect.config;

import com.google.api.client.util.Value;
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


	@Value("${firebase.credentials.path:#{null}}")
	private String firebaseCredentialsPath;

    @SuppressWarnings("resource")
	@PostConstruct
    public void initFirebase() throws Exception {
    	// fallback sur variable d'environnement si @Value n'a pas injecté de valeur
        if (firebaseCredentialsPath == null) {
        	System.out.println("fallback active");
            firebaseCredentialsPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        }

        if (firebaseCredentialsPath == null) {
            throw new IllegalStateException(
                "Le chemin du fichier Firebase n'est pas défini ! " +
                "Définissez firebase.credentials.path dans application.properties ou GOOGLE_APPLICATION_CREDENTIALS."
            );
        }

        System.out.println("Firebase JSON path: " + firebaseCredentialsPath);

        try (FileInputStream serviceAccount = new FileInputStream(firebaseCredentialsPath)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl("https://rucheconnect-d9225-default-rtdb.europe-west1.firebasedatabase.app")
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
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
