import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCreateUsuario } from '../hooks/useCreateUsuario';
import { UsuarioForm } from './UsuarioForm';
import { UsuariosEditarDialog } from './UsuariosEditarDialog';
import { UsuariosEliminarDialog } from './UsuariosEliminarDialog';
import { UsuariosInvitarDialog } from './UsuariosInvitarDialog';
export function UsuariosDialogs({ open, setOpen, currentUser, }) {
    const { createUsuario, loading, error } = useCreateUsuario();
    return (_jsxs(_Fragment, { children: [_jsx(Dialog, { open: open === 'agregar', onOpenChange: (isOpen) => !isOpen && setOpen(null), children: _jsxs(DialogContent, { className: 'max-w-xl', children: [_jsx(UsuarioForm, { onSubmit: async (usuario) => {
                                const res = await createUsuario(usuario);
                                if (res.success) {
                                    setOpen(null);
                                }
                            }, isLoading: loading, onCancel: () => setOpen(null) }), error && _jsx("div", { className: 'text-red-500 text-sm mt-2', children: error })] }) }), _jsx(Dialog, { open: open === 'eliminar', onOpenChange: (isOpen) => !isOpen && setOpen(null), children: _jsx(DialogContent, { className: 'max-w-lg', children: _jsx(UsuariosEliminarDialog, { setOpen: setOpen, currentUser: currentUser }) }) }), _jsx(Dialog, { open: open === 'invitar', onOpenChange: (isOpen) => !isOpen && setOpen(null), children: _jsx(DialogContent, { className: 'max-w-xl', children: _jsx(UsuariosInvitarDialog, { setOpen: setOpen }) }) }), _jsx(Dialog, { open: open === 'editar', onOpenChange: (isOpen) => !isOpen && setOpen(null), children: _jsx(DialogContent, { className: 'max-w-xl', children: _jsx(UsuariosEditarDialog, { setOpen: setOpen, currentUser: currentUser }) }) })] }));
}
