# Planificación del Desarrollo - GeoDesafio

El desarrollo de GeoDesafio se dividió en tres fases estratégicas para asegurar la escalabilidad y la persistencia de los datos.

## 🗓️ Fase 1: Análisis y Diseño de Base de Datos Relacional
En esta etapa inicial, el enfoque estuvo en la definición de la estructura de datos necesaria para soportar el sistema de usuarios, la gestión de desafíos y la tabla de posiciones.

- **Definición de Entidades**: Se diseñaron las tablas `usuarios`, `desafios` y `clasificacion`.
- **Relacionamiento**: Se establecieron las relaciones 1:N entre profesores y desafíos, y N:M entre usuarios y desafíos a través de la tabla de clasificación.
- **Elección de SQLite**: Inicialmente se optó por SQLite por su simplicidad y velocidad de desarrollo local.

## 🗓️ Fase 2: Desarrollo del Sistema Interactivo e Integración de API
Esta fase se centró en la creación de la experiencia de usuario y la lógica de juego.

- **Interfaz de Usuario**: Implementación de pantallas de registro, lobby y la mecánica de juego utilizando React y Tailwind CSS.
- **Integración REST Countries**: Para generar las preguntas de geografía de forma dinámica, se integró la API de `restcountries.com`.
- **Caché de Datos**: Para evitar peticiones redundantes a la API externa y mejorar la velocidad de carga, se implementó un sistema de caché simple para los datos de los países.
- **Sincronización Cliente-Servidor**: Uso de Server Actions para procesar el guardado de puntajes y la gestión de desafíos del profesor.

## 🗓️ Fase 3: Despliegue y Persistencia (Migración a Turso)
Durante el proceso de despliegue, se identificó un cuello de botella crítico relacionado con el almacenamiento.

- **El Problema de Vercel**: Al desplegar en Vercel, se observó que los servidores son efímeros. Esto significa que cualquier archivo SQLite local se borra cada vez que el servidor se reinicia o se despliega una nueva versión, haciendo que se pierdan todos los usuarios y puntajes.
- **La Solución**: Para resolver la volatilidad de los datos, se migró la base de datos local de SQLite a **Turso**. 
- **Implementación de libSQL**: Turso proporciona una base de datos SQLite compatible con el protocolo libSQL que reside en la nube, permitiendo que los datos persistan independientemente del ciclo de vida del servidor de Vercel.
- **Resultado Final**: El sistema ahora mantiene la integridad de los datos en tiempo real, permitiendo rankings globales y persistencia total de las cuentas de usuario.
