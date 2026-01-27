# Documentación Multi-Cuenta: Agente WhatsApp

Se ha implementado una arquitectura multi-inquilino (multi-tenant) que permite gestionar múltiples cuentas de WhatsApp en una sola instancia. Cada cuenta tiene sus propios tokens, prompts y catálogo de productos.

## 1. Flujo de Funcionamiento

1. **Recepción de Webhook**: La Meta API envía un mensaje al endpoint `/whatsapp/webhook`.
2. **Identificación de Cuenta**: El sistema extrae el `phone_number_id` del payload y busca la configuración correspondiente en la colección `WhatsAppConfig`.
3. **Carga de Contexto**:
   - Se carga el **System Prompt** configurado para esa cuenta.
   - Se carga el **Historial de Chat** específico de esa combinación (Usuario + Cuenta WA).
   - Las herramientas de AI (consultar catálogo, stock, etc.) se filtran automáticamente usando el `whatsappConfigId`.
4. **Respuesta**: El agente procesa la consulta y responde usando los tokens de acceso específicos de esa cuenta de WhatsApp.

---

## 2. Endpoints de Configuración (`WhatsAppConfig`)

### Crear Cuenta
`POST /whatsapp-configs`
```json
{
  "name": "Zimnol Perú",
  "phoneNumber": "51987654321",
  "phoneNumberId": "123456789",
  "verifyToken": "mi_token_verificacion",
  "accessToken": "EAAB...",
  "apiVersion": "v17.0",
  "systemPrompt": "Eres un asistente de moda...",
  "welcomeMessage": "¡Hola! Bienvenido a...",
  "welcomeImages": ["url1", "url2"]
}
```

### Listar Cuentas
`GET /whatsapp-configs`

### Obtener por ID de Teléfono
`GET /whatsapp-configs/:phoneNumberId`

### Actualizar Cuenta
`PUT /whatsapp-configs/:id`

### Eliminar Cuenta
`DELETE /whatsapp-configs/:id`

---

## 3. Endpoints de WhatsApp (Webhook)

### Verificación (Configuración en Meta)
`GET /whatsapp/webhook`
- Valida el `hub.verify_token` contra cualquiera de los tokens registrados en las configuraciones activas.

### Recepción de Mensajes
`POST /whatsapp/webhook`
- Procesa mensajes entrantes. Ahora requiere que el `phone_number_id` esté registrado.

---

## 4. Cambios en la Base de Datos (Esquema)

### WhatsAppConfig [Nueva]
- Almacena toda la metadata de la cuenta de Meta.

### Product [Modificado]
- Ahora incluye `whatsappConfigId`. Solo los productos vinculados a la cuenta que recibe el mensaje son visibles para el agente de esa cuenta.

### ChatHistory, Cart, Order [Modificados]
- Todos incluyen `whatsappConfigId`. El historial y el carrito son únicos por cada cuenta de WhatsApp. Un usuario puede tener carritos distintos si escribe a dos números diferentes gestionados por el mismo sistema.

---

## 5. Seed de Datos

Al iniciar la aplicación, el `SeedService` ahora:
1. Verifica si existe una configuración por defecto utilizando las variables de entorno (`WHATSAPP_PHONE_NUMBER`, etc.).
2. Si no existe, la crea.
3. Inserta los productos iniciales vinculándolos a esa configuración específica.
