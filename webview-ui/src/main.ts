import { createApp } from "vue";
import App from "./App.vue";
import element from 'element-plus';
import 'element-plus/dist/index.css'
//set dark theme
import 'element-plus/theme-chalk/dark/css-vars.css'

let app = createApp(App)
app.use(element).mount("#app");
