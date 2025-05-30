import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl)
        return null;
    return (_jsx("div", { className: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70', onClick: onClose, children: _jsxs("div", { className: 'relative max-w-full max-h-full', onClick: (e) => e.stopPropagation(), children: [_jsx("button", { className: 'absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100', onClick: onClose, "aria-label": 'Cerrar', children: _jsx("span", { className: 'text-xl', children: "\u00D7" }) }), _jsx("img", { src: imageUrl, alt: 'Vista ampliada', className: 'max-h-[80vh] max-w-[90vw] rounded shadow-lg border bg-white' })] }) }));
};
export default ImageModal;
