-- ============================================================================
-- seed.sql — services, document templates and clinic settings.
--
-- GENERATED from clinic-data.js and documents.js so the values cannot drift
-- from the build they came from. Run AFTER schema.sql.
-- Idempotent: re-running updates rather than duplicating.
-- ============================================================================

-- ------------------------------------------------------------- services ----
insert into public.services
  (slug, name, name_en, description, description_en, price_cents, minutes,
   category, requires_consult, consent_slug, sort_order)
values
  ('glp', 'Programa de Control de Peso', 'Weight Management Program', 'Programa supervisado · requiere consulta', 'Supervised program · consultation required', 32500, 20, 'programa', true, 'consent-glp', 0),
  ('hydra', 'Hidratación Revive', 'Revive Hydration', 'Hidratación IV y apoyo vitamínico', 'IV hydration and vitamin support', 16500, 45, 'iv', false, 'consent-iv', 1),
  ('myers', 'Inmunidad Myers', 'Myers Immunity', 'Vitamina C, magnesio, calcio y complejo B', 'Vitamin C, magnesium, calcium and B complex', 18500, 45, 'iv', false, 'consent-iv', 2),
  ('glow', 'Glutatión Glow', 'Glutathione Glow', 'Aplicación lenta de glutatión', 'Slow glutathione push', 21000, 30, 'iv', false, 'consent-iv', 3),
  ('nad', 'Infusión NAD+', 'NAD+ Infusion', 'Sesión de goteo lento', 'Slow drip session', 39500, 90, 'iv', false, 'consent-iv', 4),
  ('b12', 'Refuerzo de Energía B12', 'B12 Energy Boost', 'Visita rápida · 1 mL IM', 'Quick visit · 1 mL IM', 4500, 15, 'inyeccion', false, 'consent-treatment', 5),
  ('prp', 'Terapia PRP', 'PRP Therapy', 'Plasma rico en plaquetas · requiere evaluación', 'Platelet-rich plasma · evaluation required', 45000, 60, 'avanzado', true, 'consent-prp', 6)
on conflict (slug) do update set
  name = excluded.name, name_en = excluded.name_en,
  description = excluded.description, description_en = excluded.description_en,
  price_cents = excluded.price_cents, minutes = excluded.minutes,
  category = excluded.category, requires_consult = excluded.requires_consult,
  consent_slug = excluded.consent_slug, sort_order = excluded.sort_order;

-- ---------------------------------------------------- document templates ----
-- NOTE: these are DRAFTS, not attorney-reviewed. See AAWELLNESS-10.
insert into public.document_templates
  (slug, title, title_en, kind, body, requires_signature, sort_order)
