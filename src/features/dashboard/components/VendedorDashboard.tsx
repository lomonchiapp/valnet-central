import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { NivelVendedor, Usuario } from '@/types/interfaces/valnet/usuario'
import { WallNetDashboardWidget } from './SacDashboard'
import { BronzeIcon, SilverIcon, GoldIcon, DiamondIcon } from '@/components/icons/VendedorNivelIcons'
import { useState } from 'react'
import { X, ChevronsLeft, ChevronsRight } from 'lucide-react'
import RGL, { WidthProvider, Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

interface RegistroResumen {
  id: string;
  descripcion?: string;
}

interface VendedorDashboardProps {
  usuario: Usuario
  preRegistros: RegistroResumen[]
  contratos: RegistroResumen[]
}

const niveles = [
  { nivel: NivelVendedor.BRONZE, min: 1, max: 15, comision: 20, icon: BronzeIcon, color: 'from-[#FDE68A] to-[#F59E42]' },
  { nivel: NivelVendedor.SILVER, min: 18, max: 25, comision: 25, icon: SilverIcon, color: 'from-[#E5E7EB] to-[#A3A3A3]' },
  { nivel: NivelVendedor.GOLD, min: 28, max: 35, comision: 30, icon: GoldIcon, color: 'from-[#FFF9C4] to-[#FFD700]' },
  { nivel: NivelVendedor.DIAMOND, min: 45, max: Infinity, comision: 40, icon: DiamondIcon, color: 'from-[#B9F2FF] to-[#5BC0EB]' },
]

function getNivelInfo(contratosMes: number) {
  return niveles.find(n => contratosMes >= n.min && contratosMes <= n.max) || niveles[0]
}

const ResponsiveGridLayout = WidthProvider(RGL)

export function VendedorDashboard({ usuario, preRegistros, contratos }: VendedorDashboardProps) {
  const nivelInfo = getNivelInfo(usuario.contratosMes || 0)
  const siguienteNivel = niveles[niveles.indexOf(nivelInfo) + 1]
  const progreso = siguienteNivel
    ? Math.min(100, (((usuario.contratosMes || 0) - nivelInfo.min + 1) / (siguienteNivel.min - nivelInfo.min)) * 100)
    : 100
  const NivelIcon = nivelInfo.icon
  const [showWallNetSheet, setShowWallNetSheet] = useState(false)
  const [expandWallNet, setExpandWallNet] = useState(false)

  // Layout inicial para desktop
  const layout: Layout[] = [
    { i: 'nivel', x: 0, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'contratos', x: 0, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'bono', x: 1, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'prereg', x: 1, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'wallnet', x: 2, y: 0, w: 1, h: 4, minW: 1, minH: 4 },
  ]

  return (
    <div className="w-full relative">
      {/* FAB solo en mobile */}
      <button
        className="fixed bottom-6 right-6 z-40 md:hidden bg-[#005BAA] text-white rounded-full shadow-lg p-4 flex items-center justify-center hover:bg-[#003366] transition"
        onClick={() => setShowWallNetSheet(true)}
        aria-label="Abrir WallNet"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      {/* Sheet WallNet en mobile */}
      {showWallNetSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:hidden">
          <div className="w-full h-[95vh] bg-white rounded-t-2xl shadow-2xl flex flex-col animate-slideInUp">
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-bold text-lg text-[#005BAA]">WallNet</span>
              <button onClick={() => setShowWallNetSheet(false)} className="text-gray-500 hover:text-red-500 p-2 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <WallNetDashboardWidget />
            </div>
          </div>
        </div>
      )}
      {/* Grid principal (desktop: react-grid-layout, mobile: flex) */}
      <div className="hidden md:block">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1024, md: 768, sm: 480, xs: 0 }}
          cols={{ lg: 3, md: 3, sm: 1, xs: 1 }}
          rowHeight={120}
          isResizable
          isDraggable
          useCSSTransforms
        >
          <div key="nivel">
            <Card className={`bg-gradient-to-br ${nivelInfo.color} shadow-xl border-0 relative overflow-hidden`}>
              <div className="absolute right-4 top-4 opacity-30 scale-150">
                <NivelIcon width={48} height={48} />
              </div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <NivelIcon width={36} height={36} />
                  <div>
                    <CardTitle className="text-lg font-bold">Nivel: {nivelInfo.nivel}</CardTitle>
                    <CardDescription className="text-base font-semibold">Comisión: {nivelInfo.comision}%</CardDescription>
                  </div>
                </div>
                {siguienteNivel && (
                  <div className="mt-2 text-sm text-gray-700">
                    Próximo nivel: <b>{siguienteNivel.nivel}</b> ({siguienteNivel.min} contratos)
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Progress value={progreso} />
                <div className="mt-2 text-sm">
                  Contratos este mes: <b>{usuario.contratosMes || 0}</b>
                  {siguienteNivel && (
                    <> / {siguienteNivel.min} para {siguienteNivel.nivel}</>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div key="contratos">
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-md">
              <CardHeader>
                <CardTitle>Contratos cerrados recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {contratos && contratos.length > 0 ? (
                  <ul className="space-y-1">
                    {contratos.slice(0, 5).map((c, idx) => (
                      <li key={idx} className="text-sm">{c.descripcion || c.id}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground">No hay contratos recientes.</span>
                )}
              </CardContent>
            </Card>
          </div>
          <div key="bono">
            <Card className="h-full bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎁 Bonificación Extra
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usuario.bonoExtra
                  ? <span className="text-green-600 font-bold">¡Has recibido el bono extra este mes!</span>
                  : <span className="text-muted-foreground">Aún no has alcanzado el bono extra.</span>
                }
              </CardContent>
            </Card>
          </div>
          <div key="prereg">
            <Card className="h-full bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md">
              <CardHeader>
                <CardTitle>Pre-registros recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {preRegistros && preRegistros.length > 0 ? (
                  <ul className="space-y-1">
                    {preRegistros.slice(0, 5).map((pr, idx) => (
                      <li key={idx} className="text-sm">{pr.descripcion || pr.id}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground">No hay pre-registros recientes.</span>
                )}
              </CardContent>
            </Card>
          </div>
          <div key="wallnet">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <button
                  className="text-[#005BAA] hover:text-[#003366] p-2 rounded-full border border-gray-200 shadow"
                  onClick={() => setExpandWallNet(e => !e)}
                  aria-label={expandWallNet ? 'Contraer WallNet' : 'Expandir WallNet'}
                >
                  {expandWallNet ? <ChevronsRight className="w-6 h-6" /> : <ChevronsLeft className="w-6 h-6" />}
                </button>
                {expandWallNet && (
                  <button onClick={() => setExpandWallNet(false)} className="ml-auto text-gray-500 hover:text-red-500 p-2 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                <WallNetDashboardWidget />
              </div>
            </div>
          </div>
        </ResponsiveGridLayout>
        {/* Overlay desenfoque cuando WallNet expandido */}
        {expandWallNet && <div className="fixed inset-0 z-40 bg-black/20 md:block hidden" onClick={() => setExpandWallNet(false)} />}
      </div>
      {/* Mobile: flex layout igual que antes */}
      <div className="md:hidden grid grid-cols-1 gap-6">
        {/* ... columnas igual que antes ... */}
        <div className="flex flex-col gap-6 col-span-1">
          <Card className={`bg-gradient-to-br ${nivelInfo.color} shadow-xl border-0 relative overflow-hidden`}>
            <div className="absolute right-4 top-4 opacity-30 scale-150">
              <NivelIcon width={48} height={48} />
            </div>
            <CardHeader>
              <div className="flex items-center gap-3">
                <NivelIcon width={36} height={36} />
                <div>
                  <CardTitle className="text-lg font-bold">Nivel: {nivelInfo.nivel}</CardTitle>
                  <CardDescription className="text-base font-semibold">Comisión: {nivelInfo.comision}%</CardDescription>
                </div>
              </div>
              {siguienteNivel && (
                <div className="mt-2 text-sm text-gray-700">
                  Próximo nivel: <b>{siguienteNivel.nivel}</b> ({siguienteNivel.min} contratos)
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Progress value={progreso} />
              <div className="mt-2 text-sm">
                Contratos este mes: <b>{usuario.contratosMes || 0}</b>
                {siguienteNivel && (
                  <> / {siguienteNivel.min} para {siguienteNivel.nivel}</>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-md">
            <CardHeader>
              <CardTitle>Contratos cerrados recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {contratos && contratos.length > 0 ? (
                <ul className="space-y-1">
                  {contratos.slice(0, 5).map((c, idx) => (
                    <li key={idx} className="text-sm">{c.descripcion || c.id}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground">No hay contratos recientes.</span>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-6 col-span-1">
          <Card className="h-full bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎁 Bonificación Extra
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usuario.bonoExtra
                ? <span className="text-green-600 font-bold">¡Has recibido el bono extra este mes!</span>
                : <span className="text-muted-foreground">Aún no has alcanzado el bono extra.</span>
              }
            </CardContent>
          </Card>
          <Card className="h-full bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md">
            <CardHeader>
              <CardTitle>Pre-registros recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {preRegistros && preRegistros.length > 0 ? (
                <ul className="space-y-1">
                  {preRegistros.slice(0, 5).map((pr, idx) => (
                    <li key={idx} className="text-sm">{pr.descripcion || pr.id}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground">No hay pre-registros recientes.</span>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 flex flex-col gap-6">
          <WallNetDashboardWidget />
        </div>
      </div>
    </div>
  )
}

export default VendedorDashboard; 