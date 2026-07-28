// BismiLLAH Ar-Rahman Ar-Roheem.
// Public entrypoint for the GoShop email module.
// Exports: getTransport, sendEmail, emitEmailEvent, renderTemplate, listTemplateNames.

export { getTransport, verifyTransport, getAuthMode, _resetTransportCache, nodemailer } from './transport';
export { sendEmail, sendEmailIndividually, type SendEmailInput, type SendEmailResult } from './send';
export {
  emitEmailEvent,
  emitEmailEventSafe,
  type EmailEventName,
  type EmitEmailEventInput,
  type EmitEmailEventResult,
} from './events';
export {
  renderTemplate,
  listTemplateNames,
  getTemplateDef,
  TEMPLATES,
  type TemplateDef,
  type TemplateRenderInput,
  type TemplateRenderOutput,
} from './templates';
export { renderLayout, esc, formatMoney, BRAND } from './templates';
