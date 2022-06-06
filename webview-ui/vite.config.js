"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const vite_1 = require("vite");
const plugin_vue_1 = require("@vitejs/plugin-vue");
exports.default = (0, vite_1.defineConfig)({
    server: {
        https: false, // 是否开启 https
    open: false, // 是否自动在浏览器打开
    port: 3000, // 端口号
    host: "0.0.0.0",
    proxy: {
        '/sap': { // 匹配请求路径，localhost:3000/snow
            target: 'http://10.10.159.68:8000', // 代理的目标地址
            changeOrigin: true, // 开发模式，默认的origin是真实的 origin:localhost:3000 代理服务会把origin修改为目标地址
            // secure: true, // 是否https接口
            // ws: true, // 是否代理websockets
            // rewrite target目标地址 + '/abc'，如果接口是这样的，那么不用重写
            // rewrite: (path) => path.replace(/^\/snow/, '') // 路径重写，本项目不需要重写
        }
    },

    },
    plugins: [(0, plugin_vue_1.default)()],
    resolve: {
        alias: {
            '@': (0, url_1.fileURLToPath)(new url_1.URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: "build",
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`,
            },
        },
    },
});
//# sourceMappingURL=vite.config.js.map
