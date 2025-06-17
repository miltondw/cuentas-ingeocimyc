# Guía de Migración para Cuentas Ingeocimyc

## 📋 Pasos para la migración completa

Esta guía proporciona los pasos detallados para migrar progresivamente la aplicación existente a la nueva arquitectura propuesta.

### Paso 1: Configuración básica ✓

- [x] Actualizar `package.json` con nuevas dependencias
- [x] Configurar `tsconfig.json` con opciones adecuadas
- [x] Actualizar `vite.config.js` para soportar la nueva estructura
- [x] Crear estructura básica de carpetas

### Paso 2: Migración de servicios y utilidades

- [ ] Migrar utilidades existentes a TypeScript
  - [ ] Convertir `debugUtils.js` → `utils/helpers/debugUtils.ts`
  - [ ] Convertir `formatNumber.js` → `utils/formatters/numberFormatter.ts`
  - [ ] Convertir `lazyComponents.js` → `utils/helpers/lazyComponents.ts`
  - [ ] Convertir `offlineStorage.js` → `services/storage/offlineStorage.ts`
  - [ ] Convertir `pdfUtils.js` → `utils/helpers/pdfUtils.ts`
  - [ ] Convertir `serviceFieldValidation.js` → `utils/validators/serviceFieldValidation.ts`
  - [ ] Convertir `sync.js` → `utils/helpers/syncUtils.ts`

### Paso 3: Migración del módulo de autenticación

- [x] Crear proveedor de autenticación (`AuthProvider.tsx`)
- [x] Crear hook de autenticación (`useAuth.ts`)
- [x] Crear servicio de autenticación (`authService.ts`)
- [x] Implementar páginas de autenticación:
  - [x] `LoginPage.tsx`
  - [x] `LogoutPage.tsx`
  - [ ] `RegisterPage.tsx`
  - [ ] `ProfilePage.tsx`

### Paso 4: Migración de componentes comunes

- [x] Crear componentes de layout
  - [x] `MainLayout.tsx`
  - [x] `AuthLayout.tsx`
  - [x] `Navigation.tsx`
- [ ] Migrar componentes reutilizables
  - [ ] Convertir componentes de UI básicos
  - [ ] Convertir componentes de formularios
  - [ ] Convertir componentes de tablas

### Paso 5: Migración por módulo

#### Módulo de laboratorio

- [ ] Crear estructura base del módulo de laboratorio
- [ ] Migrar componentes de perfiles
  - [ ] Convertir `PerfilDeSuelos.jsx` → `features/lab/components/perfil/PerfilDeSuelos.tsx`
  - [ ] Convertir lógica relacionada a React Query
- [ ] Migrar componentes de apiques
  - [ ] Convertir `ApiquesDeSuelos.jsx` → `features/lab/components/apique/ApiquesDeSuelos.tsx`
  - [ ] Convertir lógica relacionada a React Query

#### Módulo de clientes

- [ ] Crear estructura base del módulo de clientes
- [ ] Migrar formularios de solicitud
  - [ ] Convertir `ClientForm.jsx` → `features/client/components/ClientForm.tsx`
  - [ ] Implementar validaciones con Zod

#### Módulo financiero

- [ ] Crear estructura base del módulo financiero
- [ ] Migrar componentes de gastos
  - [ ] Convertir componentes de tablas y formularios
  - [ ] Implementar lógica con React Query

### Paso 6: Implementación de caracteristicas avanzadas

- [ ] Implementar gestión de estado con React Query
  - [ ] Configurar hooks personalizados para cada entidad
  - [ ] Implementar estrategias de caché y revalidación
- [ ] Mejorar experiencia offline
  - [ ] Implementar sincronización avanzada
  - [ ] Agregar indicadores de estado de sincronización
- [ ] Implementar sistema de notificaciones
  - [ ] Crear componente central de notificaciones
  - [ ] Integrar con eventos de la aplicación

### Paso 7: Optimización y pruebas

- [ ] Implementar code splitting adicional
- [ ] Optimizar imágenes y recursos estáticos
- [ ] Configurar pruebas automáticas
  - [ ] Configurar Vitest
  - [ ] Escribir pruebas para servicios críticos
  - [ ] Escribir pruebas para componentes clave

## 🔄 Estrategia de migración progresiva

Para asegurar que la aplicación siga funcionando durante la migración:

1. **Migración por módulos**: Completar un módulo a la vez
2. **Enfoque paralelo**: Mantener los archivos originales hasta que los nuevos estén probados
3. **Rutas graduales**: Migrar ruta por ruta dentro de cada módulo
4. **Integración continua**: Probar la integración después de cada módulo migrado

## 📚 Reglas de estilo y convenios

Durante la migración, seguir estas pautas:

1. **Nombres de archivos**:

   - Componentes: PascalCase (ej. `Button.tsx`)
   - Hooks, utilidades: camelCase (ej. `useAuth.ts`)
   - Constantes: UPPER_SNAKE_CASE

2. **Estructura de carpetas**:

   - Cada módulo puede tener: `components/`, `hooks/`, `services/`, `utils/`, `types/`
   - Los componentes grandes pueden tener su propia carpeta con un archivo index.ts

3. **Importaciones**:

   - Usar importaciones con alias: `@/features/...`
   - Preferir importaciones nombradas sobre default export

4. **TypeScript**:

   - Evitar `any`, usar tipos específicos o generics
   - Documentar interfaces complejas
   - Uso de tipos de retorno explícitos en funciones complejas

5. **Componentes**:
   - Usar componentes funcionales con hooks
   - Props tipadas con interfaces explícitas
   - Usar destructuring para props
   - Documentar props complejas

## ⚡ Tips para la migración

- **Estrategia de rename + fix**: Renombrar archivo a .tsx y arreglar errores incrementalmente
- **Types graduales**: Empezar con tipos básicos y refinarlos gradualmente
- **Componentes críticos**: Priorizar componentes de autenticación y layout
- **Probar temprano**: Realizar pruebas después de cada cambio significativo
- **Hacer commits pequeños**: Facilita revertir cambios problemáticos
