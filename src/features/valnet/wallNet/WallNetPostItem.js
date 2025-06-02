import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Trash2, Edit2, X, Check, Users } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useWallNetPosts } from './hooks/useWallNetPosts';
// Utilidad para tiempo relativo
function timeAgo(date) {
    const now = Date.now();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)
        return `hace ${diff}s`;
    if (diff < 3600)
        return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400)
        return `hace ${Math.floor(diff / 3600)}h`;
    return `hace ${Math.floor(diff / 86400)}d`;
}
const PRIORITY_STYLE = {
    normal: 'border-2 border-[#1976d2] shadow-[0_2px_12px_0_rgba(25,118,210,0.08)] hover:shadow-[0_0_0_4px_rgba(25,118,210,0.15)]',
    importante: 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white shadow-[0_2px_12px_0_rgba(250,204,21,0.10)] hover:shadow-[0_0_0_4px_rgba(250,204,21,0.18)]',
    urgente: 'border-2 border-[#F37021] bg-gradient-to-br from-orange-50 to-white shadow-[0_2px_12px_0_rgba(243,112,33,0.12)] hover:shadow-[0_0_0_4px_rgba(243,112,33,0.20)]',
};
const WallNetPostItem = ({ post }) => {
    const { user } = useAuthStore();
    const { toggleLike, listenComments, addComment, removeComment, editPost, deletePost, } = useWallNetPosts();
    const userId = user?.id;
    const isOwner = userId === post.userId;
    const hasLiked = userId ? post.likes.includes(userId) : false;
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const [likeAnim, setLikeAnim] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [showDelete, setShowDelete] = useState(false);
    const [showLikes, setShowLikes] = useState(false);
    useEffect(() => {
        if (showComments) {
            const unsubscribe = listenComments(post.id, setComments);
            return () => unsubscribe();
        }
    }, [showComments, post.id, listenComments]);
    useEffect(() => {
        if (showComments && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments, showComments]);
    const handleLike = async () => {
        if (!userId)
            return;
        setLikeAnim(true);
        await toggleLike(post.id, userId, hasLiked);
        setTimeout(() => setLikeAnim(false), 350);
    };
    const handleCommentSend = async (e) => {
        e.preventDefault();
        if (!user || !commentText.trim())
            return;
        await addComment(post.id, { id: user.id, name: `${user.nombres} ${user.apellidos}` }, commentText.trim());
        setCommentText('');
        if (inputRef.current)
            inputRef.current.focus();
    };
    const handleRemoveComment = async (commentId) => {
        if (!user)
            return;
        await removeComment(post.id, commentId);
    };
    const handleEdit = async () => {
        if (!editContent.trim())
            return;
        await editPost(post.id, editContent.trim());
        setEditing(false);
    };
    const handleDelete = async () => {
        await deletePost(post.id);
        setShowDelete(false);
    };
    // Simulación: obtener nombres de usuarios por id (en real, deberías mapear ids a nombres)
    const getUserName = (id) => {
        if (user && id === user.id)
            return user.nombres + ' (Tú)';
        return 'Usuario ' + id.slice(-4);
    };
    return (_jsx(AnimatePresence, { children: _jsxs(motion.div, { className: `rounded-xl p-4 flex gap-3 flex-col transition-all duration-200 ${PRIORITY_STYLE[post.priority]}`, initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 30 }, transition: { type: 'spring', stiffness: 300, damping: 30 }, layout: true, children: [_jsxs("div", { className: 'flex gap-3', children: [_jsx("div", { className: 'flex-shrink-0', children: post.userAvatar ? (_jsx("img", { src: post.userAvatar, alt: post.userName, className: 'w-10 h-10 rounded-full object-cover' })) : (_jsx("div", { className: 'w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg text-primary', children: post.userName[0] })) }), _jsxs("div", { className: 'flex-1 min-w-0 relative', children: [_jsxs("div", { className: 'flex items-center gap-2 mb-1', children: [_jsx("span", { className: 'font-semibold text-base truncate', children: post.userName }), _jsx("span", { className: 'text-xs px-2 py-0.5 rounded-full', style: {
                                                background: post.category.color || '#eee',
                                                color: '#fff',
                                            }, children: post.category.name }), _jsx("span", { className: 'ml-auto', children: _jsx("span", { className: 'text-xs px-2 py-0.5 absolute right-0 top-0\n                rounded-full bg-gray-200 text-gray-700 font-semibold', children: timeAgo(post.createdAt) }) })] }), editing ? (_jsxs("div", { className: 'flex gap-2 items-center mt-2', children: [_jsx("textarea", { className: 'flex-1 border rounded px-2 py-1 text-base focus:outline-none focus:ring-2 focus:ring-[#0053A0]', value: editContent, onChange: (e) => setEditContent(e.target.value), rows: 2, maxLength: 300, autoFocus: true }), _jsx("button", { className: 'p-2 rounded-full bg-[#0053A0] text-white hover:bg-[#0053A0]/90 transition', title: 'Guardar', onClick: handleEdit, children: _jsx(Check, { className: 'w-4 h-4' }) }), _jsx("button", { className: 'p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition', title: 'Cancelar', onClick: () => setEditing(false), children: _jsx(X, { className: 'w-4 h-4' }) })] })) : (_jsx("div", { className: 'text-base whitespace-pre-line break-words mb-2', children: post.content })), post.imageUrl && (_jsx("img", { src: post.imageUrl, alt: 'post', className: 'max-w-full max-h-60 rounded-lg border mb-2' })), _jsxs("div", { className: 'flex gap-4 text-sm text-muted-foreground mt-2 items-center relative group', children: [_jsxs("div", { className: 'relative', children: [_jsxs(motion.button, { className: `flex items-center gap-1 hover:text-[#0053A0] transition ${hasLiked ? 'text-[#0053A0] font-bold' : ''}`, onClick: handleLike, disabled: !userId, "aria-label": hasLiked ? 'Quitar like' : 'Dar like', animate: likeAnim ? { scale: 1.3 } : { scale: 1 }, transition: { type: 'spring', stiffness: 400, damping: 10 }, onMouseEnter: () => setShowLikes(true), onMouseLeave: () => setShowLikes(false), onClickCapture: () => setShowLikes((v) => !v), children: [_jsx("span", { role: 'img', "aria-label": 'like', children: "\uD83D\uDC4D" }), ' ', post.likes.length] }), showLikes && post.likes.length > 0 && (_jsxs("div", { className: 'absolute left-0 top-8 z-30 bg-white border rounded shadow-lg min-w-[180px] p-2 animate-fade-in', children: [_jsxs("div", { className: 'flex items-center gap-2 mb-2 text-[#0053A0] font-semibold', children: [_jsx(Users, { className: 'w-4 h-4' }), " Likes"] }), _jsx("ul", { className: 'max-h-40 overflow-y-auto text-xs', children: post.likes.map((uid) => (_jsx("li", { className: 'py-1 px-2 hover:bg-blue-50 rounded', children: getUserName(uid) }, uid))) })] }))] }), _jsxs("button", { className: 'flex items-center gap-1 hover:text-[#0053A0] transition', onClick: () => setShowComments((v) => !v), "aria-label": 'Ver comentarios', children: [_jsx("span", { role: 'img', "aria-label": 'comments', children: "\uD83D\uDCAC" }), ' ', post.commentsCount] }), isOwner && !editing && (_jsxs("span", { className: 'absolute right-0 bottom-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10', children: [_jsx("button", { className: 'p-1 rounded hover:bg-[#0053A0]/10', title: 'Editar', onClick: () => {
                                                        setEditing(true);
                                                        setEditContent(post.content);
                                                    }, children: _jsx(Edit2, { className: 'w-4 h-4 text-[#0053A0]' }) }), _jsx("button", { className: 'p-1 rounded hover:bg-[#F37021]/10', title: 'Eliminar', onClick: () => setShowDelete(true), children: _jsx(Trash2, { className: 'w-4 h-4 text-[#F37021]' }) })] }))] })] })] }), showDelete && (_jsx("div", { className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/30', children: _jsxs("div", { className: 'bg-white rounded-lg shadow-lg p-6 flex flex-col items-center', children: [_jsx("p", { className: 'mb-4 text-center', children: "\u00BFSeguro que deseas eliminar este post?" }), _jsxs("div", { className: 'flex gap-4', children: [_jsx("button", { className: 'bg-[#F37021] text-white px-4 py-2 rounded hover:bg-[#F37021]/90', onClick: handleDelete, children: "Eliminar" }), _jsx("button", { className: 'bg-gray-200 px-4 py-2 rounded hover:bg-gray-300', onClick: () => setShowDelete(false), children: "Cancelar" })] })] }) })), showComments && (_jsxs("div", { className: 'mt-3 border-t pt-3', children: [_jsx("div", { ref: scrollRef, className: 'flex flex-col gap-2 max-h-40 overflow-y-auto mb-2 pr-1', children: _jsx(AnimatePresence, { children: comments.length === 0 ? (_jsx(motion.div, { className: 'text-sm text-muted-foreground italic', initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: "Sin comentarios a\u00FAn." })) : (comments.map((c) => (_jsxs(motion.div, { className: 'flex items-center gap-2 group', initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 30 }, transition: {
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20,
                                    }, children: [_jsx("div", { className: 'w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-[#0053A0]', children: c.userName[0] }), _jsxs("div", { className: 'bg-gray-100 rounded px-3 py-1 text-sm flex-1 flex items-center justify-between', children: [_jsxs("span", { children: [_jsx("span", { className: 'font-semibold mr-2', children: c.userName }), c.content, _jsx("span", { className: 'ml-2 text-xs text-muted-foreground', children: new Date(c.createdAt).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            }) })] }), user && c.userId === user.id && (_jsx("button", { className: 'ml-2 text-xs text-[#F37021] hover:underline opacity-70 group-hover:opacity-100', title: 'Eliminar comentario', onClick: () => handleRemoveComment(c.id), children: "Eliminar" }))] })] }, c.id)))) }) }), _jsxs("form", { onSubmit: handleCommentSend, className: 'flex gap-2 mt-2 items-center', children: [_jsx("input", { ref: inputRef, type: 'text', className: 'flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#0053A0]', placeholder: 'Comentar...', value: commentText, onChange: (e) => setCommentText(e.target.value), onKeyDown: (e) => {
                                        if (e.key === 'Enter' && !e.shiftKey)
                                            handleCommentSend(e);
                                    }, maxLength: 200, disabled: !user, autoComplete: 'off' }), _jsx("button", { type: 'submit', className: 'bg-[#0053A0] text-white rounded-full p-1 flex items-center justify-center shadow hover:bg-[#0053A0]/90 transition', disabled: !commentText.trim() || !user, title: 'Enviar', children: _jsx(ArrowUp, { className: 'w-4 h-4' }) })] })] }))] }) }));
};
export default WallNetPostItem;
