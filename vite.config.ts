import { defineConfig } from "vite"
import solid from "vite-plugin-solid"
import path from "path"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    solid(),
    dts({
      tsconfigPath: path.resolve(__dirname, "tsconfig.json"),
      staticImport: true,
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["solid-js", "solid-js/web"],
      output: {
        globals: {
          "solid-js": "Solid",
          "solid-js/web": "SolidWeb",
        },
        preserveModules: true,
        preserveModulesRoot: "src",
        dir: "dist",
      },
    },
    minify: false, // Disable overall compression
    terserOptions: {
      mangle: false, // Disable variable name mangling
    },
  },
})
