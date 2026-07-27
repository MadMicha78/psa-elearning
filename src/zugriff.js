// Zentrale Zugriffsregeln (ROT-Tenant): gesperrte Module je Abteilung.
// Generisch über abt gelöst — künftige Praktikanten sind automatisch erfasst.
export const GESPERRTE_MODULE = {
  Praktikant: ['m1'], // m1 = Arbeits- und Betriebsanweisungen
}

export const gesperrteModulIds = (mitarbeiter) => GESPERRTE_MODULE[mitarbeiter?.abt] || []

export const istModulGesperrt = (mitarbeiter, modulId) => gesperrteModulIds(mitarbeiter).includes(modulId)
