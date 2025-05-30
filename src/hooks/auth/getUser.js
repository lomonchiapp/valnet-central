import { database } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
export const getUser = async (uid) => {
    try {
        const userRef = doc(database, 'usuarios', uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            return null;
        }
        const userData = userSnap.data();
        return {
            id: userSnap.id,
            nombres: userData.nombres,
            apellidos: userData.apellidos,
            email: userData.email,
            cedula: userData.cedula,
            status: userData.status,
            telefono: userData.telefono,
            direccion: userData.direccion,
            fechaNacimiento: userData.fechaNacimiento,
            role: userData.role,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
        };
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching user:', error);
        return null;
    }
};
