import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "./globals.css";

export default function App() {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta name="description" content="Pizza Pachorra - Sistema de gestión de pedidos" />
        
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-slate-900 text-amber-50 font-sans antialiased">
        <Outlet />
        
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}