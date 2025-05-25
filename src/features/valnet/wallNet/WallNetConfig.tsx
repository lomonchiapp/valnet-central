import React, { useState, useEffect } from 'react'
import { useWallNetStore } from '@/stores/wallNetStore'
import { database } from '@/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query } from 'firebase/firestore'
import { WallNetCategory } from '@/types/interfaces/valnet/wallNet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RoleUsuario } from '@/types/interfaces/valnet/usuario'

const TABS = [
  { key: 'categories', label: 'Categorías' },
  { key: 'priorities', label: 'Prioridades' },
  { key: 'permissions', label: 'Permisos y visibilidad' },
  { key: 'moderation', label: 'Moderación' },
  { key: 'notifications', label: 'Notificaciones' },
  { key: 'advanced', label: 'Opciones avanzadas' },
]

const DEFAULT_PERMISSIONS = [
  { role: RoleUsuario.ADMIN, canPost: true, canComment: true, canView: true },
  { role: RoleUsuario.TECNICO_LIDER, canPost: true, canComment: true, canView: true },
  { role: RoleUsuario.COORDINADOR, canPost: true, canComment: true, canView: true },
  { role: RoleUsuario.INVENTARIO, canPost: false, canComment: true, canView: true },
  { role: RoleUsuario.CONTABILIDAD, canPost: false, canComment: false, canView: true },
  { role: RoleUsuario.TECNICO, canPost: false, canComment: true, canView: true },
  { role: RoleUsuario.VENDEDOR, canPost: false, canComment: true, canView: true },
  { role: RoleUsuario.SAC, canPost: false, canComment: true, canView: true },
]