values
  ('intake', 'Formulario de admisión', 'Intake form', 'form', 'Complete esta información antes de su primera visita.

DATOS DEL PACIENTE
Nombre completo, fecha de nacimiento, teléfono, correo electrónico y dirección postal.

CONTACTO DE EMERGENCIA
Nombre, parentesco y teléfono de la persona a contactar en caso de emergencia.

HISTORIAL MÉDICO
Indique condiciones actuales o pasadas, cirugías, hospitalizaciones y embarazos.

MEDICAMENTOS Y ALERGIAS
Liste todos los medicamentos, suplementos y vitaminas que toma actualmente, así como cualquier alergia a medicamentos, alimentos o látex.

AUTORIZACIÓN
Certifico que la información provista es correcta y completa según mi mejor conocimiento, y me comprometo a informar a la clínica de cualquier cambio.', true, 0),
  ('consent-treatment', 'Consentimiento general de tratamiento', 'General treatment consent', 'consent', 'Autorizo a A&A Healthcare Services LLC y a su personal cualificado a proveerme los servicios de bienestar que se me han explicado.

ENTIENDO QUE:
• Los servicios de bienestar no sustituyen la atención de mi médico primario.
• Se me ha explicado el propósito del servicio, sus beneficios esperados y sus alternativas, y he tenido la oportunidad de hacer preguntas.
• Ningún resultado ha sido garantizado.
• Puedo retirar este consentimiento en cualquier momento antes o durante el servicio.

RIESGOS COMUNES
Molestia leve, enrojecimiento o moretón en el área de aplicación, mareo pasajero y, con poca frecuencia, reacción alérgica.

Confirmo que he informado a la clínica de todas mis condiciones médicas, medicamentos y alergias.', true, 1),
  ('consent-iv', 'Consentimiento para terapia intravenosa', 'IV therapy consent', 'consent', 'Consiento a recibir terapia de hidratación y/o vitaminas por vía intravenosa (IV).

PROCEDIMIENTO
Se coloca un catéter pequeño en una vena, generalmente del brazo, para administrar líquidos y nutrientes durante la sesión.

RIESGOS
• Dolor, moretón, enrojecimiento o inflamación en el sitio de punción.
• Infiltración del líquido fuera de la vena.
• Infección en el sitio de punción (poco frecuente).
• Mareo, náusea o sabor metálico durante la infusión.
• Reacción alérgica a alguno de los componentes (poco frecuente).

CONFIRMO QUE HE INFORMADO SOBRE:
Enfermedad renal o cardiaca, embarazo o lactancia, alergias, y todos los medicamentos y suplementos que tomo.

Entiendo que debo avisar inmediatamente al personal si siento cualquier molestia durante la sesión.', true, 2),
  ('consent-glp', 'Consentimiento · Programa de Control de Peso', 'Weight management program consent', 'consent', 'Consiento a participar en el Programa de Control de Peso supervisado por la clínica.

SOBRE EL PROGRAMA
El programa puede incluir seguimiento de peso, orientación de alimentación e hidratación, y — cuando el proveedor lo determine apropiado y lo recete — medicamento para el control de peso, junto con visitas de seguimiento periódicas.

ENTIENDO QUE:
• La elegibilidad la determina el proveedor tras evaluación clínica.
• Los resultados varían de persona a persona y no se garantiza ninguna pérdida de peso.
• Debo asistir a las visitas de seguimiento acordadas.
• Debo informar de inmediato cualquier efecto secundario.

POSIBLES EFECTOS SECUNDARIOS
Náusea, vómito, diarrea o estreñimiento, dolor abdominal, reflujo, fatiga y disminución del apetito. Efectos menos frecuentes pero serios deben ser atendidos de inmediato.

NO DEBO PARTICIPAR SI:
Estoy embarazada, intentando quedar embarazada o lactando; o si tengo historial personal o familiar de ciertos tumores de tiroides o pancreatitis, sin evaluación previa.

He tenido la oportunidad de hacer preguntas y todas fueron contestadas.', true, 3),
  ('consent-prp', 'Consentimiento · Terapia PRP', 'PRP therapy consent', 'consent', 'Consiento a recibir terapia de plasma rico en plaquetas (PRP).

PROCEDIMIENTO
Se extrae una muestra de mi propia sangre, se procesa en una centrífuga para concentrar las plaquetas, y el plasma resultante se aplica en el área tratada.

RIESGOS
• Dolor, moretón o inflamación en el área de extracción y de aplicación.
• Infección (poco frecuente).
• Resultados variables; puede requerir más de una sesión.

ENTIENDO QUE este servicio requiere evaluación previa y que el proveedor puede determinar que no soy candidato/a.

He tenido la oportunidad de hacer preguntas y todas fueron contestadas.', true, 4),
  ('privacy', 'Aviso de privacidad (HIPAA)', 'Notice of privacy practices (HIPAA)', 'policy', 'Este aviso describe cómo se puede usar y divulgar su información de salud y cómo usted puede obtener acceso a ella.

USO DE SU INFORMACIÓN
Usamos su información de salud para proveer tratamiento, coordinar su cuidado, procesar pagos y para operaciones administrativas de la clínica.

SUS DERECHOS
• Solicitar copia de su expediente.
• Solicitar corrección de información incorrecta.
• Solicitar restricciones sobre cómo se usa su información.
• Recibir un listado de divulgaciones.
• Presentar una queja sin represalias.

NO compartimos su información con terceros para fines de mercadeo sin su autorización escrita.

Al aceptar, usted confirma que recibió y tuvo oportunidad de leer este aviso.', false, 5),
  ('financial', 'Política de pago y cancelación', 'Payment and cancellation policy', 'policy', 'PAGO
El pago se requiere al momento del servicio. Los pagos se procesan de forma segura a través de Clover. Aceptamos tarjetas de débito y crédito.

CANCELACIONES
Le pedimos avisar con al menos 24 horas de anticipación si necesita cancelar o reprogramar su cita, para poder ofrecer ese espacio a otro paciente.

AUSENCIAS
Las ausencias sin aviso pueden requerir prepago para futuras citas.

PAQUETES Y PROGRAMAS
Los paquetes y programas se pagan por adelantado y no son transferibles.

Al firmar confirmo que entiendo y acepto esta política.', true, 6),
  ('followup', 'Seguimiento mensual', 'Monthly follow-up', 'form', 'Cuéntenos cómo le ha ido este mes.

• ¿Cómo se ha sentido en general?
• ¿Ha notado algún efecto secundario? ¿Cuál?
• ¿Ha cambiado algún medicamento o suplemento?
• ¿Cómo ha estado su nivel de energía, sueño e hidratación?
• ¿Tiene alguna pregunta para su próxima visita?

Sus respuestas ayudan al proveedor a ajustar su plan.', false, 7)
on conflict (slug) do update set
  title = excluded.title, title_en = excluded.title_en, kind = excluded.kind,
  body = excluded.body, requires_signature = excluded.requires_signature,
  sort_order = excluded.sort_order,
  version = public.document_templates.version + 1;

-- ------------------------------------------------------ clinic settings ----
-- Contact fields stay NULL until confirmed from the website (AAWELLNESS-6).
insert into public.clinic_settings (id, legal_name, display_name, town)
values (true, 'A&A Healthcare Services LLC', 'A&A Wellness', 'Loíza, PR')
on conflict (id) do update set
  legal_name = excluded.legal_name,
  display_name = excluded.display_name,
  town = excluded.town;
