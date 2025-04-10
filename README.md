# CUENTAS INGEOCIMYC

Este proyecto es una aplicación web para la gestión financiera y administrativa de Ingeocimyc, incluyendo:

- Control de proyectos y sus gastos
- Gestión de gastos mensuales de la empresa
- Cálculo y seguimiento de utilidades
- Módulo de laboratorio para perfiles de suelo

## Tecnologías

- **Frontend**: React 18, Vite, Material UI
- **Backend**: API REST (alojada en Render)
- **Autenticación**: Sistema de tokens con refresh
- **Librerías principales**: React Router, Axios

## Estructura del Proyecto

```
src/
├── api/           # Configuración de API y autenticación
├── assets/        # Recursos estáticos
├── components/    # Componentes React
│   ├── atoms/     # Componentes atómicos (Navigation, etc.)
│   ├── cuentas/   # Componentes para gestión financiera
│   │   ├── forms/   # Formularios de creación/edición
│   │   └── tablas/  # Vistas tabulares de datos
│   └── lab/       # Componentes para el módulo de laboratorio
└── main.jsx       # Punto de entrada de la aplicación
```

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## Funcionalidades Principales

- **Gestión de Proyectos**: Creación, edición y seguimiento de proyectos
- **Control de Gastos**: Registro y monitoreo de gastos por proyecto y por mes
- **Cálculo de Utilidades**: Análisis financiero de rentabilidad
- **Perfiles de Suelo**: Gestión de datos de laboratorio geotécnico

## Acceso

La aplicación requiere autenticación para acceder a la mayoría de las funcionalidades.
