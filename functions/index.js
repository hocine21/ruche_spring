const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configure ton SMTP Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hocinelampro@gmail.com", // Ton email Gmail
    pass: "sgtw wrjg rmpk ggbb", // Mot de passe d'application Gmail
  },
});

exports.sendAlertEmail = functions.database.ref("/mesures/{mesureId}")
    .onWrite(async (change, context) => {
      const mesure = change.after.val();
      if (!mesure) return null;
      if (mesure.etatCouvercle === "OUVERT" && !mesure.notifiee) {
        // Trouver la ruche par refCapteur
        const ruchesSnap = await admin
            .database()
            .ref("/ruches")
            .once("value");
        const ruchersSnap = await admin
            .database()
            .ref("/ruchers")
            .once("value");
        let rucheTrouvee = null;
        let rucherTrouve = null;
        ruchesSnap.forEach((rucheSnap) => {
          const ruche = rucheSnap.val();
          if (
            ruche.referenceCapteur &&
            ruche.referenceCapteur.toLowerCase() ===
              mesure.refCapteur.toLowerCase()
          ) {
            rucheTrouvee = ruche;
            return true;
          }
        });
        if (rucheTrouvee && rucheTrouvee.rucherId) {
          rucherTrouve = ruchersSnap.child(rucheTrouvee.rucherId).val();
        }
        if (rucherTrouve && rucherTrouve.apiculteurId) {
          // Récupérer l'email de l'apiculteur
          const userSnap = await admin
              .database()
              .ref(`/users/${rucherTrouve.apiculteurId}`)
              .once("value");
          const user = userSnap.val();
          if (user && user.email) {
            const mailOptions = {
              from: "hocinelampro@gmail.com",
              to: user.email,
              subject: "Alerte : Couvercle ouvert sur une ruche",
              text:
                "Attention, le couvercle de la ruche " +
                (rucheTrouvee.nom || mesure.refCapteur) +
                " a été ouvert le " +
                mesure.horodatage +
                ".",
            };
            await transporter.sendMail(mailOptions);
            // Marquer la mesure comme notifiée
            await admin
                .database()
                .ref(`/mesures/${context.params.mesureId}/notifiee`)
                .set(true);
          }
        }
      }
      return null;
    });
