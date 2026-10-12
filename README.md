# React + Vite

## Render deployment

This application can be deployed as a Docker web service from the repository
root. The root-level `Dockerfile` installs dependencies, builds the Vite
frontend, and starts the Express server. Set the Render health check path to
`/health`.

The repository also includes `render.yaml` for deploying as a Node web service.
If using that configuration, select the Node runtime in Render rather than
Docker.

If the frontend and API are deployed as separate Render services, set
`API_PROXY_TARGET` on the frontend's Node web service to the API service's
origin (for example, `https://event-management-fdq8.onrender.com`). This makes
same-origin `/api/*` requests reach the API without frontend changes. The
frontend service must run this Express server; static-only hosting cannot run
the proxy. Do not set this variable on the API service itself.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
