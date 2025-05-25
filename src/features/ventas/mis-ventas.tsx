import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreRegistro } from '@/api/hooks/usePreRegistro';
import { PreRegistro } from '@/types/interfaces/ventas/preRegistro';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, FileText, ExternalLink, List, LayoutGrid, MapPin, Navigation } from 'lucide-react';
import ImageModal from './components/ImageModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Tipo más específico para los datos de fecha
type DateValue = string | Date | { toDate: () => Date } | null | undefined;

export default function MisVentas() {
  const navigate = useNavigate();
  const { misPreRegistros, loading, error: apiError } = usePreRegistro();
  const [preRegistros, setPreRegistros] = useState<PreRegistro[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [view, setView] = useState<'list' | 'thumbnails'>('list');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Usar un efecto con dependencia vacía para cargar solo una vez
  useEffect(() => {
    let isMounted = true;

    const cargarPreRegistros = async () => {
      try {
        const data = await misPreRegistros();
        if (isMounted) {
          setPreRegistros(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Error desconocido'));
        }
      } finally {
        if (isMounted) {
          setFetching(false);
        }
      }
    };

    cargarPreRegistros();

    // Limpiar efecto
    return () => {
      isMounted = false;
    };
  }, []); // Sin dependencia en misPreRegistros

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pendiente</Badge>;
      case 'aprobado':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Aprobado</Badge>;
      case 'rechazado':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rechazado</Badge>;
      case 'instalado':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Instalado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const formatDate = (dateValue: DateValue) => {
    if (!dateValue) return 'N/A';
    try {
      // Si es un objeto de Firestore Timestamp
      if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
        return new Intl.DateTimeFormat('es-DO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(dateValue.toDate());
      }
      // Si es un string ISO
      if (typeof dateValue === 'string') {
        return new Intl.DateTimeFormat('es-DO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date(dateValue));
      }
      // Si es un objeto Date directamente
      if (dateValue instanceof Date) {
        return new Intl.DateTimeFormat('es-DO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(dateValue);
      }
      return 'N/A';
    } catch {
      // Error silencioso
      return 'N/A';
    }
  };

  if (fetching || loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || apiError) {
    return (
      <div className="text-center p-6 text-destructive">
        <p>Error al cargar los pre-registros. Por favor, intenta de nuevo.</p>
      </div>
    );
  }

  if (preRegistros.length === 0) {
    return (
      <div className="text-center p-10">
        <h3 className="text-lg font-semibold mb-2">No has creado pre-registros</h3>
        <p className="text-muted-foreground mb-6">
          Comienza a registrar tus ventas para hacer seguimiento
        </p>
        <Button onClick={() => navigate('/ventas/pre-registros/nuevo')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Pre-Registro
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4 gap-2">
        <Button variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')} size="icon" title="Vista de lista">
          <List className="h-5 w-5" />
        </Button>
        <Button variant={view === 'thumbnails' ? 'default' : 'outline'} onClick={() => setView('thumbnails')} size="icon" title="Vista de thumbnails">
          <LayoutGrid className="h-5 w-5" />
        </Button>
      </div>
      {view === 'list' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead>Fecha Instalación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fotos Contrato</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preRegistros.map((preRegistro) => (
              <TableRow key={preRegistro.id}>
                <TableCell className="font-medium">{preRegistro.cliente}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="link" className="p-0 h-auto min-w-0 text-blue-700 underline">
                        {preRegistro.cedula}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto max-w-xs">
                      <div className="flex flex-col items-center gap-2">
                        {preRegistro.fotosCedula && preRegistro.fotosCedula.length > 0 ? (
                          preRegistro.fotosCedula.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Cédula ${idx === 0 ? 'frontal' : 'trasera'}`}
                              className="h-32 w-auto object-contain rounded border"
                            />
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin imágenes de cédula</span>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>{formatDate(preRegistro.createdAt)}</TableCell>
                <TableCell>{formatDate(preRegistro.fecha_instalacion)}</TableCell>
                <TableCell>{getEstadoBadge(preRegistro.estado || 'pendiente')}</TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">
                    {preRegistro.fotoContrato?.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Contrato ${idx + 1}`}
                        className="h-12 w-12 object-cover rounded cursor-pointer border"
                        onClick={() => setSelectedImage(url)}
                      />
                    ))}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      id={`upload-contrato-${preRegistro.id}`}
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        // Subir imágenes a storage y actualizar el preRegistro
                        // Aquí deberías implementar la lógica de subida y obtener las URLs
                        // Por ahora, solo simulo la actualización con un array vacío
                        // await updatePreRegistro(preRegistro.id, { fotoContrato: nuevasUrls });
                      }}
                    />
                    <label htmlFor={`upload-contrato-${preRegistro.id}`}
                      className="cursor-pointer px-2 py-1 bg-gray-100 rounded border text-xs hover:bg-gray-200">
                      + Agregar
                    </label>
                  </div>
                </TableCell>
                <TableCell>
                  {preRegistro.ubicacion && preRegistro.ubicacion.lat && preRegistro.ubicacion.lng ? (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="Ver en Google Maps"
                      >
                        <a
                          href={`https://www.google.com/maps?q=${preRegistro.ubicacion.lat},${preRegistro.ubicacion.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="Cómo llegar"
                      >
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${preRegistro.ubicacion.lat},${preRegistro.ubicacion.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Navigation className="h-5 w-5 text-green-600" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin ubicación</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/ventas/pre-registros/${preRegistro.id}`)}
                      title="Ver detalles"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      title="Ver en Mikrowisp"
                    >
                      <a
                        href={`https://panel.mikrowisp.net/clients/view/${preRegistro.cliente}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {preRegistros.map((preRegistro) => (
            <div key={preRegistro.id} className="bg-white rounded shadow p-4 flex flex-col gap-2">
              {preRegistro.fotosCedula && preRegistro.fotosCedula[0] && (
                <img
                  src={preRegistro.fotosCedula[0]}
                  alt="Cédula frontal"
                  className="h-24 w-auto object-contain rounded border mb-2 mx-auto"
                />
              )}
              <div className="font-semibold text-base mb-1">{preRegistro.cliente}</div>
              <div className="text-xs text-muted-foreground mb-1">Cédula: {preRegistro.cedula}</div>
              <div className="text-xs mb-1">Estado: {getEstadoBadge(preRegistro.estado || 'pendiente')}</div>
              <div className="flex gap-2 mb-2">
                {preRegistro.fotoContrato?.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Contrato ${idx + 1}`}
                    className="h-16 w-16 object-cover rounded cursor-pointer border"
                    onClick={() => setSelectedImage(url)}
                  />
                ))}
              </div>
              <div className="text-xs text-muted-foreground">Creado: {formatDate(preRegistro.createdAt)}</div>
              <div className="flex justify-end space-x-2 mt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/ventas/pre-registros/${preRegistro.id}`)}
                  title="Ver detalles"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  title="Ver en Mikrowisp"
                >
                  <a
                    href={`https://panel.mikrowisp.net/clients/view/${preRegistro.cliente}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      <div className="text-sm text-muted-foreground mt-4">
        Mostrando {preRegistros.length} pre-registros
      </div>
    </div>
  );
} 