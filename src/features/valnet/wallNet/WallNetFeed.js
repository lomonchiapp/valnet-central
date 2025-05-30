import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { useWallNetStore } from '@/stores/wallNetStore';
import WallNetPostForm from './WallNetPostForm';
import WallNetPostItem from './WallNetPostItem';
import { useWallNetCategories } from './hooks/useWallNetCategories';
const WallNetFeed = ({ maxPosts, showForm = true, height = '500px', }) => {
    const posts = useWallNetStore((s) => s.posts);
    const postsToShow = maxPosts ? posts.slice(0, maxPosts) : posts;
    const { fetchCategories } = useWallNetCategories();
    const feedRef = useRef(null);
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);
    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = 0;
        }
    }, [postsToShow.length]);
    return (_jsxs("div", { className: 'flex flex-col bg-slate-100 rounded-lg p-2 gap-2', style: { height }, children: [_jsx("div", { ref: feedRef, className: 'flex-1 flex flex-col gap-3 overflow-y-auto pr-1', style: { minHeight: 0 }, children: postsToShow.length === 0 ? (_jsx("p", { className: 'text-center text-muted-foreground', children: "No hay publicaciones a\u00FAn." })) : (postsToShow.map((post) => (_jsx(WallNetPostItem, { post: post }, post.id)))) }), showForm && (_jsx("div", { className: 'rounded-xl border bg-white shadow-sm p-4 mt-2', children: _jsx(WallNetPostForm, {}) }))] }));
};
export default WallNetFeed;
