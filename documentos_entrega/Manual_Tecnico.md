# Manual Técnico - GeoDesafio

Este documento detalla la arquitectura, tecnologías y el modelo de datos del proyecto GeoDesafio.

## 🛠️ Tecnologías Utilizadas

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Lenguaje**: TypeScript / React 19
- **Estilos**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Iconografía**: Lucide React
- **Base de Datos**: Turso (libSQL / SQLite)
- **Autenticación**: Gestión de sesiones basada en cookies y contraseñas cifradas con `bcryptjs`.

## 🏗️ Arquitectura del Sistema

El proyecto sigue el patrón de arquitectura de Next.js con una clara separación entre el Cliente y el Servidor.

### Server Actions
Se utilizan **Server Actions** (`lib/actions.ts`) para manejar toda la lógica de negocio, interactuar con la base de datos y gestionar la autenticación. Esto elimina la necesidad de crear una API REST intermedia y reduce la latencia.

### Flujo de Datos
1. El componente de Cliente (ej. `DesafioForm.tsx`) envía datos mediante una acción del servidor.
2. El servidor valida la sesión del usuario y la integridad de los datos.
3. Se ejecuta la consulta SQL en Turso.
4. El servidor devuelve la respuesta o redirige al usuario mediante `next/navigation`.

## 🗄️ Modelo de Base de Datos

La base de datos es relacional y se compone de las siguientes tablas principales:

### 1. `usuarios`
Almacena la información de identidad y permisos.
- `id` (PRIMARY KEY)
- `email` (UNIQUE)
- `nombre`
- `password` (Hashed)
- `rol` ('estudiante' o 'profesor')

### 2. `desafios`
Define los parámetros de cada quiz geográfico.
- `id` (PRIMARY KEY)
- `titulo`
- `descripcion`
- `continente` (Opcional)
- `num_preguntas`
- `vidas`
- `profesor_id` (FOREIGN KEY $\rightarrow$ usuarios.id)
- `activo` (Booleano/Entero)

### 3. `clasificacion`
Registra los resultados obtenidos por los estudiantes.
- `id` (PRIMARY KEY)
- `usuario_id` (FOREIGN KEY $\rightarrow$ usuarios.id)
- `desafio_id` (FOREIGN KEY $\rightarrow$ desafios.id)
- `nombre_usuario` (Denormalizado para rapidez en rankings)
- `puntaje`
- `creado_en` (Timestamp)

## 🚀 Despliegue y Variables de Entorno

El proyecto está optimizado para despliegue en Vercel con Turso como base de datos externa.

### Variables de Entorno Necesarias (`.env`)
- `TURSO_DATABASE_URL`: URL de conexión a la base de datos de Turso.
- `TURSO_AUTH_TOKEN`: Token de autenticación para acceder a la base de datos.
- `SESSION_SECRET`: Clave secreta para el cifrado de cookies de sesión.

### Instrucciones de Despliegue
1. Clonar el repositorio.
2. Instalar dependencias: `npm install`.
3. Configurar las variables de entorno en el panel de Vercel.
4. Ejecutar `npm run build` y desplegar.
