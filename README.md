# 🍽️ Tenedor Libre Patagonia

> Sistema de reservas para buffet premium en Puerto Montt, Chile

<img width="1920" height="921" alt="landing-hero" src="https://github.com/user-attachments/assets/1438faf6-a4fb-400d-80c3-b92834423205" />

## 📋 Tabla de contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Capturas de pantalla](#-capturas-de-pantalla)
- [Autor](#-autor)

## ✨ Características

| Módulo | Funcionalidades |
|--------|-----------------|
| **Landing Page** | Vista del buffet, menú completo, ubicación, horarios, precios |
| **Reservas** | Sin necesidad de registro, confirmación por WhatsApp, validación de fechas/horarios |
| **Autenticación** | Google OAuth + Email/Password, registro con email, sesión persistente |
| **Perfil Usuario** | Ver reservas, modificar cantidad de personas, cancelar reservas, agendar en Google Calendar |
| **Admin Dashboard** | Estadísticas en tiempo real, filtrar por fecha/cliente/estado, exportar CSV, modificar PAX, cambiar estado |
| **Notificaciones** | Correo de confirmación al cliente (con archivo .ics), correo al admin al crear/modificar/cancelar reserva |

> 💡 **Importante:** Los usuarios invitados (sin registro) reciben confirmación por WhatsApp directamente al número del restaurante. Los usuarios registrados con Google reciben un correo con archivo .ics para agregar automáticamente la reserva a su calendario.

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
