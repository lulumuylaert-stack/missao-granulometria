export const particleQuestions = [
  { d: 0.001, label: "ARGILA", why: "0,001 mm é menor que 0,002 mm." },
  { d: 0.0015, label: "ARGILA", why: "0,0015 mm é menor que 0,002 mm." },
  { d: 0.008, label: "SILTE", why: "0,008 mm está entre 0,002 e 0,06 mm." },
  { d: 0.015, label: "SILTE", why: "0,015 mm está entre 0,002 e 0,06 mm." },
  { d: 0.12, label: "AREIA", why: "0,12 mm está entre 0,06 e 2 mm." },
  { d: 1.2, label: "AREIA", why: "1,20 mm está entre 0,06 e 2 mm." },
  { d: 3.5, label: "PEDREGULHO", why: "3,50 mm é maior que 2 mm." },
  { d: 12, label: "PEDREGULHO", why: "12,00 mm é maior que 2 mm." },
] as const;

export const assayQuestions = [
  { text: "A amostra é composta por partículas grossas.", answer: "PENEIRAMENTO", why: "A distribuição dos solos grossos é obtida por peneiramento." },
  { text: "A amostra é composta por partículas finas.", answer: "PENEIRAMENTO + SEDIMENTAÇÃO", why: "Para solos finos, a aula utiliza peneiramento e sedimentação." },
  { text: "A amostra contém partículas na fração grossa e na fração fina.", answer: "PENEIRAMENTO + SEDIMENTAÇÃO", why: "Para frações grossa e fina, faz-se a análise granulométrica completa." },
] as const;

export const sieves = [2, 1.2, 0.6, 0.425, 0.25, 0.15, 0.075];

export const sample = {
  name: "Solo X-17",
  total: 600,
  rows: [
    { sieve: "10", opening: 2, mass: 30, retained: 5, cumulative: 5, passing: 95 },
    { sieve: "20", opening: 0.83, mass: 54, retained: 9, cumulative: 14, passing: 86 },
    { sieve: "40", opening: 0.42, mass: 48, retained: 8, cumulative: 22, passing: 78 },
    { sieve: "60", opening: 0.25, mass: 144, retained: 24, cumulative: 46, passing: 54 },
    { sieve: "100", opening: 0.149, mass: 168, retained: 28, cumulative: 74, passing: 26 },
    { sieve: "200", opening: 0.074, mass: 102, retained: 17, cumulative: 91, passing: 9 },
    { sieve: "Fundo", opening: 0, mass: 54, retained: 9, cumulative: 100, passing: 0 },
  ],
  d10: 0.08, d30: 0.175, d60: 0.3, cu: 3.75, cc: 1.28,
  fractions: { pedregulho: 5, areia: 86, silte: 7, argila: 2 },
  description: "Areia siltosa",
};

export const phasePoints = [0, 500, 300, 500, 700, 700, 800, 500];
