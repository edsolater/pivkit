import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import solid from "vite-plugin-solid"

export default defineConfig({
  plugins: [
    solid(),
    dts({
      tsconfigPath: "./tsconfig.json",
      staticImport: true,
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
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
