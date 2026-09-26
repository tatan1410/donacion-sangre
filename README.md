# 🩸 Donación de Sangre

Sistema web que conecta donantes con bancos de sangre en tiempo real, usando matching automático por compatibilidad sanguínea y cercanía geográfica.

## 🛠 Stack

- **Frontend:** React + Vite + Tailwind + Leaflet
- **Backend:** Spring Boot 3 + Java 17
- **Database:** PostgreSQL (Supabase)

## 📁 Estructura

```
donacion-sangre/
├── frontend/    → Aplicación React
└── backend/     → API Spring Boot
```

## 🚀 Cómo levantar el proyecto

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Corre en: `http://localhost:5173`

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
Corre en: `http://localhost:8081`

## 🌐 Endpoints principales

Base URL: `http://localhost:8081/api/v1`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Login de usuario |
| POST | `/auth/registro` | Registro de donante |
| GET | `/usuarios/perfil` | Perfil del usuario logueado |
| GET | `/bancos` | Listar bancos |
| GET | `/solicitudes/activas` | Urgencias activas |
| POST | `/solicitudes` | Crear urgencia (admin banco) |
| POST | `/donaciones` | Registrar donación |

Documentación completa: `http://localhost:8081/swagger-ui/index.html`

 