# 🛠 Best Practices: AI Agent (NestJS + LangChain)

## 🏗 Arquitectura y Diseño
- **Modularidad Total:** Cada dominio (Chat, Productos, IA, Inventario) debe ser un módulo independiente.
- **DIP (Dependency Inversion):** Depende de abstracciones, no de implementaciones. Usa `Interfaces` para los servicios de LLM o proveedores de WhatsApp.
- **Pattern Matching / Strategy:** Úsalo para manejar los diferentes tipos de mensajes (texto, imágenes, audios) que envía el cliente.

## 🤖 IA & LangChain
- **Prompt Decoupling:** Nunca hardcodees prompts en los servicios. Usa archivos `.yaml` o constantes externas.
- **Memory Management:** Implementa `BufferWindowMemory` o persiste la memoria en Redis para que el agente no "olvide" el contexto en sesiones largas.
- **Output Parsers:** Forzar siempre respuestas estructuradas (JSON) cuando el agente necesite realizar acciones (ej: agregar al carrito).

## 🚀 NestJS Específico
- **DTOs & Validation:** Usa `class-validator` para limpiar la entrada de los webhooks de WhatsApp.
- **Interceptors:** Crea un interceptor de logs para trackear los tokens usados y el tiempo de respuesta del LLM.
- **Custom Decorators:** Crea decoradores para extraer fácilmente el `senderId` o `phoneNumber` de las peticiones.

## 🔐 Seguridad y Resiliencia
- **Rate Limiting:** Implementa límites para evitar ataques que consuman tu cuota de API de OpenAI/Gemini.
- **Circuit Breaker:** Si el servicio de la IA falla, ten un mensaje de contingencia preparado.