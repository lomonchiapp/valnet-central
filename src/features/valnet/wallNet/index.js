import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import WallNetConfig from './WallNetConfig';
import WallNetFeed from './WallNetFeed';
import WallNetPostForm from './WallNetPostForm';
const WallNet = () => {
    return (_jsxs("div", { children: [_jsx("h2", { children: "WallNet - Muro Social" }), _jsx(WallNetPostForm, {}), _jsx(WallNetFeed, {})] }));
};
export default WallNet;
export { WallNetFeed, WallNetConfig };
