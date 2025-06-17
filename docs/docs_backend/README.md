# 🏗️ API Cuentas INGEOCIMYC - NestJS

API moderna para gestión de proyectos y servicios de ingeniería civil desarrollada con NestJS.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- MySQL 8.0+
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone [url-del-repositorio]
cd api-cuentas

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar en desarrollo
npm run start:dev
```

- **Manejo de Errores**: Sistema centralizado de manejo de errores
- **TypeScript**: Tipado estático para mayor robustez

## 📁 Estructura del Proyecto

```
src/
├── main.ts                 # Punto de entrada de la aplicación
├── app.module.ts           # Módulo principal
├── common/                 # Utilities compartidas
│   └── filters/           # Filtros de excepción
├── modules/               # Módulos de funcionalidad
│   ├── auth/             # Autenticación y autorización
│   ├── service-requests/ # Gestión de solicitudes de servicio
│   ├── services/         # Gestión de servicios y categorías
│   ├── projects/         # Gestión de proyectos
│   ├── profiles/         # Gestión de perfiles
│   └── financial/        # Módulo financiero
└── scripts/              # Scripts de migración y utilidades
```

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias

```bash
cd nest-migration
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=tu_usuario_db
DB_PASSWORD=tu_password_db
DB_NAME=tu_base_de_datos

# JWT Configuration
JWT_SECRET=tu_clave_secreta_jwt_muy_segura
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=5050
NODE_ENV=development
```

### 3. Preparar la base de datos

Ejecuta el script de migración de datos:

```bash
npm run build
npm run migrate:data
```

### 4. Ejecutar la aplicación

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📋 Plan de Migración Gradual

### Fase 1: ✅ Completada

- [x] Configuración inicial de Nest.js
- [x] Configuración de TypeORM y base de datos
- [x] Módulo de autenticación (JWT)
- [x] Módulo de solicitudes de servicio
- [x] Módulo de servicios y categorías
- [x] Sistema de validación con DTOs
- [x] Documentación Swagger
- [x] Manejo global de errores

### Fase 2: 🚧 Pendiente

- [ ] Migración del módulo de proyectos
- [ ] Migración del módulo de perfiles
- [ ] Migración del módulo financiero
- [ ] Migración del módulo de apiques
- [ ] Sistema de generación de PDFs
- [ ] Migración de middleware personalizado

### Fase 3: 🚧 Pendiente

- [ ] Testing unitario y de integración
- [ ] Optimización de consultas a base de datos
- [ ] Implementación de caché (Redis)
- [ ] Logging avanzado
- [ ] Monitoreo y métricas

## 🔄 Comparación Express vs Nest.js

### Express.js (Actual)

```javascript
// router.get('/service-requests', async (req, res) => {
app.get('/service-requests', async (req, res) => {
  try {
    const requests = await getServiceRequests();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Nest.js (Nuevo)

```typescript
@Controller('service-requests')
export class ServiceRequestsController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las solicitudes de servicio' })
  @ApiResponse({ status: 200, type: [ServiceRequest] })
  async findAll(@Query('status') status?: string): Promise<ServiceRequest[]> {
    if (status) {
      return this.serviceRequestsService.findByStatus(status);
    }
    return this.serviceRequestsService.findAll();
  }
}
```

## 🎯 Beneficios de la Migración

1. **Tipado Estático**: TypeScript elimina errores en tiempo de compilación
2. **Inyección de Dependencias**: Facilita testing y mantenimiento
3. **Decoradores**: Código más limpio y expresivo
4. **Validación Automática**: DTOs validan automáticamente las entradas
5. **Documentación Automática**: Swagger se genera automáticamente
6. **Estructura Modular**: Código más organizado y reutilizable
7. **Manejo de Errores**: Sistema centralizado y consistente

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 📖 Documentación API

Una vez que la aplicación esté corriendo, puedes acceder a la documentación Swagger en:

```
http://localhost:5050/api-docs
```

## 🔧 Scripts Disponibles

```bash
npm run start:dev      # Modo desarrollo con hot-reload
npm run start:debug    # Modo debug
npm run build          # Compilar TypeScript
npm run start:prod     # Modo producción
npm run migrate:data   # Migrar datos desde Express
npm run lint           # Linter
npm run test           # Tests
```

## 🚦 Estado de Migración

| Módulo           | Express | Nest.js | Estado    |
| ---------------- | ------- | ------- | --------- |
| Autenticación    | ✅      | ✅      | Migrado   |
| Service Requests | ✅      | ✅      | Migrado   |
| Services         | ✅      | ✅      | Migrado   |
| Proyectos        | ✅      | 🚧      | Pendiente |
| Perfiles         | ✅      | 🚧      | Pendiente |
| Finanzas         | ✅      | 🚧      | Pendiente |
| PDFs             | ✅      | 🚧      | Pendiente |

## 🔐 Autenticación

### Novedades en el Sistema de Autenticación (Junio 2025)

Hemos actualizado el sistema de autenticación con importantes mejoras:

- **Tablas de Seguridad** - Nombres actualizados a formato plural
- **Gestión de Sesiones** - Control de múltiples sesiones activas
- **Logs de Autenticación** - Registro detallado de actividades
- **Protección Avanzada** - Contra intentos de fuerza bruta

📄 Documentación detallada:

- [AUTH_SYSTEM_UPDATE_2025.md](./docs/api/AUTH_SYSTEM_UPDATE_2025.md) - Descripción del sistema
- [AUTH_ENDPOINTS_REFERENCE.md](./docs/api/AUTH_ENDPOINTS_REFERENCE.md) - Referencia de endpoints
- [FRONTEND_AUTH_GUIDE_2025.md](./docs/development/FRONTEND_AUTH_GUIDE_2025.md) - Guía para frontend
- [TABLES_UPDATE_2025.md](./docs/security/TABLES_UPDATE_2025.md) - Detalles técnicos de cambios

## 📞 Soporte

Para cualquier duda sobre la migración, revisa la documentación de Nest.js o contacta al equipo de desarrollo.
