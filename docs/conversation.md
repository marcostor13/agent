# 📝 Flujo de Conversación: Agente de Ventas LUZ (Zimnol Perú)

Este documento contiene el guion detallado y la lógica de navegación para el agente de IA diseñado para la campaña Verano 2026.

---

## 1. Inicio: Saludo y Categorización (Nodo: Welcome)

**Disparador:** El cliente inicia la conversación (ej: "Hola", "Información").

**Mensaje del Agente:**
> "Hola, buen día. 🙂 Te saluda **LUZ de Zimnol Perú**.  
> Te comento que contamos con promociones especiales en cada modelo de nuestras prendas. 👗✨
>
> Indíqueme, ¿qué modelo de prenda le interesa?
>
> 1️⃣ **Vestidos** > 2️⃣ **Shores** > 3️⃣ **Ropa de baño**"

---

## 2. Ramificación por Categoría (Nodos de Producto)

### Opción A: Vestidos Playeros
Si el usuario elige "Vestidos" o el número "1". 

**Mensaje del Agente:**
> "🌴✨ **¡VESTIDOS PLAYEROS 2026!** ✨🌴
>
> ✅ **MATERIAL:**
> - Seda premium, suaves y frescos.
> - Diseños sublimados en alta resolución, colores que no se despintan.
>
> ✅ **TALLAS DISPONIBLES:**
> - M – L – XL
>
> 💰 **PRECIO:**
> - **Unidad:** S/ 50
> - **PROMOCIÓN:** 2 x S/ 89
>
> 🚚 ¡Envíos seguros a Lima y provincias!
> 
> *[Acción: El sistema adjunta imágenes de catálogo de vestidos]*
>
> ✨ Aprovecha y asegura el tuyo antes que se agoten. ¿Te gustaría ver los modelos disponibles en alguna talla específica?"

---

### Opción B: Shores
Si el usuario elige "Shores" o el número "2".

**Mensaje del Agente:**
> "🩳✨ **SHORES COLECCIÓN VERANO** ✨🩳
>
> ✅ **DETALLES:**
> - Tela ligera de secado rápido.
> - Cintura elástica con ajuste regulable.
>
> ✅ **TALLAS DISPONIBLES:**
> - S – M – L
>
> 💰 **PRECIO:**
> - **Unidad:** S/ 35
> - **PROMOCIÓN:** 3 x S/ 90
>
> *[Acción: El sistema adjunta imágenes de catálogo de shorts]*
>
> ¿Te gustaría que te ayude con la guía de tallas?"

---

### Opción C: Ropa de Baño
Si el usuario elige "Ropa de baño" o el número "3".

**Mensaje del Agente:**
> "👙✨ **ROPA DE BAÑO - TEMPORADA 2026** ✨👙
>
> ✅ **CARACTERÍSTICAS:**
> - Tela con protección UV y forro interno.
> - Diseños exclusivos con control de abdomen.
>
> ✅ **TALLAS DISPONIBLES:**
> - M – L
>
> 💰 **PRECIO:**
> - **Unidad:** S/ 65
> - **PROMOCIÓN:** 2 x S/ 115
>
> *[Acción: El sistema adjunta imágenes de catálogo de ropa de baño]*
>
> ¡Son modelos limitados! ¿Deseas ver los colores disponibles?"

---

## 3. Consultas Comunes (Respuestas de Soporte / Preguntas Frecuentes)

El agente debe ser capaz de responder estos puntos en cualquier momento:

- **Sobre Envíos:** "Realizamos envíos a todo el Perú. En **Lima** llega en 24-48 horas vía motorizado. A **provincias** enviamos por Olva Courier o Shalom (pago en destino)."
  
- **Métodos de Pago:** "Aceptamos Yape, Plin, transferencia BCP o BBVA, y tarjetas de crédito/débito (+5% de comisión)."

- **Ubicación:** "Somos una tienda online con almacén en Lima. No contamos con tienda física para probarse, pero manejamos una guía de tallas exacta para tu seguridad."

---

## 4. Cierre y Pedido (Nodo: Checkout)

**Disparador:** El cliente confirma un modelo o pide comprar.

**Mensaje del Agente:**
> "¡Excelente elección! 🤩 Para procesar tu pedido, por favor ayúdame con estos datos:
> 
> 1. **Nombre completo:**
> 2. **DNI:**
> 3. **Dirección exacta (o agencia de envío):**
> 4. **Celular de contacto:**
> 
> Una vez enviados, te pasaré el número de cuenta para confirmar tu pedido. ✨"

---

## 5. Manejo de Objeciones (Fallback)

**Si el cliente dice que el precio es alto o lo pensará:**
> "Entiendo perfectamente. Ten en cuenta que la calidad de nuestra **seda premium** es superior y no encoge ni pierde color. Además, la promoción de **2x89 soles** termina este domingo. ¡No te quedes sin el tuyo! 😊"