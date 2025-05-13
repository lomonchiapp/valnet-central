import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Articulo, TipoArticulo } from "shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Scan } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ArticulosTableProps {
  articulos: Articulo[];
}

// Extended type for our UI that includes additional fields
interface ExtendedArticulo extends Articulo {
  codigoBarras?: string;
  mac?: string;
}

export function ArticulosTable({ articulos }: ArticulosTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"todos" | "equipos" | "materiales">("todos");

  // Cast to our extended type for UI purposes
  const articulosExtended = articulos as ExtendedArticulo[];
  
  const equipos = articulosExtended.filter(articulo => articulo.tipo === TipoArticulo.EQUIPO);
  const materiales = articulosExtended.filter(articulo => articulo.tipo === TipoArticulo.MATERIAL);

  const filteredArticulos = articulosExtended.filter((articulo) =>
    articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.codigoBarras?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEquipos = equipos.filter((articulo) =>
    articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.mac?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMateriales = materiales.filter((articulo) =>
    articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.codigoBarras?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (articulos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No hay artículos</CardTitle>
          <CardDescription>
            Este inventario aún no tiene artículos registrados.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const getBadgeVariant = (tipo: TipoArticulo) => {
    switch (tipo) {
      case TipoArticulo.EQUIPO:
        return "default";
      case TipoArticulo.MATERIAL:
        return "outline";
      default:
        return "secondary";
    }
  };

  const getArticulosToDisplay = () => {
    switch (viewMode) {
      case "equipos":
        return filteredEquipos;
      case "materiales":
        return filteredMateriales;
      default:
        return filteredArticulos;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Buscar artículos..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" size="icon" title="Escanear código de barras">
            <Scan className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "todos" | "equipos" | "materiales")}>
          <TabsList>
            <TabsTrigger value="todos">Todos ({filteredArticulos.length})</TabsTrigger>
            <TabsTrigger value="equipos">Equipos ({filteredEquipos.length})</TabsTrigger>
            <TabsTrigger value="materiales">Materiales ({filteredMateriales.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              {viewMode !== "equipos" && <TableHead>Tipo</TableHead>}
              {viewMode !== "equipos" && <TableHead>Cantidad</TableHead>}
              {viewMode !== "equipos" && <TableHead>Unidad</TableHead>}
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              {viewMode !== "materiales" && <TableHead>Serial</TableHead>}
              {viewMode === "equipos" && <TableHead>MAC</TableHead>}
              <TableHead>Costo</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getArticulosToDisplay().length === 0 ? (
              <TableRow>
                <TableCell colSpan={viewMode === "todos" ? 10 : 9} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            ) : (
              getArticulosToDisplay().map((articulo) => (
                <TableRow key={articulo.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{articulo.nombre}</div>
                      <div className="text-xs text-muted-foreground">{articulo.descripcion}</div>
                      {articulo.codigoBarras && (
                        <div className="text-xs text-muted-foreground">
                          Código: {articulo.codigoBarras}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {viewMode !== "equipos" && (
                    <TableCell>
                      <Badge variant={getBadgeVariant(articulo.tipo)}>
                        {articulo.tipo}
                      </Badge>
                    </TableCell>
                  )}
                  {viewMode !== "equipos" && <TableCell>{articulo.cantidad}</TableCell>}
                  {viewMode !== "equipos" && <TableCell>{articulo.unidad}</TableCell>}
                  <TableCell>{articulo.marca}</TableCell>
                  <TableCell>{articulo.modelo}</TableCell>
                  {viewMode !== "materiales" && <TableCell>{articulo.serial}</TableCell>}
                  {viewMode === "equipos" && <TableCell>{articulo.mac}</TableCell>}
                  <TableCell>{formatCurrency(articulo.costo)}</TableCell>
                  <TableCell>{articulo.ubicacion}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 