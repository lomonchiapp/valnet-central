import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { NivelVendedor, Usuario } from '@/types/interfaces/valnet/usuario'
import { WallNetDashboardWidget } from './SacDashboard'
import { BronzeIcon, SilverIcon, GoldIcon, DiamondIcon } from '@/components/icons/VendedorNivelIcons'

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

export function VendedorDashboard({ usuario, preRegistros, contratos }: VendedorDashboardProps) {
  const nivelInfo = getNivelInfo(usuario.contratosMes || 0)
  const siguienteNivel = niveles[niveles.indexOf(nivelInfo) + 1]
  const progreso = siguienteNivel
    ? Math.min(100, (((usuario.contratosMes || 0) - nivelInfo.min + 1) / (siguienteNivel.min - nivelInfo.min)) * 100)
    : 100
  const NivelIcon = nivelInfo.icon

  return (
    <div className="space-y-8 px-4 md:px-8 py-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6">
          <Card className={`bg-gradient-to-br ${nivelInfo.color} shadow-xl border-0 relative overflow-hidden mb-6 min-h-[220px] md:min-h-[260px] flex flex-col justify-between`}>
            <div className="absolute right-4 top-4 opacity-30 scale-150">
              <NivelIcon width={48} height={48} />
            </div>
            <CardHeader className="pb-2">
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
            <CardContent className="pt-0">
              <Progress value={progreso} />
              <div className="mt-2 text-sm">
                Contratos este mes: <b>{usuario.contratosMes || 0}</b>
                {siguienteNivel && (
                  <> / {siguienteNivel.min} para {siguienteNivel.nivel}</>
                )}
              </div>
            </CardContent>
          </Card>
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
        <div className="flex flex-col gap-6">
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
        <div className="flex flex-col gap-6">
          <WallNetDashboardWidget />
        </div>
      </div>
    </div>
  )
}
