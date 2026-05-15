# 🔐 Auth App — React + TypeScript + Tailwind

Proyecto de aprendizaje que implementa un sistema de autenticación
con buenas prácticas, arquitectura por capas y protección de rutas.

---

## 🚀 Cómo correr el proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Modo desarrollo
npm run dev

# 3. Build de producción
npm run build
```

Abre http://localhost:5173

**Credenciales de demo:**
| Usuario | Contraseña | Rol   |
|---------|-----------|-------|
| admin   | 1234      | Admin |
| user    | 1234      | User  |

---

## 📁 Arquitectura del proyecto

```
src/
├── config/
│   └── auth.config.ts       ← Constantes centralizadas (rutas, keys, mock users)
│
├── models/
│   └── user.model.ts        ← Tipos TypeScript (User, UserRole, permisos)
│
├── services/
│   └── auth.service.ts      ← Capa de acceso a datos / API
│
├── utils/
│   └── storage.utils.ts     ← Abstracción sobre localStorage
│
├── context/
│   └── AuthContext.tsx      ← Estado global de auth (useReducer + Context)
│
├── hooks/
│   └── usePermissions.ts    ← Permisos del usuario actual (useMemo)
│
├── routes/
│   ├── PrivateRoute.tsx     ← Guardián: redirige si no autenticado/sin rol
│   └── PublicRoute.tsx      ← Redirige al dashboard si ya está logueado
│
├── components/
│   ├── ui/                  ← Componentes atómicos (Button, Alert, LoadingScreen)
│   └── auth/                ← Componentes de dominio auth (LoginForm, UserMenu)
│
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ForbiddenPage.tsx    ← 403: autenticado pero sin permisos
│   └── NotFoundPage.tsx     ← 404
│
└── App.tsx                  ← Definición del árbol de rutas
```

---

## 🔒 Cómo funciona la autenticación

### Flujo de login

```
LoginForm
  → authService.login({ username, password })
    → busca en MOCK_USERS (futuro: fetch a /api/auth/login)
    → devuelve ServiceResult<AuthResponse>
  → AuthContext.login()
    → despacha LOGIN_SUCCESS al reducer
    → persiste user + token en localStorage
    → isAuthenticated = true
  → React Router redirige a /dashboard
```

### Persistencia de sesión (al recargar)

```
App monta → AuthProvider monta
  → useEffect (una vez) → authService.getStoredSession()
    → lee localStorage
    → si hay token + user → AUTH_INIT_DONE con sesión
    → si no hay nada      → AUTH_INIT_DONE null
  → isLoading = false
  → PrivateRoute/PublicRoute toman la decisión correcta
```

### Protección de rutas

```
Usuario navega a /dashboard
  → PrivateRoute verifica:
     [isLoading=true]  → muestra LoadingScreen
     [no autenticado]  → Navigate to /login (guarda ruta en state)
     [sin rol requerido] → Navigate to /403
     [todo OK]         → <Outlet /> (renderiza DashboardPage)
```

---

## 🎭 Sistema de roles

Los permisos se definen en `models/user.model.ts`:

```typescript
const ROLE_PERMISSIONS = {
  admin: { canViewDashboard: true, canManageUsers: true, ... },
  user:  { canViewDashboard: true, canManageUsers: false, ... },
}
```

Para verificar permisos en un componente:
```tsx
const { isAdmin, canManageUsers } = usePermissions()

// Mostrar/ocultar UI
{canManageUsers && <Button>Gestionar usuarios</Button>}

// Proteger rutas completas
<Route element={<PrivateRoute requiredRole="admin" />}>
  <Route path="/dashboard/users" element={<UsersPage />} />
</Route>
```

---

## 🔌 Migración a backend real

Todos los cambios necesarios están marcados con `// TODO: BACKEND REAL` en:

**`services/auth.service.ts`** — reemplazar los métodos mock:

```typescript
// Antes (mock):
const found = AUTH_CONFIG.MOCK_USERS.find(...)

// Después (backend real):
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials),
})
const data = await response.json()
```

El resto del código (contexto, componentes, rutas) **no necesita cambiar**.
Esta es la ventaja de la capa de servicios.

---

## 🧩 Patrones y decisiones técnicas

| Patrón | Dónde | Por qué |
|--------|-------|---------|
| Reducer Pattern | AuthContext | Transiciones de estado atómicas (evita inconsistencias) |
| ServiceResult<T> | auth.service | Manejo de errores sin try/catch en cada consumidor |
| Provider Pattern | AuthContext | Estado global sin prop drilling |
| Custom Hook | useAuth, usePermissions | Encapsular lógica y validar uso correcto |
| as const | auth.config | Tipos literales para las rutas (autocompletado + seguridad) |
| Discriminated Union | AuthAction, ServiceResult | TypeScript puede inferir el tipo correcto en cada case |
