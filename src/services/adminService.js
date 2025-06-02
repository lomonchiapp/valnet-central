import { database } from '@/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy, limit, } from 'firebase/firestore';
export class AdminService {
    constructor() { }
    static getInstance() {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    }
    async getMetricasSistema() {
        try {
            // Obtener usuarios activos
            const usuariosSnapshot = await getDocs(query(collection(database, 'usuarios'), where('estado', '==', 'activo')));
            const usuariosActivos = usuariosSnapshot.docs.length;
            // Obtener inventario total
            const inventarioSnapshot = await getDocs(collection(database, 'inventario'));
            const inventarioTotal = inventarioSnapshot.docs.length;
            // Obtener tickets abiertos
            const ticketsSnapshot = await getDocs(query(collection(database, 'tickets'), where('estado', '==', 'abierto')));
            const ticketsAbiertos = ticketsSnapshot.docs.length;
            // Obtener brigadas activas
            const brigadasSnapshot = await getDocs(query(collection(database, 'brigadas'), where('estado', '==', 'activo')));
            const brigadasActivas = brigadasSnapshot.docs.length;
            // Obtener pagos pendientes
            const pagosSnapshot = await getDocs(query(collection(database, 'pagos'), where('estado', '==', 'pendiente'), where('fechaVencimiento', '>=', Timestamp.now())));
            const pagosPendientes = pagosSnapshot.docs.length;
            // Calcular ingresos mensuales
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);
            const pagosMensualesSnapshot = await getDocs(query(collection(database, 'pagos'), where('estado', '==', 'pagado'), where('fechaPago', '>=', Timestamp.fromDate(inicioMes))));
            const ingresosMensuales = pagosMensualesSnapshot.docs.reduce((total, doc) => total + (doc.data().monto || 0), 0);
            // Calcular tendencias (comparación con el mes anterior)
            const mesAnterior = new Date(inicioMes);
            mesAnterior.setMonth(mesAnterior.getMonth() - 1);
            const [usuariosAnterior, inventarioAnterior, ticketsAnterior, brigadasAnterior, pagosAnterior, ingresosAnterior,] = await Promise.all([
                this.getMetricaAnterior('usuarios', mesAnterior),
                this.getMetricaAnterior('inventario', mesAnterior),
                this.getMetricaAnterior('tickets', mesAnterior),
                this.getMetricaAnterior('brigadas', mesAnterior),
                this.getMetricaAnterior('pagos', mesAnterior),
                this.getMetricaAnterior('ingresos', mesAnterior),
            ]);
            return {
                usuariosActivos,
                inventarioTotal,
                ticketsAbiertos,
                brigadasActivas,
                pagosPendientes,
                ingresosMensuales,
                tendencias: {
                    usuarios: this.calcularTendencia(usuariosActivos, usuariosAnterior),
                    inventario: this.calcularTendencia(inventarioTotal, inventarioAnterior),
                    tickets: this.calcularTendencia(ticketsAbiertos, ticketsAnterior),
                    brigadas: this.calcularTendencia(brigadasActivas, brigadasAnterior),
                    pagos: this.calcularTendencia(pagosPendientes, pagosAnterior),
                    ingresos: this.calcularTendencia(ingresosMensuales, ingresosAnterior),
                },
            };
        }
        catch (error) {
            console.error('Error al obtener métricas del sistema:', error);
            throw error;
        }
    }
    async getMetricaAnterior(tipo, fecha) {
        try {
            const snapshot = await getDocs(query(collection(database, 'metricas'), where('tipo', '==', tipo), where('fecha', '>=', Timestamp.fromDate(fecha)), where('fecha', '<', Timestamp.now()), orderBy('fecha', 'desc'), limit(1)));
            if (snapshot.empty)
                return 0;
            return snapshot.docs[0].data().valor;
        }
        catch (error) {
            console.error(`Error al obtener métrica anterior de ${tipo}:`, error);
            return 0;
        }
    }
    calcularTendencia(actual, anterior) {
        if (anterior === 0)
            return 0;
        return ((actual - anterior) / anterior) * 100;
    }
    async getPagosProximos(dias = 7) {
        try {
            const hoy = new Date();
            const fechaLimite = new Date(hoy.getTime() + dias * 24 * 60 * 60 * 1000);
            const snapshot = await getDocs(query(collection(database, 'pagos'), where('fechaVencimiento', '>=', Timestamp.fromDate(hoy)), where('fechaVencimiento', '<=', Timestamp.fromDate(fechaLimite)), orderBy('fechaVencimiento', 'asc')));
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        }
        catch (error) {
            console.error('Error al obtener pagos próximos:', error);
            throw error;
        }
    }
    async getAlertasInventario() {
        try {
            const snapshot = await getDocs(query(collection(database, 'inventario'), where('stock', '<=', where('threshold', '>', 0))));
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        }
        catch (error) {
            console.error('Error al obtener alertas de inventario:', error);
            throw error;
        }
    }
    async getBrigadasActivas() {
        try {
            const snapshot = await getDocs(query(collection(database, 'brigadas'), where('estado', '==', 'activo')));
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        }
        catch (error) {
            console.error('Error al obtener brigadas activas:', error);
            throw error;
        }
    }
    async getTicketsAbiertos() {
        try {
            const snapshot = await getDocs(query(collection(database, 'tickets'), where('estado', '==', 'abierto'), orderBy('fechaCreacion', 'desc'), limit(5)));
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        }
        catch (error) {
            console.error('Error al obtener tickets abiertos:', error);
            throw error;
        }
    }
}
export const adminService = AdminService.getInstance();
