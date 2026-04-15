# 🍽️ Tenedor Libre Patagonia

> Sistema de reservas para buffet premium en Puerto Montt, Chile

<img width="1920" height="921" alt="landing-hero" src="https://github.com/user-attachments/assets/1438faf6-a4fb-400d-80c3-b92834423205" />



## ✨ Características

| Módulo | Funcionalidades |
|--------|-----------------|
| **Landing Page** | Vista del buffet, menú completo, ubicación, horarios, precios |
| **Reservas** | Sin necesidad de registro, confirmación por WhatsApp, validación de fechas/horarios |
| **Autenticación** | Google OAuth + Email/Password, registro con email, sesión persistente |
| **Perfil Usuario** | Ver reservas, modificar cantidad de personas, cancelar reservas, agendar en Google Calendar |
| **Admin Dashboard** | Estadísticas en tiempo real (ganancias estimadas, total de personas, reservas confirmadas/pendientes), filtrar por fecha/cliente/estado, exportar CSV, modificar PAX, cambiar estado |
| **Notificaciones** | Correo de confirmación al cliente (con archivo .ics), correo al admin al crear/modificar/cancelar reserva |

> 💡 **Importante:** Los usuarios invitados (sin registro) reciben confirmación por WhatsApp directamente al número del restaurante. Los usuarios registrados con Google reciben un correo con archivo .ics para agregar automáticamente la reserva a su calendario.


## 👥 Usuarios y Roles

| Rol | Acceso | Funcionalidades |
|-----|--------|-----------------|
| **Usuario invitado** | Sin registro | Reservar mesa, confirmación por WhatsApp |
| **Usuario registrado** | Email/Password o Google | Reservar, ver historial, modificar PAX, cancelar reservas, agendar en Google Calendar |
| **Administrador** | Email específico (tu.correo.com) | Dashboard completo, gestión de reservas, estadísticas, exportar CSV, notificaciones |

## 📊 Dashboard Admin - Estadísticas

| Métrica | Descripción |
|---------|-------------|
| **Ganancia estimada** | Cálculo automático basado en (cantidad de personas × $24.990) |
| **Total de personas** | Suma de todos los comensales en las reservas filtradas |
| **Reservas confirmadas** | Conteo de reservas con estado "confirmada" |
| **Reservas pendientes** | Conteo de reservas con estado "pendiente" |


## 📧 Sistema de Notificaciones

| Evento | Destinatario | Medio | Contenido |
|--------|--------------|-------|-----------|
| Nueva reserva | Admin | Email | Datos completos del cliente |
| Modificación PAX | Admin | Email | Cambio (viejo → nuevo) |
| Cancelación | Admin | Email | Datos de la reserva |
| Reserva (registrado) | Cliente | Email | HTML + archivo .ics |
| Reserva (invitado) | Restaurante | WhatsApp | Mensaje con todos los detalles |

## 🔐 Cuenta de Administrador

| Campo | Valor |
|-------|-------|
| Email | `tu.correo.com` |
| Acceso | Iniciar sesión con la cuenta que tu indiques tienes que modificarla tu mismo |

## 🛠️ Tecnologías

| Frontend | Backend | Base de Datos | Autenticación |
|----------|---------|---------------|---------------|
| React 18 | Node.js 18 | MongoDB | Passport.js |
| Tailwind CSS | Express | Mongoose | Google OAuth |
| Vite | Nodemailer | MongoDB Atlas | bcryptjs |
| Lucide Icons | - | - | express-session |

## 📦 Instalación local

### Requisitos
- Node.js 18+
- MongoDB (local o Atlas)
- Cuenta Google Cloud Console (para OAuth)
- Cuenta Gmail (para nodemailer)

📸 Capturas de pantalla
1. Landing Page - Hero
<img width="1920" height="921" alt="landing-hero" src="https://github.com/user-attachments/assets/1438faf6-a4fb-400d-80c3-b92834423205" />
2. Landing Page - Menú
<img width="1919" height="913" alt="landing-menu png" src="https://github.com/user-attachments/assets/ab138f59-f6ed-4067-b99a-be3b6ca79ba2" />

3. Formulario de Reserva
<img width="1919" height="919" alt="reserva-form png" src="https://github.com/user-attachments/assets/bb2443a4-c1a8-4f1e-a60d-a3613b5e3fd9" />

4. Ubicación y Horarios
<img width="1920" height="923" alt="ubicacion png" src="https://github.com/user-attachments/assets/4ef6d88e-69b0-4894-b205-15800ac1938b" />

5. Modal de Inicio de Sesión
<img width="402" height="517" alt="login-modal png" src="https://github.com/user-attachments/assets/fcd9d371-d373-4d12-9dd5-ad8e6b45c270" />

6. Perfil de Usuario
<img width="1920" height="922" alt="perfil-usuario png" src="https://github.com/user-attachments/assets/7bb8ae7f-43ad-40a8-9719-c4d809c88863" />

7. Dashboard Administrador
<img width="1918" height="924" alt="admin-dashboard png" src="https://github.com/user-attachments/assets/04db703e-d997-49fd-b40b-19bc73f10ba9" />

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/IgnacioRuizMcode/tenedor-libre-patagonia.git
cd tenedor-libre-patagonia

# 2. Backend
cd api-service
npm install
cp .env.example .env
# Editar .env con tus datos

# 3. Frontend
cd ../web-app
npm install

# 4. Ejecutar (dos terminales)
# Terminal 1 - Backend (api-service)
npm run dev

# Terminal 2 - Frontend (web-app)
npm run dev




