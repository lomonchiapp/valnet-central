import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Package, PenIcon, Trash2Icon } from "lucide-react";
import { Brigada } from "@/types/interfaces/coordinacion/brigada";

interface InventarioItem {
  id: string;
  nombre: string;
  tipo: "equipo" | "material";
  cantidad: number;
  estado: "disponible" | "asignado" | "dañado";
  brigada: string;
}

export function InventarioBrigadasPanel() {
  const [selectedBrigada, setSelectedBrigada] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [inventarioItems] = useState<InventarioItem[]>([
    {
      id: "item-1",
      nombre: "Router Mikrotik hAP",
      tipo: "equipo",
      cantidad: 5,
      estado: "disponible",
      brigada: "brigada-1"
    },
    {
      id: "item-2",
      nombre: "Cable UTP Cat 6",
      tipo: "material",
      cantidad: 100,
      estado: "disponible",
      brigada: "brigada-1"
    },
    {
      id: "item-3",
      nombre: "Antena Ubiquiti LiteBeam",
      tipo: "equipo",
      cantidad: 3,
      estado: "asignado",
      brigada: "brigada-2"
    },
    {
      id: "item-4",
      nombre: "Conectores RJ45",
      tipo: "material",
      cantidad: 50,
      estado: "disponible",
      brigada: "brigada-2"
    }
  ]);
  
  const [brigadas] = useState<Partial<Brigada>[]>([
    { id: "brigada-1", nombre: "Brigada Norte" },
    { id: "brigada-2", nombre: "Brigada Sur" },
    { id: "brigada-3", nombre: "Brigada Este" },
  ]);

  // Filter inventory items based on search term and selected brigade
  const filteredItems = inventarioItems.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrigada = selectedBrigada ? item.brigada === selectedBrigada : true;
    return matchesSearch && matchesBrigada;
  });

  // Get brigade name by ID
  const getBrigadaNombre = (id: string) => {
    const brigada = brigadas.find(b => b.id === id);
    return brigada ? brigada.nombre : id;
  };

  // Render badge for item status
  const renderEstadoBadge = (estado: string) => {
    switch (estado) {
      case "disponible":
        return <Badge className="bg-green-500">Disponible</Badge>;
      case "asignado":
        return <Badge className="bg-blue-500">Asignado</Badge>;
      case "dañado":
        return <Badge className="bg-red-500">Dañado</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventarios de Brigadas</CardTitle>
          <CardDescription>
            Gestiona los inventarios asignados a cada brigada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <Select value={selectedBrigada} onValueChange={setSelectedBrigada}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrar por brigada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las brigadas</SelectItem>
                  {brigadas.map(brigada => (
                    <SelectItem key={brigada.id} value={brigada.id || ""}>
                      {brigada.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar artículos..."
                  className="w-full md:w-[300px] pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Asignar Artículo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Asignar Artículo a Brigada</DialogTitle>
                  <DialogDescription>
                    Asigna un artículo del inventario general a una brigada específica
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="brigada">Brigada</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar brigada" />
                      </SelectTrigger>
                      <SelectContent>
                        {brigadas.map(brigada => (
                          <SelectItem key={brigada.id} value={brigada.id || ""}>
                            {brigada.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="articulo">Artículo</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar artículo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="router">Router Mikrotik hAP</SelectItem>
                        <SelectItem value="cable">Cable UTP Cat 6</SelectItem>
                        <SelectItem value="antena">Antena Ubiquiti LiteBeam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="cantidad">Cantidad</label>
                    <Input type="number" id="cantidad" min="1" defaultValue="1" />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit">Asignar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="todos">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="equipos">Equipos</TabsTrigger>
              <TabsTrigger value="materiales">Materiales</TabsTrigger>
            </TabsList>
            
            <TabsContent value="todos" className="pt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artículo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Brigada</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.nombre}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              {item.tipo === "equipo" ? "Equipo" : "Material"}
                            </div>
                          </TableCell>
                          <TableCell>{item.cantidad}</TableCell>
                          <TableCell>{renderEstadoBadge(item.estado)}</TableCell>
                          <TableCell>{getBrigadaNombre(item.brigada)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <PenIcon className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No se encontraron artículos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="equipos" className="pt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipo</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Brigada</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.filter(item => item.tipo === "equipo").length > 0 ? (
                      filteredItems
                        .filter(item => item.tipo === "equipo")
                        .map(item => (
                          <TableRow key={item.id}>
                            <TableCell>{item.nombre}</TableCell>
                            <TableCell>{item.cantidad}</TableCell>
                            <TableCell>{renderEstadoBadge(item.estado)}</TableCell>
                            <TableCell>{getBrigadaNombre(item.brigada)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <PenIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No se encontraron equipos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="materiales" className="pt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Brigada</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.filter(item => item.tipo === "material").length > 0 ? (
                      filteredItems
                        .filter(item => item.tipo === "material")
                        .map(item => (
                          <TableRow key={item.id}>
                            <TableCell>{item.nombre}</TableCell>
                            <TableCell>{item.cantidad}</TableCell>
                            <TableCell>{renderEstadoBadge(item.estado)}</TableCell>
                            <TableCell>{getBrigadaNombre(item.brigada)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <PenIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No se encontraron materiales
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 