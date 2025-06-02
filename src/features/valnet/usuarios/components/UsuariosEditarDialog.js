import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useUpdateUsuario } from '../hooks/useUpdateUsuario';
import { UsuarioForm } from './UsuarioForm';
function mapUserToUsuario(user) {
    return {
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        role: user.role,
        cedula: user.cedula || '',
        status: user.status,
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        fechaNacimiento: user.fechaNacimiento || '',
        brigadaId: user.brigadaId || '',
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
    };
}
export function UsuariosEditarDialog({ setOpen, currentUser, }) {
    const { updateUsuario, loading, error } = useUpdateUsuario();
    return (_jsxs(_Fragment, { children: [_jsx(UsuarioForm, { usuario: currentUser ? mapUserToUsuario(currentUser) : undefined, onSubmit: async (usuario) => {
                    if (!currentUser)
                        return;
                    const res = await updateUsuario(currentUser.id, usuario);
                    if (res.success)
                        setOpen(null);
                }, isLoading: loading, onCancel: () => setOpen(null) }), error && _jsx("div", { className: 'text-red-500 text-sm mt-2', children: error })] }));
}
