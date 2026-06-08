# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Pronósticos (Porra entre amigos)

La ruta [src/pages/pronosticos.astro](src/pages/pronosticos.astro) ya incluye flujo funcional de porra:

- crear liga
- unirse por código
- cargar pronósticos
- cargar resultados manuales
- tabla de posiciones automática

### Modo compartido (recomendado)

Para compartir la misma liga entre varios dispositivos, configurar Supabase:

1. Crear proyecto en Supabase.
2. Ejecutar el SQL de [supabase/schema.sql](supabase/schema.sql) en SQL Editor.
3. Crear un archivo `.env` usando [`.env.example`](.env.example):

```env
PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

4. Ejecutar `npm run dev`.
5. Ir a `/pronosticos` y crear una liga.

Si faltan variables de entorno, la página funciona en modo local (solo navegador actual).
