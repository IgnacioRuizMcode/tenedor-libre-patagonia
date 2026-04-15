const Reservation = require('../models/Reservation');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Función para formatear fechas para Calendarios (formato ISO sin signos)
const formatCalendarDate = (date, time) => {
  const [y, m, d] = date.split('-');
  const [h, min] = time.split(':');
  
  const startStr = `${y}${m}${d}T${h}${min}00`;
  
  // Asumimos 2 horas de estadía en el buffet
  let endH = parseInt(h) + 2;
  const endStr = `${y}${m}${d}T${String(endH).padStart(2, '0')}${min}00`;
  
  return { startStr, endStr };
};

// Función auxiliar para enviar correo al admin
const sendAdminNotification = async (subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"Tenedor Libre Patagonia" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || 'tu.correo.com',
      subject: subject,
      html: htmlContent
    });
    console.log('✅ Notificación enviada al admin');
  } catch (error) {
    console.error('❌ Error al enviar notificación al admin:', error);
  }
};

exports.createReservation = async (req, res) => {
  try {
    const { email, date, time, customerName, guestCount } = req.body;
    
    // --- Validaciones de Horario ---
    const fechaReserva = new Date(date + 'T00:00:00');
    const diaSemana = fechaReserva.getDay(); 
    const [hora, minutos] = time.split(':').map(Number);
    const horaDecimal = hora + minutos / 60;

    const diasPermitidos = [0, 4, 5, 6]; 
    if (!diasPermitidos.includes(diaSemana)) return res.status(400).json({ message: 'El Buffet solo atiende de Jueves a Domingo.' });

    let horarioValido = false;
    if (diaSemana === 4 || diaSemana === 0) {
      if (horaDecimal >= 13 && horaDecimal <= 18) horarioValido = true;
    } else if (diaSemana === 5 || diaSemana === 6) {
      if (horaDecimal >= 13 && horaDecimal <= 22) horarioValido = true;
    }

    if (!horarioValido) return res.status(400).json({ message: 'Horario no válido para este día.' });

    const existingRes = await Reservation.findOne({ email, date, time });
    if (existingRes) return res.status(400).json({ message: 'Ya tienes una reserva para este bloque.' });

    // Guardar Reserva
    const newRes = new Reservation(req.body);
    await newRes.save();

    // Notificar al admin sobre nueva reserva
    await sendAdminNotification(
      '🆕 NUEVA RESERVA - Tenedor Libre',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">📋 Nueva Reserva Creada</h2>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>👤 Cliente:</strong> ${customerName}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>📅 Fecha:</strong> ${date}</p>
            <p><strong>🕒 Hora:</strong> ${time} hrs</p>
            <p><strong>👥 Personas:</strong> ${guestCount}</p>
          </div>
          <a href="http://localhost:5173/admin" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Dashboard</a>
        </div>
      `
    );

    res.status(201).json({ message: '✅ Reserva procesada con éxito.', data: newRes });

    // --- ENVIAR CORREO PREMIUM (GOOGLE & APPLE) ---
    if (req.user && req.user.googleId) {
      const { startStr, endStr } = formatCalendarDate(date, time);

      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Buffet+Premium+-+Brasas+El+Tepual&dates=${startStr}/${endStr}&details=Mesa+reservada+para+${guestCount}+personas+a+nombre+de+${customerName}.&location=Camino+El+Tepual+Km+3.5,+Puerto+Montt`;

      const icsContent = 
        `BEGIN:VCALENDAR\n` +
        `VERSION:2.0\n` +
        `PRODID:-//Patagonia Buffet//Reservas//ES\n` +
        `METHOD:PUBLISH\n` +
        `BEGIN:VEVENT\n` +
        `SUMMARY:Buffet Premium - Patagonia Buffet\n` +
        `DTSTART:${startStr}\n` +
        `DTEND:${endStr}\n` +
        `LOCATION:Camino El Tepual Km 3.5\\, Puerto Montt\n` +
        `DESCRIPTION:Mesa reservada para ${guestCount} personas a nombre de ${customerName}.\n` +
        `STATUS:CONFIRMED\n` +
        `END:VEVENT\n` +
        `END:VCALENDAR`;

      const mailOptions = {
        from: `"Patagonia Buffet" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Tu reserva está confirmada - Patagonia Buffet',
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            
            <div style="background-color: #050505; padding: 40px 20px; text-align: center;">
              <h1 style="color: #b91c1c; margin: 0; font-size: 26px; font-style: italic; text-transform: uppercase; letter-spacing: 3px;">Brasas El Tepual</h1>
              <p style="color: #888888; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Buffet Premium</p>
            </div>

            <div style="padding: 40px 30px;">
              <h2 style="color: #111111; font-size: 22px; margin-top: 0; text-align: center;">¡Tu mesa está reservada!</h2>
              <p style="color: #555555; font-size: 15px; line-height: 1.6; text-align: center;">Hola <b>${customerName}</b>, tu experiencia premium ha sido confirmada. Aquí tienes los detalles de tu visita:</p>
              
              <div style="background-color: #fafafa; border-left: 4px solid #b91c1c; padding: 25px; margin: 35px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 8px 0; color: #222; font-size: 15px;">📅 <b style="color: #000; margin-left: 10px;">Fecha:</b> <span style="float: right;">${date}</span></p>
                <p style="margin: 8px 0; color: #222; font-size: 15px;">🕒 <b style="color: #000; margin-left: 10px;">Hora:</b> <span style="float: right;">${time} hrs</span></p>
                <p style="margin: 8px 0; color: #222; font-size: 15px;">👥 <b style="color: #000; margin-left: 10px;">Comensales:</b> <span style="float: right;">${guestCount} personas</span></p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${googleUrl}" target="_blank" style="background-color: #111111; color: #ffffff; padding: 16px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
                  📅 Agendar en Google
                </a>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 1px solid #eeeeee;">
                <p style="font-size: 13px; color: #111111; margin-bottom: 5px;"><b>¿Usas iPhone o Apple Calendar?</b></p>
                <p style="font-size: 12px; color: #888888; margin-top: 0; line-height: 1.5;">Haz clic en el archivo <b>reserva-brasas.ics</b> adjunto al final de este correo para guardarlo directamente en tu dispositivo.</p>
              </div>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="font-size: 11px; color: #999999; margin: 0;">📍 Camino El Tepual Km 3.5, Puerto Montt</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: 'reserva-patagonia.ics',
            content: icsContent,
            contentType: 'text/calendar; charset=utf-8; method=PUBLISH'
          }
        ]
      };

      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    if (!res.headersSent) res.status(400).json({ message: 'Error', error: error.message });
  }
};

exports.getUserReservations = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'No has iniciado sesión' });
    const userReservations = await Reservation.find({ email: req.user.email }).sort({ date: -1 });
    res.json(userReservations);
  } catch (error) { res.status(500).json({ message: 'Error', error: error.message }); }
};

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ date: -1 });
    res.json({ reservations });
  } catch (error) { res.status(500).json({ message: 'Error', error: error.message }); }
};

exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    
    await Reservation.findByIdAndDelete(req.params.id);
    
    // Notificar al admin sobre la cancelación (mejorada)
    await sendAdminNotification(
      '❌ RESERVA CANCELADA - Tenedor Libre',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">🗑️ Reserva Cancelada</h2>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>👤 Cliente:</strong> ${reservation.customerName}</p>
            <p><strong>📧 Email:</strong> ${reservation.email}</p>
            <p><strong>📅 Fecha:</strong> ${reservation.date}</p>
            <p><strong>🕒 Hora:</strong> ${reservation.time} hrs</p>
            <p><strong>👥 Personas:</strong> ${reservation.guestCount}</p>
          </div>
          <a href="http://localhost:5173/admin" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Dashboard</a>
        </div>
      `
    );
    
    res.json({ message: 'Reserva cancelada.' });
  } catch (error) { 
    res.status(500).json({ message: 'Error', error: error.message }); 
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const oldRes = await Reservation.findById(req.params.id);
    
    if (!oldRes) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    
    const updatedRes = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (oldRes.guestCount !== updatedRes.guestCount) {
      // Notificar al admin sobre el cambio de PAX (mejorada)
      await sendAdminNotification(
        '⚠️ CAMBIO DE PAX - Tenedor Libre',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">🔄 Modificación de Cantidad</h2>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>👤 Cliente:</strong> ${updatedRes.customerName}</p>
              <p><strong>📧 Email:</strong> ${updatedRes.email}</p>
              <p><strong>📅 Fecha:</strong> ${updatedRes.date}</p>
              <p><strong>🕒 Hora:</strong> ${updatedRes.time} hrs</p>
              <p><strong>👥 Cambio:</strong> <span style="color: #ef4444; text-decoration: line-through;">${oldRes.guestCount}</span> → <span style="color: #10b981; font-weight: bold;">${updatedRes.guestCount}</span> personas</p>
            </div>
            <a href="http://localhost:5173/admin" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Dashboard</a>
          </div>
        `
      );
    }
    
    res.json({ message: 'Actualizada', data: updatedRes });
  } catch (error) { 
    res.status(500).json({ message: 'Error', error: error.message }); 
  }
};

// NUEVA FUNCIÓN: Actualizar solo el número de personas (para el perfil de usuario)
exports.updatePaxOnly = async (req, res) => {
  try {
    const { id } = req.params;
    const { guestCount } = req.body;
    
    const oldRes = await Reservation.findById(id);
    
    if (!oldRes) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    
    const updatedRes = await Reservation.findByIdAndUpdate(
      id, 
      { guestCount }, 
      { new: true }
    );
    
    // Notificar al admin sobre el cambio
    await sendAdminNotification(
      '⚠️ MODIFICACIÓN DE RESERVA - Tenedor Libre',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">🔄 Cantidad Modificada por el Usuario</h2>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>👤 Cliente:</strong> ${oldRes.customerName}</p>
            <p><strong>📧 Email:</strong> ${oldRes.email}</p>
            <p><strong>📅 Fecha:</strong> ${oldRes.date}</p>
            <p><strong>🕒 Hora:</strong> ${oldRes.time} hrs</p>
            <p><strong>👥 Cambio:</strong> <span style="color: #ef4444; text-decoration: line-through;">${oldRes.guestCount}</span> → <span style="color: #10b981; font-weight: bold;">${guestCount}</span> personas</p>
          </div>
          <p><strong>Motivo:</strong> El cliente modificó su reserva desde el panel de usuario.</p>
          <a href="http://localhost:5173/admin" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Dashboard</a>
        </div>
      `
    );
    
    res.json({ message: 'Cantidad actualizada correctamente', data: updatedRes });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar', error: error.message });
  }
};

// NUEVA FUNCIÓN: Cancelar reserva desde el perfil de usuario
exports.cancelReservationFromUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await Reservation.findById(id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    
    await Reservation.findByIdAndDelete(id);
    
    // Notificar al admin sobre la cancelación desde el perfil de usuario
    await sendAdminNotification(
      '❌ RESERVA CANCELADA POR EL USUARIO - Tenedor Libre',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">🗑️ Cancelación desde el Perfil de Usuario</h2>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>👤 Cliente:</strong> ${reservation.customerName}</p>
            <p><strong>📧 Email:</strong> ${reservation.email}</p>
            <p><strong>📅 Fecha:</strong> ${reservation.date}</p>
            <p><strong>🕒 Hora:</strong> ${reservation.time} hrs</p>
            <p><strong>👥 Personas:</strong> ${reservation.guestCount}</p>
          </div>
          <p><strong>Motivo:</strong> El cliente canceló su reserva voluntariamente desde el panel de usuario.</p>
          <a href="http://localhost:5173/admin" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Dashboard</a>
        </div>
      `
    );
    
    res.json({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar', error: error.message });
  }
};
