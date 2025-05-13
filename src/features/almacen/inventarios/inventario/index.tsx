import { useParams } from "react-router-dom";
import { useAlmacenState } from "@/context/global/useAlmacenState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { ArticulosTable } from "./components/ArticulosTable";
import { NuevoArticuloForm } from "./components/NuevoArticuloForm";

export default function Inventario() {
    const { id } = useParams();
    const { inventarios, articulos, subscribeToArticulos } = useAlmacenState();
    const [showNuevoArticulo, setShowNuevoArticulo] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToArticulos();
        return () => unsubscribe();
    }, [subscribeToArticulos]);

    const inventario = inventarios.find((inventario) => inventario.id === id);
    const articulosInventario = articulos.filter(articulo => articulo.idinventario === id);

    if (!inventario) {
        return <div className="flex items-center justify-center h-full">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Inventario no encontrado</CardTitle>
                    <CardDescription>El inventario solicitado no existe o ha sido eliminado.</CardDescription>
                </CardHeader>
            </Card>
        </div>;
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{inventario.nombre}</h1>
                    <p className="text-muted-foreground">{inventario.descripcion}</p>
                </div>
                <Button onClick={() => setShowNuevoArticulo(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Artículo
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalles del Inventario</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium">Tipo</p>
                            <p className="text-sm text-muted-foreground">{inventario.tipo}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">ID</p>
                            <p className="text-sm text-muted-foreground">{inventario.id}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Fecha de creación</p>
                            <p className="text-sm text-muted-foreground">
                                {inventario.createdAt instanceof Date 
                                    ? inventario.createdAt.toLocaleDateString() 
                                    : new Date(inventario.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Última actualización</p>
                            <p className="text-sm text-muted-foreground">
                                {inventario.updatedAt instanceof Date 
                                    ? inventario.updatedAt.toLocaleDateString() 
                                    : new Date(inventario.updatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="articulos" className="w-full">
                <TabsList>
                    <TabsTrigger value="articulos">Artículos ({articulosInventario.length})</TabsTrigger>
                    <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
                </TabsList>
                <TabsContent value="articulos" className="space-y-4 pt-4">
                    <ArticulosTable articulos={articulosInventario} />
                </TabsContent>
                <TabsContent value="movimientos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Movimientos</CardTitle>
                            <CardDescription>
                                Visualiza todas las entradas y salidas de artículos de este inventario.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Funcionalidad en desarrollo</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <NuevoArticuloForm 
                open={showNuevoArticulo} 
                onOpenChange={setShowNuevoArticulo} 
                inventarioId={id || ''} 
            />
        </div>
    );
}
