// backend/src/services/emailService.js
import { Resend } from "resend";

// Inicializamos Resend con la clave que guardamos en .env
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un email de notificación de nuevo pedido al administrador.
 * @param {Object} order - El objeto del pedido recién creado.
 * @param {string} adminEmail - El correo del administrador.
 */
export const sendNewOrderEmail = async (order, adminEmail) => {
  // Construimos el cuerpo del email como HTML
  const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #e85d04;">📦 ¡Un cliente acaba de realizar un pedido!</h2>
            <p>Ya puedes gestionarlo desde el panel de administración.</p>
            <hr />
            <p><strong>Pedido ID:</strong> #${order.id}</p>
            <p><strong>Cliente:</strong> ${order.customerName}</p>
            <p><strong>Email:</strong> ${order.customerEmail}</p>
            <p><strong>Total:</strong> $${order.total}</p>
            <hr />
            <a href="${process.env.ADMIN_URL}/orders/${order.id}"
               style="background-color: #e85d04; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
                Ver pedido en el panel
            </a>
            <p style="margin-top: 20px;">Saludos,<br/>El equipo de DeniaStyle</p>
        </div>
    `;

  // Configuramos los parámetros del correo usando la documentación de Resend[reference:1]
  const emailData = {
    from: "DeniaStyle <onboarding@resend.dev>", // <-- Cambia esto por tu correo verificado
    to: [adminEmail],
    subject: `✨ ¡Nuevo pedido #${order.id} en DeniaStyle! ✨`,
    html: emailHtml,
  };

  try {
    const { data, error } = await resend.emails.send(emailData);
    if (error) {
      console.error("Error al enviar el correo:", error);
    } else {
      console.log("Correo enviado exitosamente:", data);
    }
  } catch (error) {
    console.error("Error al intentar enviar el correo:", error);
  }
};
