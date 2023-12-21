import { defineConfig } from "vite";
import imgit from "imgit/vite";
import youtube from "imgit/youtube";
import svg from "imgit/svg";

export default defineConfig({
    plugins: [imgit({ root: "../assets", plugins: [youtube(), svg()] })]
});
