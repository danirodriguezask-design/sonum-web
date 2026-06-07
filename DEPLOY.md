# SONUM — Guía de Deploy paso a paso

Sin conocimientos técnicos, seguí estos pasos en orden. En ~30 minutos tenés la web live.

---

## PASO 1: Crear cuenta en GitHub

1. Entrá a https://github.com
2. Clic en "Sign up" — registrate con tu email
3. Verificá el email

---

## PASO 2: Subir el proyecto a GitHub

1. En GitHub, clic en el **"+"** (arriba a la derecha) → **"New repository"**
2. Nombre: `sonum-web`
3. Privado o público — como quieras
4. Clic en **"Create repository"**
5. En la página que aparece, clic en **"uploading an existing file"**
6. Arrastrá la carpeta `sonum-web` completa (la que está en tu carpeta Claude)
7. Clic en **"Commit changes"**

---

## PASO 3: Crear base de datos en Supabase

1. Entrá a https://supabase.com → **"Start your project"**
2. Registrate con Google o email
3. Clic en **"New project"**
   - Nombre: `sonum`
   - Contraseña: inventate una fuerte (guardala)
   - Región: **South America (São Paulo)** — es la más cercana
4. Esperá ~2 minutos a que inicie
5. En el menú izquierdo → **"SQL Editor"**
6. Clic en **"New query"**
7. Copiá TODO el contenido del archivo `supabase/schema.sql` y pegalo
8. Clic en **"Run"** ▶️
9. Ahora vas a **Settings → API**:
   - Copiá el **"Project URL"** (algo como `https://abcdef.supabase.co`)
   - Copiá el **"anon public"** key
   - Copiá el **"service_role"** key (clic en "Reveal")

### Cargar los ticket types del evento

Después de ejecutar el schema, en el SQL Editor ejecutá esto (reemplazando el ID):

1. Primero ejecutá para ver el ID del evento:
```sql
SELECT id, artist FROM events;
```
2. Copiá el `id` que aparece (algo como `550e8400-e29b-41d4-a716-446655440000`)
3. Ejecutá esto con ese ID:
```sql
INSERT INTO ticket_types (event_id, name, price, quantity_total) VALUES
  ('TU-ID-ACA', 'General',   8000,  200),
  ('TU-ID-ACA', 'VIP',       15000, 80),
  ('TU-ID-ACA', 'Backstage', 25000, 20),
  ('TU-ID-ACA', 'Mesa',      0,     10);
```

---

## PASO 4: Configurar Mercado Pago

1. Entrá a https://www.mercadopago.com.ar/developers/panel
2. Clic en **"Crear aplicación"**
   - Nombre: SONUM
   - Tipo: CheckoutPro
3. En tu aplicación → **"Credenciales"** → **"Producción"**
4. Copiá el **"Access Token"** (empieza con `APP_USR-...`)

> ⚠️ Usá las credenciales de **producción** para cobros reales.
> Usá las de **sandbox** para hacer pruebas primero.

---

## PASO 5: Configurar email (Gmail)

Para enviar los tickets QR por email:

1. En tu Gmail → clic en tu foto → **"Gestionar tu cuenta de Google"**
2. Buscá **"Contraseñas de aplicaciones"** (puede estar en Seguridad)
3. Creá una contraseña para "Otra aplicación" → nombrala "SONUM"
4. Copiá los 16 caracteres que aparecen

> Si no encontrás "Contraseñas de aplicaciones", activá la verificación en 2 pasos primero.

---

## PASO 6: Deploy en Vercel

1. Entrá a https://vercel.com → **"Sign up with GitHub"**
2. Clic en **"Add New Project"**
3. Importá tu repositorio `sonum-web`
4. Antes de deployar, expandí **"Environment Variables"** y agregá:

| Nombre | Valor |
|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | La URL de Supabase del Paso 3 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La anon key del Paso 3 |
| `SUPABASE_SERVICE_ROLE_KEY` | La service_role key del Paso 3 |
| `MERCADOPAGO_ACCESS_TOKEN` | Tu access token del Paso 4 |
| `NEXT_PUBLIC_APP_URL` | Dejalo vacío por ahora |
| `EMAIL_FROM` | Tu email de Gmail |
| `EMAIL_PASSWORD` | La contraseña de app del Paso 5 |
| `ADMIN_SECRET` | Inventate una clave (ej: `sonum2024seguro`) |

5. Clic en **"Deploy"** — esperá ~2-3 minutos

6. Cuando termine, Vercel te da una URL como `sonum-web.vercel.app`
7. Volvé a las Environment Variables y actualizá `NEXT_PUBLIC_APP_URL` con esa URL
8. Clic en **"Redeploy"**

---

## PASO 7: Configurar webhook de Mercado Pago

Para que MP avise a tu web cuando alguien paga:

1. En el panel de MP → tu app → **"Webhooks"**
2. Modo producción → **"Configurar"**
3. URL: `https://TU-URL.vercel.app/api/webhook`
4. Evento: **"Payments"** ✓
5. Guardar

---

## ✅ ¡Listo!

Tu web está en:
- **Web pública**: `https://sonum-web.vercel.app`
- **Panel admin**: `https://sonum-web.vercel.app/admin`
- **Panel RR.PP.**: `https://sonum-web.vercel.app/rrpp/CODIGO-DEL-RRPP`

### Cómo crear un RR.PP.:
1. Entrá al panel admin con tu clave
2. Tab "RR.PP." → "Nuevo RR.PP."
3. Nombre, código (ej: `martin-g`) y comisión
4. Copiá su link y mandáselo

### Link de un RR.PP.:
`https://sonum-web.vercel.app/eventos/louden-19-junio-2026?rrpp=martin-g`

---

## PREGUNTAS FRECUENTES

**¿Cuándo me llega la plata?** Con Checkout Pro de MP, el dinero queda en tu cuenta MP. El tiempo de acreditación depende de tu nivel de cuenta (generalmente 48hs para tarjetas).

**¿Cómo cambio los precios?** En Supabase → Table Editor → ticket_types → editás el campo `price`.

**¿Cómo agrego un nuevo evento?** Igual que los ticket types, desde Supabase Table Editor. También podemos agregar un formulario de creación de eventos en el admin si querés.

**¿Cómo escaneo los QR en la puerta?** Desde cualquier celular, entrá a `/admin` y usá la cámara para escanear. (Esta funcionalidad la agregamos en la próxima versión.)

---

*Cualquier duda, avisame y lo resolvemos juntos.*
