# Cartera Virtual

Aplicación personal de control financiero basada en React + Vite + TypeScript. Parte del HTML original se convirtió en una SPA mantenible con persistencia local, filtros y utilidades CSV.

## Características
- CRUD de movimientos (ingresos/egresos) con fecha, concepto, categoría, monto y notas opcionales.
- Resumen de saldo total y desglose mensual (respeta los filtros aplicados).
- Filtros por rango de fechas y categoría.
- Importar y exportar movimientos en CSV.
- Persistencia en `localStorage` con migración simple por versión.
- UI con TailwindCSS, componentes accesibles y estados vacíos.
- Tests básicos con Vitest + Testing Library.

## Decisiones y simplificaciones
- **Persistencia:** se guarda un objeto `{ version, movements }` en `localStorage`. Si hay errores de parseo o cambio de versión, se restaura un dataset por defecto inspirado en el HTML original.
- **Categorías:** lista base (`Ingresos`, `Hogar`, `Transporte`, `Entretenimiento`, `Familia`, `Salud`, `Otros`) que se amplía dinámicamente con las que ingreses.
- **Importar CSV:** reemplaza/mezcla al vuelo (se anexan filas importadas al estado actual). Formato esperado: `concept,category,amount,type,date,notes` con `type` en `INCOME` o `EXPENSE`.
- **UI sin backend:** toda la lógica vive en el navegador. Se puede limpiar desde las herramientas del navegador si deseas reiniciar datos.

## Requisitos previos
- Node.js 18+ y npm.

> Nota: si tu entorno usa un proxy corporativo, asegúrate de que `npm install` pueda resolver `registry.npmjs.org` (se encontraron restricciones en el entorno actual).

## Instalación y scripts
```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción
npm run preview   # vista previa del build
npm run lint      # eslint sobre src
npm run test      # vitest
npm run format    # prettier sobre el repo
```

## Estructura del proyecto
```
├─ src
│  ├─ components/      # UI: formulario, tabla, filtros, import/export, resumen
│  ├─ hooks/           # Estados de transacciones y filtros
│  ├─ services/        # storage local + helpers CSV
│  ├─ types/           # Tipos compartidos (Movement, Filters)
│  ├─ utils/           # Formateadores de moneda/fecha
│  ├─ App.tsx          # Página principal
│  └─ main.tsx         # Entrada de React/Vite
├─ public/             # Assets públicos
└─ index.html          # Shell de la SPA
```

## Cómo usar
1. Ejecuta `npm run dev` y abre el puerto indicado.
2. Captura movimientos desde el formulario (ingresos/egresos). Los registros aparecen en la tabla y afectan el resumen.
3. Aplica filtros de fecha/categoría para acotar el cálculo del saldo y el resumen mensual.
4. Exporta tus datos en CSV o impórtalos con el mismo esquema para continuar en otro navegador/dispositivo.

## Testing
- Se incluyen pruebas para la capa de almacenamiento y para validar el flujo de creación de movimientos en la UI. Ejecuta `npm run test`.

## Licencia
MIT
