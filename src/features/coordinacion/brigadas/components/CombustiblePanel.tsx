import { useEffect, useMemo, useState } from "react";
import { useCoordinacionState } from "@/context/global/useCoordinacionState";
import type { Brigada } from "@/types/interfaces/coordinacion/brigada";
import { Loader2, AlertTriangle, Download, Edit2, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { isAfter, isBefore, parseISO } from "date-fns";
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip as ChartTooltip, Legend } from 'chart.js';
import type { ControlCombustible } from "@/types/interfaces/coordinacion/controlCombustible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { database } from "@/firebase";
import { useAuthStore } from "@/stores/authStore";
import type { Eliminacion } from "@/types/valnet/eliminacion";
import RegistroCombustibleDialog from "./RegistroCombustibleDialog";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, ChartTooltip, Legend);

interface CombustiblePanelProps {
  brigada: Brigada | null;
}

type CsvRow = [string, string, string, string, string, string, string];

function exportToCSV(data: ControlCombustible[], filename: string) {
  const csvRows: CsvRow[] = [
    [
      'Fecha',
      'Galones',
      'Precio/galón',
      'Km inicial',
      'Km final',
      'Referencia',
      'Rendimiento',
    ] as CsvRow,
    ...data.map((r) => [
      r.fecha,
      String(r.galones),
      String(r.precio_galon),
      String(r.km_inicial),
      String(r.km_final),
      r.referencia,
      r.km_final && r.km_inicial ? ((r.km_final - r.km_inicial) / r.galones).toFixed(2) : '-',
    ] as CsvRow),
  ];
  const csvContent = csvRows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CombustiblePanel({ brigada }: CombustiblePanelProps) {
  const { controlCombustible, subscribeToControlCombustible } = useCoordinacionState();
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMotivo, setDeleteMotivo] = useState("");
  const [registroAEliminar, setRegistroAEliminar] = useState<ControlCombustible | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuthStore();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [registroAEditar, setRegistroAEditar] = useState<ControlCombustible | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToControlCombustible?.();
    setTimeout(() => setLoading(false), 600);
    return () => unsubscribe && unsubscribe();
  }, [subscribeToControlCombustible]);

  const registros = useMemo(() => {
    let filtered = brigada ? controlCombustible.filter(r => r.idbrigada === brigada.id) : [];
    if (dateFrom) filtered = filtered.filter(r => isAfter(parseISO(r.fecha), parseISO(dateFrom)) || r.fecha === dateFrom);
    if (dateTo) filtered = filtered.filter(r => isBefore(parseISO(r.fecha), parseISO(dateTo)) || r.fecha === dateTo);
    return filtered;
  }, [controlCombustible, brigada, dateFrom, dateTo]);

  // Resumen de consumo
  const totalGalones = registros.reduce((acc, r) => acc + (Number(r.galones) || 0), 0);
  const totalKm = registros.reduce((acc, r) => acc + ((Number(r.km_final) || 0) - (Number(r.km_inicial) || 0)), 0);
  const rendimiento = totalGalones > 0 ? (totalKm / totalGalones).toFixed(2) : '-';

  // Datos para gráfica
  const chartData = {
    labels: registros.map(r => r.fecha),
    datasets: [
      {
        label: 'Galones',
        data: registros.map(r => r.galones),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.3,
      },
      {
        label: 'Rendimiento (km/galón)',
        data: registros.map(r => r.km_final && r.km_inicial ? ((r.km_final - r.km_inicial) / r.galones) : null),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.2)',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Consumo de combustible y rendimiento' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Galones' } },
      y1: {
        beginAtZero: true,
        position: 'right' as const,
        title: { display: true, text: 'Rendimiento (km/galón)' },
        grid: { drawOnChartArea: false },
      },
    },
  };

  const handleDeleteClick = (registro: ControlCombustible) => {
    setRegistroAEliminar(registro);
    setDeleteDialogOpen(true);
    setDeleteMotivo("");
  };

  const handleDeleteConfirm = async () => {
    if (!registroAEliminar || !user) return;
    setDeleting(true);
    // Guardar en colección eliminaciones
    const eliminacion: Omit<Eliminacion, 'id'> = {
      fecha: new Date().toISOString(),
      usuarioId: user.id,
      usuarioNombre: user.nombres || user.email || "Usuario",
      motivo: deleteMotivo,
      entidad: 'control_combustible',
      entidadId: registroAEliminar.id,
      datosEliminados: registroAEliminar,
    };
    await addDoc(collection(database, 'eliminaciones'), eliminacion);
    // Eliminar el registro real
    await deleteDoc(doc(database, 'control_combustible', registroAEliminar.id));
    setDeleting(false);
    setDeleteDialogOpen(false);
    setRegistroAEliminar(null);
    setDeleteMotivo("");
  };

  const handleEditClick = (registro: ControlCombustible) => {
    setRegistroAEditar(registro);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setRegistroAEditar(null);
  };

  if (!brigada) return null;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:gap-8 gap-2">
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Total galones</span>
          <span className="font-bold text-lg">{totalGalones}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Total km</span>
          <span className="font-bold text-lg">{totalKm}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Rendimiento (km/galón)</span>
          <span className="font-bold text-lg">{rendimiento}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" onClick={() => exportToCSV(registros, `combustible_${brigada.nombre}.csv`)} title="Exportar CSV">
                  <Download className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar historial a CSV</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center mt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs">Desde</span>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Hasta</span>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 w-32" />
        </div>
      </div>
      <div className="mt-4">
        <Line data={chartData} options={chartOptions} height={180} />
      </div>
      <div className="font-medium text-lg mt-4">Historial de combustible</div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <span className="text-muted-foreground">Cargando registros...</span>
        </div>
      ) :
        registros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2 opacity-70" />
            <p>No hay registros de combustible para esta brigada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-2 py-1 border">Fecha</th>
                  <th className="px-2 py-1 border">Galones</th>
                  <th className="px-2 py-1 border">Precio/galón</th>
                  <th className="px-2 py-1 border">Km inicial</th>
                  <th className="px-2 py-1 border">Km final</th>
                  <th className="px-2 py-1 border">Referencia</th>
                  <th className="px-2 py-1 border">Rendimiento</th>
                  <th className="px-2 py-1 border text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr key={r.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-2 py-1 border">{r.fecha}</td>
                    <td className="px-2 py-1 border">{r.galones}</td>
                    <td className="px-2 py-1 border">{r.precio_galon}</td>
                    <td className="px-2 py-1 border">{r.km_inicial}</td>
                    <td className="px-2 py-1 border">{r.km_final}</td>
                    <td className="px-2 py-1 border">{r.referencia}</td>
                    <td className="px-2 py-1 border">{r.km_final && r.km_inicial ? ((r.km_final - r.km_inicial) / r.galones).toFixed(2) : '-'}</td>
                    <td className="px-2 py-1 border text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-blue-600" onClick={() => handleEditClick(r)}><Edit2 className="w-4 h-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar registro</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-red-600" onClick={() => handleDeleteClick(r)}><Trash2 className="w-4 h-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar registro</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost"><Info className="w-4 h-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Detalles</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {/* Dialog de edición */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <RegistroCombustibleDialog
            brigada={brigada}
            registro={registroAEditar}
            modo="editar"
            onClose={handleEditClose}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog de eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar registro de combustible</DialogTitle>
            <DialogDescription>
              Por favor, indica el motivo de la eliminación. Esta acción quedará registrada.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Motivo de la eliminación"
            value={deleteMotivo}
            onChange={e => setDeleteMotivo(e.target.value)}
            disabled={deleting}
            className="mt-2"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={!deleteMotivo || deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 