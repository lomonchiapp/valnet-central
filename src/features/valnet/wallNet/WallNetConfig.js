import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { database } from '@/firebase';
import { RoleUsuario } from '@/types/interfaces/valnet/usuario';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, } from 'firebase/firestore';
import { useWallNetStore } from '@/stores/wallNetStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
const TABS = [
    { key: 'categories', label: 'Categorías' },
    { key: 'priorities', label: 'Prioridades' },
    { key: 'permissions', label: 'Permisos y visibilidad' },
    { key: 'moderation', label: 'Moderación' },
    { key: 'notifications', label: 'Notificaciones' },
    { key: 'advanced', label: 'Opciones avanzadas' },
];
const DEFAULT_PERMISSIONS = [
    { role: RoleUsuario.ADMIN, canPost: true, canComment: true, canView: true },
    {
        role: RoleUsuario.TECNICO_LIDER,
        canPost: true,
        canComment: true,
        canView: true,
    },
    {
        role: RoleUsuario.COORDINADOR,
        canPost: true,
        canComment: true,
        canView: true,
    },
    {
        role: RoleUsuario.INVENTARIO,
        canPost: false,
        canComment: true,
        canView: true,
    },
    {
        role: RoleUsuario.CONTABILIDAD,
        canPost: false,
        canComment: false,
        canView: true,
    },
    {
        role: RoleUsuario.TECNICO,
        canPost: false,
        canComment: true,
        canView: true,
    },
    {
        role: RoleUsuario.VENDEDOR,
        canPost: false,
        canComment: true,
        canView: true,
    },
    { role: RoleUsuario.SAC, canPost: false, canComment: true, canView: true },
];
const WallNetConfig = () => {
    const [tab, setTab] = useState('categories');
    const [name, setName] = useState('');
    const [color, setColor] = useState('#1976d2');
    const [visibility, setVisibility] = useState('public');
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('#1976d2');
    const [editVisibility, setEditVisibility] = useState('public');
    const categories = useWallNetStore((s) => s.categories);
    const setCategories = useWallNetStore((s) => s.setCategories);
    const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
    const [bannedWords, setBannedWords] = useState([]);
    const [newWord, setNewWord] = useState('');
    const [manualApproval, setManualApproval] = useState(false);
    const [moderatorRoles, setModeratorRoles] = useState([
        RoleUsuario.ADMIN,
        RoleUsuario.COORDINADOR,
    ]);
    const [notifyNewPost, setNotifyNewPost] = useState(true);
    const [notifyMention, setNotifyMention] = useState(true);
    const [notifyComment, setNotifyComment] = useState(false);
    // Fetch categories from Firestore
    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            const q = query(collection(database, 'wallNetCategories'));
            const snap = await getDocs(q);
            const cats = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setCategories(cats);
            setLoading(false);
        };
        fetchCategories();
    }, [setCategories]);
    // Add new category
    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        await addDoc(collection(database, 'wallNetCategories'), {
            name,
            color,
            visibility,
        });
        setName('');
        setColor('#1976d2');
        setVisibility('public');
        // Refetch
        const snap = await getDocs(collection(database, 'wallNetCategories'));
        const cats = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
        setLoading(false);
    };
    // Delete category
    const handleDelete = async (id) => {
        setLoading(true);
        await deleteDoc(doc(database, 'wallNetCategories', id));
        // Refetch
        const snap = await getDocs(collection(database, 'wallNetCategories'));
        const cats = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
        setLoading(false);
    };
    // Edit category
    const handleEdit = (cat) => {
        setEditId(cat.id);
        setEditName(cat.name);
        setEditColor(cat.color || '#1976d2');
        setEditVisibility(cat.visibility || 'public');
    };
    const handleEditSave = async (id) => {
        setLoading(true);
        await updateDoc(doc(database, 'wallNetCategories', id), {
            name: editName,
            color: editColor,
            visibility: editVisibility,
        });
        setEditId(null);
        // Refetch
        const snap = await getDocs(collection(database, 'wallNetCategories'));
        const cats = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
        setLoading(false);
    };
    // Cancel edit
    const handleEditCancel = () => {
        setEditId(null);
    };
    // Simple drag & drop reordering (local only, for demo)
    const [dragIndex, setDragIndex] = useState(null);
    const handleDragStart = (idx) => setDragIndex(idx);
    const handleDragOver = (idx) => {
        if (dragIndex === null || dragIndex === idx)
            return;
        const newCats = [...categories];
        const [removed] = newCats.splice(dragIndex, 1);
        newCats.splice(idx, 0, removed);
        setCategories(newCats);
        setDragIndex(idx);
    };
    const handleDragEnd = () => setDragIndex(null);
    const handleAddWord = (e) => {
        e.preventDefault();
        if (newWord.trim() && !bannedWords.includes(newWord.trim().toLowerCase())) {
            setBannedWords([...bannedWords, newWord.trim().toLowerCase()]);
            setNewWord('');
        }
    };
    const handleRemoveWord = (word) => {
        setBannedWords(bannedWords.filter((w) => w !== word));
    };
    const handleToggleModerator = (role) => {
        setModeratorRoles(moderatorRoles.includes(role)
            ? moderatorRoles.filter((r) => r !== role)
            : [...moderatorRoles, role]);
    };
    return (_jsxs("div", { className: 'max-w-4xl mx-auto p-6', children: [_jsx("h2", { className: 'text-2xl font-bold mb-6', children: "Configuraci\u00F3n de WallNet" }), _jsxs(Tabs, { value: tab, onValueChange: setTab, className: 'w-full', children: [_jsx(TabsList, { className: 'grid w-full grid-cols-6 mb-6', children: TABS.map((t) => (_jsx(TabsTrigger, { value: t.key, className: 'capitalize', children: t.label }, t.key))) }), _jsxs(TabsContent, { value: 'categories', children: [_jsxs("form", { onSubmit: handleAdd, className: 'flex flex-col md:flex-row gap-2 mb-6 items-center', children: [_jsx(Input, { type: 'text', placeholder: 'Nombre de la categor\u00EDa', value: name, onChange: (e) => setName(e.target.value), required: true, className: 'w-full md:w-auto' }), _jsx(Input, { type: 'color', value: color, onChange: (e) => setColor(e.target.value), className: 'w-10 h-10 p-0 border-none bg-transparent' }), _jsxs(Select, { value: visibility, onValueChange: (v) => setVisibility(v), children: [_jsx(SelectTrigger, { className: 'w-[120px]', children: _jsx(SelectValue, { children: visibility === 'public' ? 'Pública' : 'Privada' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'public', children: "P\u00FAblica" }), _jsx(SelectItem, { value: 'private', children: "Privada" })] })] }), _jsx(Button, { type: 'submit', disabled: loading, className: 'ml-0 md:ml-2', children: "Agregar" })] }), _jsx("ul", { className: 'space-y-2', children: categories.map((cat, idx) => (_jsx("li", { draggable: true, onDragStart: () => handleDragStart(idx), onDragOver: (e) => {
                                        e.preventDefault();
                                        handleDragOver(idx);
                                    }, onDragEnd: handleDragEnd, className: 'flex items-center gap-2 bg-muted px-3 py-2 rounded border border-transparent hover:border-primary transition', style: { opacity: dragIndex === idx ? 0.5 : 1 }, children: editId === cat.id ? (_jsxs(_Fragment, { children: [_jsx(Input, { type: 'text', value: editName, onChange: (e) => setEditName(e.target.value), className: 'w-32' }), _jsx(Input, { type: 'color', value: editColor, onChange: (e) => setEditColor(e.target.value), className: 'w-8 h-8 p-0 border-none bg-transparent' }), _jsxs(Select, { value: editVisibility, onValueChange: (v) => setEditVisibility(v), children: [_jsx(SelectTrigger, { className: 'w-[100px]', children: _jsx(SelectValue, { children: editVisibility === 'public' ? 'Pública' : 'Privada' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'public', children: "P\u00FAblica" }), _jsx(SelectItem, { value: 'private', children: "Privada" })] })] }), _jsx(Button, { onClick: () => handleEditSave(cat.id), disabled: loading, size: 'sm', variant: 'outline', children: "Guardar" }), _jsx(Button, { onClick: handleEditCancel, size: 'sm', variant: 'outline', children: "Cancelar" })] })) : (_jsxs(_Fragment, { children: [_jsx(Badge, { style: { backgroundColor: cat.color || '#1976d2' }, className: 'text-white font-semibold px-3 py-1', children: cat.name }), _jsx(Badge, { variant: cat.visibility === 'private' ? 'secondary' : 'outline', children: cat.visibility === 'private' ? 'Privada' : 'Pública' }), _jsx(Button, { onClick: () => handleEdit(cat), size: 'sm', variant: 'outline', children: "Editar" }), _jsx(Button, { onClick: () => handleDelete(cat.id), disabled: loading, size: 'sm', variant: 'destructive', children: "Eliminar" })] })) }, cat.id))) }), _jsx("div", { className: 'text-xs text-muted-foreground mt-2', children: "Arrastra para reordenar categor\u00EDas (solo local, no persistente a\u00FAn)." })] }), _jsxs(TabsContent, { value: 'priorities', children: [_jsx("h3", { className: 'font-semibold mb-2', children: "Gesti\u00F3n de prioridades" }), _jsx("div", { className: 'text-muted-foreground', children: "(Pr\u00F3ximamente: agregar, editar, eliminar y reordenar prioridades)" })] }), _jsxs(TabsContent, { value: 'permissions', children: [_jsx("h3", { className: 'font-semibold mb-4', children: "Permisos y visibilidad" }), _jsx("div", { className: 'mb-4 text-muted-foreground text-sm', children: "Configura qu\u00E9 roles pueden publicar, comentar y ver publicaciones en WallNet." }), _jsx("div", { className: 'overflow-x-auto', children: _jsxs("table", { className: 'min-w-full border rounded text-sm', children: [_jsx("thead", { children: _jsxs("tr", { className: 'bg-muted', children: [_jsx("th", { className: 'px-3 py-2 text-left font-semibold', children: "Rol" }), _jsx("th", { className: 'px-3 py-2 text-center font-semibold', children: "Puede publicar" }), _jsx("th", { className: 'px-3 py-2 text-center font-semibold', children: "Puede comentar" }), _jsx("th", { className: 'px-3 py-2 text-center font-semibold', children: "Puede ver" })] }) }), _jsx("tbody", { children: permissions.map((perm, idx) => (_jsxs("tr", { className: 'border-b last:border-b-0', children: [_jsx("td", { className: 'px-3 py-2 font-medium whitespace-nowrap', children: perm.role }), _jsx("td", { className: 'px-3 py-2 text-center', children: _jsx(Switch, { checked: perm.canPost, onCheckedChange: (v) => {
                                                                const updated = [...permissions];
                                                                updated[idx].canPost = v;
                                                                setPermissions(updated);
                                                            } }) }), _jsx("td", { className: 'px-3 py-2 text-center', children: _jsx(Switch, { checked: perm.canComment, onCheckedChange: (v) => {
                                                                const updated = [...permissions];
                                                                updated[idx].canComment = v;
                                                                setPermissions(updated);
                                                            } }) }), _jsx("td", { className: 'px-3 py-2 text-center', children: _jsx(Switch, { checked: perm.canView, onCheckedChange: (v) => {
                                                                const updated = [...permissions];
                                                                updated[idx].canView = v;
                                                                setPermissions(updated);
                                                            } }) })] }, perm.role))) })] }) }), _jsx("div", { className: 'mt-4 text-xs text-muted-foreground', children: "Estos permisos aplican a todo WallNet. Para restricciones por categor\u00EDa, usa la visibilidad de cada categor\u00EDa." })] }), _jsxs(TabsContent, { value: 'moderation', children: [_jsx("h3", { className: 'font-semibold mb-4', children: "Moderaci\u00F3n" }), _jsxs("div", { className: 'mb-6', children: [_jsx("div", { className: 'font-medium mb-2', children: "Palabras prohibidas" }), _jsxs("form", { onSubmit: handleAddWord, className: 'flex gap-2 mb-2', children: [_jsx(Input, { value: newWord, onChange: (e) => setNewWord(e.target.value), placeholder: 'Agregar palabra...', className: 'w-48' }), _jsx(Button, { type: 'submit', variant: 'outline', children: "Agregar" })] }), _jsxs("div", { className: 'flex flex-wrap gap-2', children: [bannedWords.length === 0 && (_jsx("span", { className: 'text-muted-foreground text-xs', children: "No hay palabras prohibidas." })), bannedWords.map((word) => (_jsxs(Badge, { variant: 'destructive', className: 'flex items-center gap-1', children: [word, _jsx(Button, { size: 'icon', variant: 'ghost', className: 'p-0 h-4 w-4', onClick: () => handleRemoveWord(word), children: "\u00D7" })] }, word)))] })] }), _jsxs("div", { className: 'mb-6', children: [_jsxs("div", { className: 'flex items-center gap-2 mb-2', children: [_jsx(Switch, { checked: manualApproval, onCheckedChange: setManualApproval, id: 'manual-approval' }), _jsx("label", { htmlFor: 'manual-approval', className: 'text-sm', children: "Requiere aprobaci\u00F3n manual de publicaciones" })] }), _jsx("div", { className: 'text-xs text-muted-foreground ml-7', children: "Si est\u00E1 activado, un moderador debe aprobar cada publicaci\u00F3n antes de que sea visible." })] }), _jsxs("div", { children: [_jsx("div", { className: 'font-medium mb-2', children: "Roles de moderador" }), _jsx("div", { className: 'flex flex-wrap gap-2', children: Object.values(RoleUsuario).map((role) => (_jsx(Button, { variant: moderatorRoles.includes(role) ? 'default' : 'outline', size: 'sm', onClick: () => handleToggleModerator(role), children: role }, role))) }), _jsx("div", { className: 'text-xs text-muted-foreground mt-2', children: "Los moderadores pueden aprobar publicaciones y gestionar palabras prohibidas." })] })] }), _jsxs(TabsContent, { value: 'notifications', children: [_jsx("h3", { className: 'font-semibold mb-4', children: "Notificaciones" }), _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { className: 'flex items-center gap-4', children: [_jsx(Switch, { checked: notifyNewPost, onCheckedChange: setNotifyNewPost, id: 'notify-new-post' }), _jsx("label", { htmlFor: 'notify-new-post', className: 'text-sm', children: "Notificar nuevas publicaciones" })] }), _jsx("div", { className: 'text-xs text-muted-foreground ml-10 mb-2', children: "Todos los usuarios conectados recibir\u00E1n una notificaci\u00F3n cuando se publique algo nuevo." }), _jsxs("div", { className: 'flex items-center gap-4', children: [_jsx(Switch, { checked: notifyMention, onCheckedChange: setNotifyMention, id: 'notify-mention' }), _jsx("label", { htmlFor: 'notify-mention', className: 'text-sm', children: "Notificar menciones (@usuario)" })] }), _jsx("div", { className: 'text-xs text-muted-foreground ml-10 mb-2', children: "El usuario mencionado recibir\u00E1 una notificaci\u00F3n." }), _jsxs("div", { className: 'flex items-center gap-4', children: [_jsx(Switch, { checked: notifyComment, onCheckedChange: setNotifyComment, id: 'notify-comment' }), _jsx("label", { htmlFor: 'notify-comment', className: 'text-sm', children: "Notificar nuevos comentarios" })] }), _jsx("div", { className: 'text-xs text-muted-foreground ml-10', children: "El autor de la publicaci\u00F3n recibir\u00E1 una notificaci\u00F3n cuando alguien comente." })] })] }), _jsxs(TabsContent, { value: 'advanced', children: [_jsx("h3", { className: 'font-semibold mb-2', children: "Opciones avanzadas" }), _jsx("div", { className: 'text-muted-foreground', children: "(Pr\u00F3ximamente: comentarios, adjuntos, modo solo lectura, etc.)" })] })] })] }));
};
export default WallNetConfig;
