/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";


admin.initializeApp();

export const newTicket = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }
  try {
    const ticketData = req.body;
    // Aquí puedes validar/sanitizar ticketData según tu modelo
    await admin.firestore().collection("tickets").add(ticketData);
    res.status(200).send({status: "ok"});
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send({error: error.message});
    } else {
      res.status(500).send({error: "Unknown error"});
    }
  }
});
