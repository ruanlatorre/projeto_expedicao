/**
 * FacchiniLOG - Configuração de Filiais e E-mails
 */

// Variáveis globais para armazenar os e-mails selecionados
let selectedBranchEmail = 'elsalvadorrafa3@gmail.com';
let selectedFinalBranchEmail = 'elsalvadorrafa3@gmail.com';

// Banco de dados de Filiais Facchini
const branches = [
    // --- Unidades de Votuporanga (Estrutura Hierárquica) ---
    { name: 'Votuporanga', isCity: true, state: 'SP' },
    { name: 'Votuporanga - Unidade 1', location: 'Votuporanga, SP', state: 'SP', city: 'Votuporanga', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Votuporanga - Unidade 2', location: 'Votuporanga, SP', state: 'SP', city: 'Votuporanga', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Votuporanga - Unidade 3', location: 'Votuporanga, SP', state: 'SP', city: 'Votuporanga', email: 'arthur.tadeu.carvalhoo@gmail.com' },

    // --- Outras Filiais ---
    { name: 'São José do Rio Preto – SP', location: 'São José do Rio Preto, SP', state: 'SP', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Mirassol – SP', location: 'Mirassol, SP', state: 'SP', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Cosmorama – SP', location: 'Cosmorama, SP', state: 'SP', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Coroados – SP', location: 'Coroados, SP', state: 'SP', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Ribeirão Preto – SP', location: 'Ribeirão Preto, SP', state: 'SP', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Guararema – SP', location: 'Guararema, SP', state: 'SP', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Guarulhos – SP', location: 'Guarulhos, SP', state: 'SP', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Anápolis – GO', location: 'Anápolis, GO', state: 'GO', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Rio Verde – GO', location: 'Rio Verde, GO', state: 'GO', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Cuiabá – MT', location: 'Cuiabá, MT', state: 'MT', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Rondonópolis – MT', location: 'Rondonópolis, MT', state: 'MT', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Campo Grande – MS', location: 'Campo Grande, MS', state: 'MS', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Ribas do Rio Pardo – MS', location: 'Ribas do Rio Pardo, MS', state: 'MS', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Chapecó – SC', location: 'Chapecó, SC', state: 'SC', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Penha – SC', location: 'Penha, SC', state: 'SC', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Içara – SC', location: 'Içara, SC', state: 'SC', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'São José dos Pinhais – PR', location: 'São José dos Pinhais, PR', state: 'PR', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Cambé – PR', location: 'Cambé, PR', state: 'PR', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Nova Santa Rita – RS', location: 'Nova Santa Rita, RS', state: 'RS', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Imperatriz – MA', location: 'Imperatriz, MA', state: 'MA', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'São José de Mipibu – RN', location: 'São José de Mipibu, RN', state: 'RN', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Cabo de Santo Agostinho – PE', location: 'Cabo de Santo Agostinho, PE', state: 'PE', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Luís Eduardo Magalhães – BA', location: 'Luís Eduardo Magalhães, BA', state: 'BA', email: 'arthur.tadeu.carvalhoo@gmail.com' },
    { name: 'Palmas – TO', location: 'Palmas, TO', state: 'TO', email: 'arthur.tadeu.carvalhoo@gmail.com' }
];

console.log('FacchiniLOG: Configurações carregadas com sucesso.');
