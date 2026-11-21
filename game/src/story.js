// story.js — DATA: 8 story jobs, character roster, dialogue lines. Pure data module.
export const CHARACTERS = {
  madre: { name: 'Madre Cande', role: 'Harbour fixer', skin: 0x8a5a3b, hair: 0x2b2b2b, shirt: 0xb03a4b, accent: '#e8b04b' },
  ruy: { name: 'Ruy Sanz', role: 'Wheelman', skin: 0xa06a42, hair: 0x1a1410, shirt: 0x2e6e6a, accent: '#3fa08c' },
  tito: { name: 'Tito Vale', role: 'Crew — getaway driver', skin: 0x6e4526, hair: 0x0d0d0d, shirt: 0xe07a3f, accent: '#e07a3f' },
  lucia: { name: 'Lucia Ferrer', role: 'Crew — signals', skin: 0xc98a5e, hair: 0x4a2c14, shirt: 0x5a4a8a, accent: '#8a7ad9' },
  regent: { name: 'The Regent', role: 'Port Authority chief', skin: 0xd9a878, hair: 0xd9d9d9, shirt: 0x22304a, accent: '#9fb4c7' },
  ghost: { name: 'The Ghost', role: 'Unknown passenger', skin: 0xb07a52, hair: 0x3a3a3a, shirt: 0x333333, accent: '#cccccc' },
};
export const JOBS = [
  { title: 'First Run for Madre', giver: 'madre', district: 'MALECÓN VIEJO', pay: 800, respect: 60, stages: [
    { type: 'goto', x: -120, z: 210, text: 'Meet Madre at the Malecón kiosk', line: ['madre', 'Small job, Ruy. Prove the wheels still love you.'] },
    { type: 'pickup', x: 60, z: 210, text: 'Pick up the sealed crate at the pier', line: ['madre', 'Crate first. Questions never.'] },
    { type: 'deliver', x: 150, z: 90, text: 'Deliver the crate to EL MERCADO', line: ['ruy', 'On my way. Keep the coffee warm.'] },
    { type: 'escape', x: 0, z: 0, text: 'Lose the CPA patrol', line: ['madre', 'Clean. That is how we stay invisible.'] } ] },
  { title: 'Cold Fish, Hot Dock', giver: 'madre', district: 'EL PUERTO', pay: 1400, respect: 90, stages: [
    { type: 'goto', x: 240, z: -30, text: 'Reach the cold-store dock', line: ['madre', 'The fish truck leaves at dusk. Be its shadow.'] },
    { type: 'steal', x: 240, z: 30, text: 'Steal the CARGA VAN', line: ['ruy', 'Borrowed. Heavily borrowed.'] },
    { type: 'deliver', x: -60, z: 150, text: 'Deliver the van to the market yard', line: ['madre', 'Cold fish, hot money. Perfect.'] } ] },
  { title: 'Taxi for a Ghost', giver: 'ghost', district: 'PUERTO ALTO', pay: 2000, respect: 110, stages: [
    { type: 'goto', x: -240, z: -150, text: 'Take a TAXI CANDELA to the towers', line: ['ghost', 'No name. No questions. Just drive.'] },
    { type: 'pickup', x: -120, z: -210, text: 'Pick up the Ghost', line: ['ghost', 'You drive like the city owes you money. Good.'] },
    { type: 'chase', x: 470, z: -330, text: 'Shake the tail and reach LA ISLA', line: ['ghost', 'They found me. Drive, wheelman, drive!'] },
    { type: 'deliver', x: 470, z: -270, text: 'Drop the Ghost at the island villa', line: ['ghost', 'Forget this face. Remember the fare.'] } ] },
  { title: "The Regent's New Paint", giver: 'tito', district: 'PUERTO ALTO', pay: 2600, respect: 140, stages: [
    { type: 'steal', x: -180, z: -90, text: "Steal the Regent's DUQUESA SEDAN", line: ['tito', 'His pride and joy, brother. Scratch nothing. Yet.'] },
    { type: 'goto', x: -270, z: -210, text: 'Take it to the PUERTO ALTO garage', line: ['tito', 'New paint, new plates, new owner.'] },
    { type: 'deliver', x: 90, z: 150, text: 'Deliver the repainted sedan', line: ['madre', 'He will weep at the colour. Coral. Perfect.'] } ] },
  { title: 'Market Day Riot', giver: 'madre', district: 'EL MERCADO', pay: 3400, respect: 170, stages: [
    { type: 'goto', x: 150, z: 150, text: 'Reach the market plaza', line: ['madre', 'The Regent\'s men are shaking down my stalls. End it.'] },
    { type: 'fight', x: 150, z: 150, text: 'Drive off the Regent\'s men', line: ['madre', 'Make it loud, Ruy. The market is watching.'] },
    { type: 'escape', x: 0, z: 0, text: 'Escape the CPA response', line: ['lucia', 'Static is charged if you need the sky to blink.'] } ] },
  { title: 'Wreck the Regent', giver: 'madre', district: 'MALECÓN VIEJO', pay: 5200, respect: 220, stages: [
    { type: 'goto', x: -240, z: 210, text: 'Stage on the Malecón boulevard', line: ['madre', 'Today we stop running from him.'] },
    { type: 'chase', x: 60, z: 210, text: 'Catch the convoy on the boulevard', line: ['tito', 'Convoy rolling east. Punch it!'] },
    { type: 'chase', x: 240, z: 210, text: "RAM THE REGENT'S CONVOY CAR", line: ['madre', "He's running for the ferry, Ruy. Break his pretty car."] },
    { type: 'escape', x: 0, z: 0, text: 'Escape at four stars', line: ['madre', 'His crown is cracked. One job left.'] } ] },
  { title: 'Night Ferry', giver: 'lucia', district: 'EL PUERTO', pay: 6800, respect: 260, stages: [
    { type: 'goto', x: 60, z: 290, text: 'Reach the ferry pier after dark', line: ['lucia', 'The ferry carries his ledger. And his guards.'] },
    { type: 'pickup', x: 60, z: 300, text: 'Take the ledger case', line: ['lucia', 'Case aboard. Now be weather — loud, then gone.'] },
    { type: 'deliver', x: 470, z: -330, text: 'Run the causeway to LA ISLA', line: ['madre', 'The island keeps what the port cannot.'] } ] },
  { title: 'The Candela Crown', giver: 'madre', district: 'LA ISLA', pay: 12000, respect: 400, stages: [
    { type: 'goto', x: 470, z: -330, text: 'Assemble the crew on LA ISLA', line: ['madre', 'Everything we built points at tonight.'] },
    { type: 'chase', x: 0, z: 210, text: 'Lead the CPA fleet on the grand chase', line: ['regent', 'Every light in this port answers to me!'] },
    { type: 'fight', x: 150, z: 150, text: 'Hold the market against the last push', line: ['tito', 'For the harbour! Hold the line!'] },
    { type: 'escape', x: 0, z: 0, text: 'Vanish at five stars — take the Crown', line: ['madre', 'Puerto Candela is ours, Ruy. Ours.'] } ] },
];
export const RADIO_LINES = [
  "RADIO CANDELA 98.4 — 'Salitre' by Los Faros",
  'RADIO CANDELA 98.4 — harbour traffic: causeway clear, boulevard golden',
  "RADIO CANDELA 98.4 — 'Marea Baja' by Coral Norte",
  'RADIO CANDELA 98.4 — CPA advises calm; the market advises otherwise',
  "RADIO CANDELA 98.4 — 'Faro Apagado' by Lucia Ferrer (live session)",
];
