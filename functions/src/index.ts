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
import cors from "cors";

admin.initializeApp();

// Configurar CORS
const corsHandler = cors({ origin: true });

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

export const newValnetUser = functions.https.onRequest(async (req, res) => {
  // Manejar preflight requests
  return corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }
    try {
      const {
        nombres,
        apellidos,
        email,
        password,
        avatar = '',
        role,
        cedula,
        status,
        telefono,
        direccion,
        fechaNacimiento,
        brigadaId,
        nivelVendedor,
        contratosMes,
        bonoExtra
      } = req.body;

      if (!email || !password || !nombres || !apellidos || !role) {
        res.status(400).send({ error: "Faltan campos obligatorios" });
        return;
      }

      // 1. Crear usuario en Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${nombres} ${apellidos}`,
        photoURL: avatar || undefined,
      });

      // 2. Guardar datos adicionales en Firestore
      const usuarioData = {
        nombres,
        apellidos,
        email,
        avatar,
        role,
        cedula,
        status,
        telefono,
        direccion,
        fechaNacimiento,
        brigadaId: brigadaId || null,
        nivelVendedor: nivelVendedor || null,
        contratosMes: contratosMes || null,
        bonoExtra: typeof bonoExtra === 'boolean' ? bonoExtra : null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        id: userRecord.uid,
      };
      await admin.firestore().collection("usuarios").doc(userRecord.uid).set(usuarioData);

      res.status(200).send({ success: true, uid: userRecord.uid });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).send({ error: error.message });
      } else {
        res.status(500).send({ error: "Unknown error" });
      }
    }
  });
});
