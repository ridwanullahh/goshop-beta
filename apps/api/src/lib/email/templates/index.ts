// BismiLLAH Ar-Rahman Ar-Roheem.
// Public entrypoint for the email templates module.
// Exports renderTemplate(name, data) -> branded HTML + plain text, plus metadata.

export {
  renderTemplateByName as renderTemplate,
  listTemplateNames,
  getTemplateDef,
  TEMPLATES,
} from './definitions';
export type {
  TemplateDef,
  TemplateRenderInput,
  TemplateRenderOutput,
} from './definitions';
export { renderLayout, esc, formatMoney, BRAND } from './layout';