const WallNetConfig = () => {
  const [tab, setTab] = useState('categories')
  const [name, setName] = useState('')
  const [color, setColor] = useState('#1976d2')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#1976d2')
  const [editVisibility, setEditVisibility] = useState<'public' | 'private'>('public')
  const categories = useWallNetStore((s) => s.categories)
  const setCategories = useWallNetStore((s) => s.setCategories)
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS)
  const [bannedWords, setBannedWords] = useState<string[]>([])
  const [newWord, setNewWord] = useState('')
  const [manualApproval, setManualApproval] = useState(false)
  const [moderatorRoles, setModeratorRoles] = useState<RoleUsuario[]>([RoleUsuario.ADMIN, RoleUsuario.COORDINADOR])
  const [notifyNewPost, setNotifyNewPost] = useState(true)
  const [notifyMention, setNotifyMention] = useState(true)
  const [notifyComment, setNotifyComment] = useState(false)

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      const q = query(collection(database, 'wallNetCategories'))
      const snap = await getDocs(q)
      const cats: WallNetCategory[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WallNetCategory))
      setCategories(cats)
      setLoading(false)
    }
    fetchCategories()
  }, [setCategories])

  // Add new category
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await addDoc(collection(database, 'wallNetCategories'), { name, color, visibility })
    setName('')
    setColor('#1976d2')
    setVisibility('public')
    // Refetch
    const snap = await getDocs(collection(database, 'wallNetCategories'))
    const cats: WallNetCategory[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WallNetCategory))
    setCategories(cats)
    setLoading(false)
  }

  // Delete category
  const handleDelete = async (id: string) => {
    setLoading(true)
    await deleteDoc(doc(database, 'wallNetCategories', id))
    // Refetch
    const snap = await getDocs(collection(database, 'wallNetCategories'))
    const cats: WallNetCategory[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WallNetCategory))
    setCategories(cats)
    setLoading(false)
  }

  // Edit category
  const handleEdit = (cat: WallNetCategory) => {
    setEditId(cat.id)
    setEditName(cat.name)
    setEditColor(cat.color || '#1976d2')
    setEditVisibility(cat.visibility || 'public')
  }

  const handleEditSave = async (id: string) => {
    setLoading(true)
    await updateDoc(doc(database, 'wallNetCategories', id), {
      name: editName,
      color: editColor,
      visibility: editVisibility,
    })
    setEditId(null)
    // Refetch
    const snap = await getDocs(collection(database, 'wallNetCategories'))
    const cats: WallNetCategory[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WallNetCategory))
    setCategories(cats)
    setLoading(false)
  }

  // Cancel edit
  const handleEditCancel = () => {
    setEditId(null)
  }

  // Simple drag & drop reordering (local only, for demo)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const handleDragStart = (idx: number) => setDragIndex(idx)
  const handleDragOver = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) return
    const newCats = [...categories]
    const [removed] = newCats.splice(dragIndex, 1)
    newCats.splice(idx, 0, removed)
    setCategories(newCats)
    setDragIndex(idx)
  }
  const handleDragEnd = () => setDragIndex(null)

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault()
    if (newWord.trim() && !bannedWords.includes(newWord.trim().toLowerCase())) {
      setBannedWords([...bannedWords, newWord.trim().toLowerCase()])
      setNewWord('')
    }
  }
  const handleRemoveWord = (word: string) => {
    setBannedWords(bannedWords.filter(w => w !== word))
  }
  const handleToggleModerator = (role: RoleUsuario) => {
    setModeratorRoles(
      moderatorRoles.includes(role)
        ? moderatorRoles.filter(r => r !== role)
        : [...moderatorRoles, role]
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Configuración de WallNet</h2>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          {TABS.map(t => (
            <TabsTrigger key={t.key} value={t.key} className="capitalize">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="categories">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-2 mb-6 items-center">
            <Input
              type="text"
              placeholder="Nombre de la categoría"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full md:w-auto"
            />
            <Input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-10 h-10 p-0 border-none bg-transparent"
            />
            <Select value={visibility} onValueChange={v => setVisibility(v as 'public' | 'private')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue>{visibility === 'public' ? 'Pública' : 'Privada'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Pública</SelectItem>
                <SelectItem value="private">Privada</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading} className="ml-0 md:ml-2">Agregar</Button>
          </form>
          <ul className="space-y-2">
            {categories.map((cat, idx) => (
              <li
                key={cat.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => { e.preventDefault(); handleDragOver(idx) }}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-2 bg-muted px-3 py-2 rounded border border-transparent hover:border-primary transition"
                style={{ opacity: dragIndex === idx ? 0.5 : 1 }}
              >
                {editId === cat.id ? (
                  <>
                    <Input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-32"
                    />
                    <Input
                      type="color"
                      value={editColor}
                      onChange={e => setEditColor(e.target.value)}
                      className="w-8 h-8 p-0 border-none bg-transparent"
                    />
                    <Select value={editVisibility} onValueChange={v => setEditVisibility(v as 'public' | 'private')}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue>{editVisibility === 'public' ? 'Pública' : 'Privada'}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Pública</SelectItem>
                        <SelectItem value="private">Privada</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => handleEditSave(cat.id)} disabled={loading} size="sm" variant="outline">Guardar</Button>
                    <Button onClick={handleEditCancel} size="sm" variant="outline">Cancelar</Button>
                  </>
                ) : (
                  <>
                    <Badge style={{ backgroundColor: cat.color || '#1976d2' }} className="text-white font-semibold px-3 py-1">
                      {cat.name}
                    </Badge>
                    <Badge variant={cat.visibility === 'private' ? 'secondary' : 'outline'}>
                      {cat.visibility === 'private' ? 'Privada' : 'Pública'}
                    </Badge>
                    <Button onClick={() => handleEdit(cat)} size="sm" variant="outline">Editar</Button>
                    <Button onClick={() => handleDelete(cat.id)} disabled={loading} size="sm" variant="destructive">Eliminar</Button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="text-xs text-muted-foreground mt-2">Arrastra para reordenar categorías (solo local, no persistente aún).</div>
        </TabsContent>
        <TabsContent value="priorities">
          <h3 className="font-semibold mb-2">Gestión de prioridades</h3>
          <div className="text-muted-foreground">(Próximamente: agregar, editar, eliminar y reordenar prioridades)</div>
        </TabsContent>
        <TabsContent value="permissions">
          <h3 className="font-semibold mb-4">Permisos y visibilidad</h3>
          <div className="mb-4 text-muted-foreground text-sm">
            Configura qué roles pueden publicar, comentar y ver publicaciones en WallNet.
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left font-semibold">Rol</th>
                  <th className="px-3 py-2 text-center font-semibold">Puede publicar</th>
                  <th className="px-3 py-2 text-center font-semibold">Puede comentar</th>
                  <th className="px-3 py-2 text-center font-semibold">Puede ver</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm, idx) => (
                  <tr key={perm.role} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{perm.role}</td>
                    <td className="px-3 py-2 text-center">
                      <Switch
                        checked={perm.canPost}
                        onCheckedChange={v => {
                          const updated = [...permissions]
                          updated[idx].canPost = v
                          setPermissions(updated)
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Switch
                        checked={perm.canComment}
                        onCheckedChange={v => {
                          const updated = [...permissions]
                          updated[idx].canComment = v
                          setPermissions(updated)
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Switch
                        checked={perm.canView}
                        onCheckedChange={v => {
                          const updated = [...permissions]
                          updated[idx].canView = v
                          setPermissions(updated)
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">Estos permisos aplican a todo WallNet. Para restricciones por categoría, usa la visibilidad de cada categoría.</div>
        </TabsContent>
        <TabsContent value="moderation">
          <h3 className="font-semibold mb-4">Moderación</h3>
          <div className="mb-6">
            <div className="font-medium mb-2">Palabras prohibidas</div>
            <form onSubmit={handleAddWord} className="flex gap-2 mb-2">
              <Input
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                placeholder="Agregar palabra..."
                className="w-48"
              />
              <Button type="submit" variant="outline">Agregar</Button>
            </form>
            <div className="flex flex-wrap gap-2">
              {bannedWords.length === 0 && <span className="text-muted-foreground text-xs">No hay palabras prohibidas.</span>}
              {bannedWords.map(word => (
                <Badge key={word} variant="destructive" className="flex items-center gap-1">
                  {word}
                  <Button size="icon" variant="ghost" className="p-0 h-4 w-4" onClick={() => handleRemoveWord(word)}>
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Switch checked={manualApproval} onCheckedChange={setManualApproval} id="manual-approval" />
              <label htmlFor="manual-approval" className="text-sm">Requiere aprobación manual de publicaciones</label>
            </div>
            <div className="text-xs text-muted-foreground ml-7">Si está activado, un moderador debe aprobar cada publicación antes de que sea visible.</div>
          </div>
          <div>
            <div className="font-medium mb-2">Roles de moderador</div>
            <div className="flex flex-wrap gap-2">
              {Object.values(RoleUsuario).map(role => (
                <Button
                  key={role}
                  variant={moderatorRoles.includes(role) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleToggleModerator(role)}
                >
                  {role}
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-2">Los moderadores pueden aprobar publicaciones y gestionar palabras prohibidas.</div>
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <h3 className="font-semibold mb-4">Notificaciones</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Switch checked={notifyNewPost} onCheckedChange={setNotifyNewPost} id="notify-new-post" />
              <label htmlFor="notify-new-post" className="text-sm">Notificar nuevas publicaciones</label>
            </div>
            <div className="text-xs text-muted-foreground ml-10 mb-2">Todos los usuarios conectados recibirán una notificación cuando se publique algo nuevo.</div>
            <div className="flex items-center gap-4">
              <Switch checked={notifyMention} onCheckedChange={setNotifyMention} id="notify-mention" />
              <label htmlFor="notify-mention" className="text-sm">Notificar menciones (@usuario)</label>
            </div>
            <div className="text-xs text-muted-foreground ml-10 mb-2">El usuario mencionado recibirá una notificación.</div>
            <div className="flex items-center gap-4">
              <Switch checked={notifyComment} onCheckedChange={setNotifyComment} id="notify-comment" />
              <label htmlFor="notify-comment" className="text-sm">Notificar nuevos comentarios</label>
            </div>
            <div className="text-xs text-muted-foreground ml-10">El autor de la publicación recibirá una notificación cuando alguien comente.</div>
          </div>
        </TabsContent>
        <TabsContent value="advanced">
          <h3 className="font-semibold mb-2">Opciones avanzadas</h3>
          <div className="text-muted-foreground">(Próximamente: comentarios, adjuntos, modo solo lectura, etc.)</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WallNetConfig 