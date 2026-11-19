/**
 * Catálogo de corpos celestes REAIS exibidos na plataforma.
 *
 * Regras de honestidade científica:
 *  - Todos os objetos abaixo existem de fato e os dados da ficha vêm de valores astronômicos conhecidos
 *    (arredondados; onde há incerteza, o texto diz "cerca de" ou "estimativas variam").
 *  - A POSIÇÃO e o TAMANHO na cena 3D são ilustrativos (fora de escala) para permitir a navegação.
 *  - Estrelas de fundo, poeira, nebulosas decorativas e a forma exata dos braços espirais são elementos
 *    artísticos e NÃO são apresentados como dados científicos.
 */

export const CATEGORIES = {
  star: 'Estrela',
  planet: 'Planeta',
  moon: 'Lua',
  blackhole: 'Buraco negro',
  nebula: 'Nebulosa',
  galaxy: 'Galáxia',
};

export const CATEGORY_PLURAL = {
  star: 'Estrelas',
  planet: 'Planetas',
  moon: 'Luas',
  blackhole: 'Buracos negros',
  nebula: 'Nebulosas',
  galaxy: 'Galáxias',
};

const sol = {
  id: 'sol',
  name: 'Sol',
  category: 'star',
  tagline: 'Nossa estrela, anã amarela de classe G2V',
  color: '#ffd27a',
  description:
    'O Sol é a estrela no centro do Sistema Solar. Produz energia fundindo hidrogênio em hélio no núcleo e é a fonte de luz e calor que sustenta a vida na Terra.',
  distance: 'Média de 149,6 milhões de km (1 UA); a luz leva cerca de 8 min 20 s para chegar',
  size: 'Diâmetro de ≈ 1.392.700 km (≈ 109 vezes o da Terra)',
  temperature: 'Superfície ≈ 5.770 K (≈ 5.500 °C); núcleo ≈ 15 milhões de K',
  composition: 'Cerca de 73% de hidrogênio e 25% de hélio, em massa',
  facts: [
    { label: 'Classe espectral', value: 'G2V (sequência principal)' },
    { label: 'Idade', value: '≈ 4,6 bilhões de anos' },
    { label: 'Massa', value: '≈ 1,989 × 10³⁰ kg' },
    { label: 'Distância ao centro da galáxia', value: '≈ 26.000 anos-luz' },
  ],
  curiosities: [
    'Concentra cerca de 99,86% de toda a massa do Sistema Solar.',
    'Dá uma volta ao redor do centro da Via Láctea a cada 225 a 250 milhões de anos, aproximadamente.',
    'Daqui a alguns bilhões de anos deve se tornar uma gigante vermelha e, depois, uma anã branca.',
  ],
  galaxy: { position: [31, 0.5, 0], focus: 6, size: 0.55, alwaysLabel: true },
};

export const GALAXY_OBJECTS = [
  {
    id: 'sgr-a',
    name: 'Sagitário A*',
    category: 'blackhole',
    tagline: 'Buraco negro supermassivo no centro da Via Láctea',
    color: '#ffa94d',
    description:
      'Fonte de rádio compacta no centro da Via Láctea, identificada como um buraco negro supermassivo. Seu efeito gravitacional é medido pelas órbitas de estrelas muito próximas.',
    distance: '≈ 26.000 anos-luz da Terra',
    size: 'Massa ≈ 4,3 milhões de sóis; horizonte de eventos com raio de ≈ 12 milhões de km',
    temperature: 'Não se aplica ao buraco negro; o gás quente ao redor emite em raios X',
    composition: 'O interior não é observável: o horizonte de eventos impede que a luz escape',
    facts: [
      { label: 'Primeira imagem', value: 'Event Horizon Telescope, divulgada em maio de 2022' },
      { label: 'Estrela S2', value: 'Órbita de ≈ 16 anos ao redor dele' },
      { label: 'Nobel de Física 2020', value: 'Genzel e Ghez, pela evidência do objeto compacto' },
    ],
    curiosities: [
      'A estrela S2 passa a cerca de 17 horas-luz do buraco negro, a ≈ 3% da velocidade da luz.',
      'Seu horizonte de eventos (≈ 12 milhões de km de raio) caberia com folga dentro da órbita de Mercúrio (≈ 58 milhões de km do Sol).',
    ],
    galaxy: { position: [0, 0, 0], focus: 9, size: 0.9, alwaysLabel: true },
  },
  sol,
  {
    id: 'proxima',
    name: 'Proxima Centauri',
    category: 'star',
    tagline: 'A estrela mais próxima do Sol',
    color: '#ff7b5c',
    description:
      'Anã vermelha de baixa massa, a estrela conhecida mais próxima do Sol. É muito fraca: não pode ser vista a olho nu.',
    distance: '≈ 4,24 anos-luz',
    size: '≈ 0,15 do raio do Sol (diâmetro de cerca de 215 mil km)',
    temperature: 'Superfície ≈ 3.050 K',
    composition: 'Plasma de hidrogênio e hélio',
    facts: [
      { label: 'Classe espectral', value: 'M5.5Ve (anã vermelha com erupções)' },
      { label: 'Massa', value: '≈ 0,12 massa solar' },
      { label: 'Luminosidade', value: '≈ 0,17% da solar' },
      { label: 'Planeta conhecido', value: 'Proxima b, massa mínima ≈ 1,07 Terra' },
    ],
    curiosities: [
      'Proxima b orbita na zona habitável, mas a estrela emite erupções intensas, o que torna a habitabilidade incerta.',
      'A sonda Voyager 1, em sua velocidade atual, levaria mais de 70 mil anos para chegar lá.',
    ],
    galaxy: { position: [29, 1.8, 3.6], focus: 4, size: 0.3 },
  },
  {
    id: 'sirius',
    name: 'Sirius',
    category: 'star',
    tagline: 'A estrela mais brilhante do céu noturno',
    color: '#cfe3ff',
    description:
      'Estrela branco-azulada da constelação do Cão Maior. Forma um sistema binário com Sirius B, uma anã branca.',
    distance: '≈ 8,6 anos-luz',
    size: '≈ 1,7 raio solar (≈ 2,4 milhões de km de diâmetro)',
    temperature: 'Superfície ≈ 9.940 K',
    composition: 'Hidrogênio e hélio',
    facts: [
      { label: 'Classe espectral', value: 'A1V' },
      { label: 'Massa', value: '≈ 2 massas solares' },
      { label: 'Luminosidade', value: '≈ 25 vezes a do Sol' },
      { label: 'Companheira', value: 'Sirius B, anã branca' },
    ],
    curiosities: [
      'Sirius B tem massa parecida com a do Sol concentrada num volume próximo ao da Terra.',
      'Seu brilho aparente (magnitude ≈ −1,46) vem da combinação de ser luminosa e relativamente próxima.',
    ],
    galaxy: { position: [34.2, -1.6, 4.4], focus: 4, size: 0.34 },
  },
  {
    id: 'vega',
    name: 'Vega',
    category: 'star',
    tagline: 'Estrela branca da constelação da Lira',
    color: '#bcd4ff',
    description:
      'Uma das estrelas mais brilhantes do céu do hemisfério norte e referência histórica para a escala de magnitudes. Possui um disco de poeira e detritos ao redor.',
    distance: '≈ 25 anos-luz',
    size: '≈ 2,4 raios solares (achatada pela rotação rápida)',
    temperature: 'Superfície ≈ 9.600 K',
    composition: 'Hidrogênio e hélio',
    facts: [
      { label: 'Classe espectral', value: 'A0V' },
      { label: 'Luminosidade', value: '≈ 40 vezes a do Sol' },
      { label: 'Característica', value: 'Disco de detritos em órbita' },
    ],
    curiosities: [
      'Foi a primeira estrela, além do Sol, a ser fotografada, em 1850.',
      'Por causa da precessão do eixo da Terra, foi a estrela polar norte há cerca de 14 mil anos e voltará a ser por volta do ano 13.700.',
    ],
    galaxy: { position: [27, -2.2, -5.4], focus: 4, size: 0.34 },
  },
  {
    id: 'betelgeuse',
    name: 'Betelgeuse',
    category: 'star',
    tagline: 'Supergigante vermelha em Órion',
    color: '#ff6a3d',
    description:
      'Supergigante vermelha no ombro da constelação de Órion. É uma estrela variável que pulsa e muda de brilho.',
    distance: 'Cerca de 550 a 700 anos-luz (estimativas variam)',
    size: 'Cerca de 700 raios solares (variável)',
    temperature: 'Superfície ≈ 3.600 K',
    composition: 'Hidrogênio e hélio, com elementos mais pesados produzidos em seu interior',
    facts: [
      { label: 'Classe espectral', value: 'M1–M2 Ia–Iab (supergigante)' },
      { label: 'Idade', value: 'Cerca de 10 milhões de anos' },
      { label: 'Destino esperado', value: 'Explosão como supernova' },
    ],
    curiosities: [
      'Entre 2019 e 2020 ela escureceu de forma incomum, a chamada Grande Atenuação, associada a uma nuvem de poeira ejetada.',
      'Deve explodir como supernova, mas os astrônomos esperam isso em um horizonte de até cerca de 100 mil anos, não em breve.',
    ],
    galaxy: { position: [35.4, 2.6, -4.6], focus: 5, size: 0.45 },
  },
  {
    id: 'rigel',
    name: 'Rigel',
    category: 'star',
    tagline: 'Supergigante azul em Órion',
    color: '#9fc3ff',
    description:
      'Supergigante azul-branca no pé da constelação de Órion. É um sistema estelar múltiplo e uma das estrelas mais luminosas visíveis a olho nu.',
    distance: '≈ 860 anos-luz',
    size: '≈ 79 raios solares',
    temperature: 'Superfície ≈ 12.100 K',
    composition: 'Hidrogênio e hélio',
    facts: [
      { label: 'Classe espectral', value: 'B8 Ia (supergigante)' },
      { label: 'Luminosidade', value: '≈ 120 mil vezes a do Sol' },
    ],
    curiosities: ['A luz que vemos hoje saiu dela há cerca de 860 anos.'],
    galaxy: { position: [38, -1, -1.2], focus: 5, size: 0.4 },
  },
  {
    id: 'polaris',
    name: 'Polaris',
    category: 'star',
    tagline: 'A Estrela Polar do hemisfério norte',
    color: '#fff1c9',
    description:
      'Supergigante amarela que hoje está muito próxima do polo norte celeste, servindo de referência de navegação no hemisfério norte. É uma variável do tipo cefeida.',
    distance: 'Cerca de 430 anos-luz',
    size: '≈ 46 raios solares',
    temperature: 'Superfície ≈ 6.000 K',
    composition: 'Hidrogênio e hélio',
    facts: [
      { label: 'Classe espectral', value: 'F7 Ib (supergigante)' },
      { label: 'Tipo', value: 'Cefeida (pulsa em ≈ 4 dias)' },
    ],
    curiosities: [
      'Não é visível do hemisfério sul.',
      'A estrela polar muda ao longo de milênios, por causa da precessão do eixo da Terra.',
    ],
    galaxy: { position: [26, 3.2, 3], focus: 4, size: 0.34 },
  },
  {
    id: 'orion-nebula',
    name: 'Nebulosa de Órion (M42)',
    category: 'nebula',
    tagline: 'Berçário de estrelas visível a olho nu',
    color: '#ff6fb5',
    description:
      'Região H II onde nascem novas estrelas, na "espada" da constelação de Órion. O gás ionizado brilha sob a radiação de estrelas jovens e massivas do aglomerado do Trapézio.',
    distance: '≈ 1.340 anos-luz',
    size: '≈ 24 anos-luz de extensão',
    temperature: 'Gás ionizado a ≈ 10.000 K',
    composition: 'Hidrogênio ionizado, hélio, oxigênio e poeira',
    facts: [
      { label: 'Tipo', value: 'Região H II (nebulosa de emissão)' },
      { label: 'Aglomerado central', value: 'Trapézio (Θ¹ Orionis)' },
      { label: 'Idade das estrelas jovens', value: 'Poucos milhões de anos' },
    ],
    curiosities: [
      'O Telescópio Espacial Hubble revelou discos de poeira ao redor de estrelas recém-nascidas ali, possíveis berços de planetas.',
      'Pode ser vista a olho nu como uma mancha difusa em céu escuro.',
    ],
    galaxy: { position: [36.5, -3.4, -7.4], focus: 7, size: 1.6, alwaysLabel: false },
  },
  {
    id: 'crab-nebula',
    name: 'Nebulosa do Caranguejo (M1)',
    category: 'nebula',
    tagline: 'Remanescente da supernova de 1054',
    color: '#6fd3ff',
    description:
      'Restos da explosão de uma estrela massiva, registrada por astrônomos em 1054. No centro há um pulsar, o núcleo remanescente da estrela.',
    distance: '≈ 6.500 anos-luz',
    size: '≈ 11 anos-luz de extensão',
    temperature: 'Filamentos entre ≈ 11.000 e 18.000 K',
    composition: 'Hidrogênio, hélio, carbono, oxigênio, nitrogênio, ferro, neônio e enxofre',
    facts: [
      { label: 'Evento original', value: 'Supernova SN 1054' },
      { label: 'Pulsar central', value: 'Gira cerca de 30 vezes por segundo' },
      { label: 'Expansão', value: '≈ 1.500 km/s' },
    ],
    curiosities: ['Foi o primeiro objeto do catálogo de Messier (M1).'],
    galaxy: { position: [41.5, 1, 6], focus: 6, size: 1.3 },
  },
  {
    id: 'via-lactea',
    name: 'Via Láctea',
    category: 'galaxy',
    tagline: 'A galáxia onde vivemos',
    color: '#8fb2ff',
    description:
      'Galáxia espiral barrada que contém o Sistema Solar. Vemos sua faixa de estrelas no céu noturno porque estamos dentro do disco.',
    distance: 'Estamos dentro dela; o Sol fica a ≈ 26.000 anos-luz do centro',
    size: 'Disco com cerca de 100.000 anos-luz de diâmetro (estimativas variam)',
    temperature: 'Não se aplica (estrelas e gás com temperaturas muito diferentes)',
    composition: 'Estrelas, gás, poeira e matéria escura, que seria a maior parte da massa',
    facts: [
      { label: 'Tipo', value: 'Espiral barrada' },
      { label: 'Estrelas', value: 'Entre 100 e 400 bilhões (estimativa)' },
      { label: 'Local do Sol', value: 'Braço secundário (Braço de Órion)' },
    ],
    curiosities: [
      'A forma de espiral desta cena é artística: o número exato e o traçado dos braços da Via Láctea ainda são estudados.',
    ],
    galaxy: { position: [-46, 2, 28], focus: 16, size: 2.2, alwaysLabel: true },
  },
  {
    id: 'andromeda',
    name: 'Galáxia de Andrômeda (M31)',
    category: 'galaxy',
    tagline: 'A grande galáxia espiral vizinha',
    color: '#b6a8ff',
    description:
      'A galáxia espiral grande mais próxima da Via Láctea e um dos objetos mais distantes visíveis a olho nu em céu escuro.',
    distance: '≈ 2,5 milhões de anos-luz',
    size: '≈ 220.000 anos-luz de diâmetro',
    temperature: 'Não se aplica (estrelas e gás com temperaturas muito diferentes)',
    composition: 'Cerca de um trilhão de estrelas, gás, poeira e matéria escura',
    facts: [
      { label: 'Tipo', value: 'Espiral' },
      { label: 'Movimento', value: 'Aproxima-se da Via Láctea a ≈ 110 km/s' },
      { label: 'Fusão com a Via Láctea', value: 'Cenário de 4–5 bilhões de anos; estudos recentes o tornam menos certo' },
    ],
    curiosities: [
      'Na década de 1920, Edwin Hubble mediu a distância de Andrômeda com estrelas cefeidas e mostrou que ela é uma galáxia à parte.',
    ],
    galaxy: { position: [-120, 35, -60], focus: 42, size: 3, alwaysLabel: true },
  },
];

export const SOLAR_OBJECTS = [
  sol,
  {
    id: 'mercurio',
    name: 'Mercúrio',
    category: 'planet',
    tagline: 'O menor planeta e o mais próximo do Sol',
    color: '#a8a39b',
    description: 'Mundo rochoso e craterado, quase sem atmosfera, com variações extremas de temperatura entre dia e noite.',
    distance: 'Entre ≈ 77 e ≈ 222 milhões de km da Terra (≈ 58 milhões de km do Sol)',
    size: 'Diâmetro de 4.879 km',
    temperature: 'De ≈ −180 °C (noite) a ≈ 430 °C (dia)',
    composition: 'Grande núcleo metálico e manto e crosta de silicatos',
    facts: [
      { label: 'Ano', value: '88 dias terrestres' },
      { label: 'Dia solar', value: '≈ 176 dias terrestres' },
      { label: 'Luas', value: 'Nenhuma' },
    ],
    curiosities: [
      'Crateras polares permanentemente sombreadas guardam gelo de água, detectado pela sonda MESSENGER.',
      'É o planeta que se move mais rápido ao redor do Sol, a cerca de 47 km/s.',
    ],
  },
  {
    id: 'venus',
    name: 'Vênus',
    category: 'planet',
    tagline: 'O planeta mais quente do Sistema Solar',
    color: '#e8c98a',
    description: 'Envolto por nuvens de ácido sulfúrico e uma atmosfera densa de dióxido de carbono que causa um efeito estufa extremo.',
    distance: 'Entre ≈ 38 e ≈ 261 milhões de km da Terra (≈ 108 milhões de km do Sol)',
    size: 'Diâmetro de 12.104 km',
    temperature: '≈ 465 °C na superfície',
    composition: 'Atmosfera de ≈ 96,5% de CO₂; pressão na superfície de ≈ 92 atmosferas',
    facts: [
      { label: 'Ano', value: '≈ 225 dias terrestres' },
      { label: 'Rotação', value: '≈ 243 dias, em sentido retrógrado' },
      { label: 'Luas', value: 'Nenhuma' },
    ],
    curiosities: ['Um dia em Vênus (uma rotação) dura mais do que seu ano.'],
  },
  {
    id: 'terra',
    name: 'Terra',
    category: 'planet',
    tagline: 'O único mundo com vida conhecida',
    color: '#4f8dff',
    description: 'Planeta rochoso com oceanos de água líquida, atmosfera rica em nitrogênio e oxigênio e a única biosfera conhecida.',
    distance: 'Nosso planeta: 1 UA (≈ 149,6 milhões de km) do Sol',
    size: 'Diâmetro médio de 12.742 km',
    temperature: 'Média global de ≈ 15 °C',
    composition: 'Atmosfera de ≈ 78% de N₂ e ≈ 21% de O₂; ≈ 71% da superfície coberta por oceanos',
    facts: [
      { label: 'Idade', value: '≈ 4,54 bilhões de anos' },
      { label: 'Ano', value: '365,25 dias' },
      { label: 'Luas', value: '1' },
    ],
    curiosities: ['É o planeta mais denso do Sistema Solar, com ≈ 5,5 g/cm³.'],
  },
  {
    id: 'lua',
    name: 'Lua',
    category: 'moon',
    tagline: 'O satélite natural da Terra',
    color: '#c9c9c9',
    description: 'Mundo rochoso e sem atmosfera significativa. Mantém sempre a mesma face voltada para a Terra e influencia as marés.',
    distance: '≈ 384.400 km da Terra (média)',
    size: 'Diâmetro de 3.474 km',
    temperature: 'De ≈ −170 °C a ≈ 120 °C na superfície',
    composition: 'Rochas de silicatos cobertas por regolito; núcleo pequeno',
    facts: [
      { label: 'Origem (hipótese mais aceita)', value: 'Impacto gigante, ≈ 4,5 bilhões de anos atrás' },
      { label: 'Afastamento', value: '≈ 3,8 cm por ano' },
      { label: 'Visitas humanas', value: 'Seis missões Apollo, de 1969 a 1972' },
    ],
    curiosities: ['Doze astronautas caminharam em sua superfície.'],
  },
  {
    id: 'marte',
    name: 'Marte',
    category: 'planet',
    tagline: 'O planeta vermelho',
    color: '#d1674a',
    description: 'Deserto frio com vulcões gigantes, vales e calotas polares. Há evidências de que já teve água líquida na superfície.',
    distance: 'Entre ≈ 55 e ≈ 400 milhões de km da Terra (≈ 228 milhões de km do Sol)',
    size: 'Diâmetro de 6.779 km',
    temperature: 'Média de ≈ −63 °C',
    composition: 'Crosta basáltica rica em óxidos de ferro; atmosfera de ≈ 95% de CO₂, com menos de 1% da pressão da Terra',
    facts: [
      { label: 'Ano', value: '≈ 687 dias terrestres' },
      { label: 'Luas', value: 'Fobos e Deimos' },
      { label: 'Olympus Mons', value: '≈ 22 km de altura, o maior vulcão conhecido' },
    ],
    curiosities: ['Os rovers Curiosity (2012) e Perseverance (2021) exploram a cratera Gale e a cratera Jezero.'],
  },
  {
    id: 'jupiter',
    name: 'Júpiter',
    category: 'planet',
    tagline: 'O maior planeta do Sistema Solar',
    color: '#d9b48a',
    description: 'Gigante gasoso com faixas de nuvens e tempestades enormes. Tem mais que o dobro da massa de todos os outros planetas somados.',
    distance: 'Entre ≈ 588 e ≈ 968 milhões de km da Terra (≈ 778 milhões de km do Sol)',
    size: 'Diâmetro equatorial de 139.820 km',
    temperature: '≈ −108 °C no nível de 1 bar de pressão',
    composition: 'Principalmente hidrogênio (≈ 90%) e hélio (≈ 10%)',
    facts: [
      { label: 'Massa', value: '≈ 318 vezes a da Terra' },
      { label: 'Rotação', value: '≈ 10 horas' },
      { label: 'Luas', value: 'Mais de 90 conhecidas' },
    ],
    curiosities: [
      'A Grande Mancha Vermelha é uma tempestade observada há pelo menos 150 anos e está encolhendo.',
      'Europa, uma de suas luas, tem um oceano de água sob a crosta de gelo.',
    ],
  },
  {
    id: 'saturno',
    name: 'Saturno',
    category: 'planet',
    tagline: 'O planeta dos anéis',
    color: '#e3cf9f',
    description: 'Gigante gasoso com o sistema de anéis mais visível do Sistema Solar, formados principalmente por gelo de água.',
    distance: 'Entre ≈ 1,2 e ≈ 1,66 bilhão de km da Terra (≈ 1,43 bilhão de km do Sol)',
    size: 'Diâmetro equatorial de 116.460 km',
    temperature: '≈ −139 °C no nível de 1 bar de pressão',
    composition: 'Principalmente hidrogênio (≈ 96%) e hélio (≈ 3%)',
    facts: [
      { label: 'Densidade média', value: '≈ 0,69 g/cm³, menor que a da água' },
      { label: 'Anéis', value: 'Cerca de 280 mil km de largura, muito finos' },
      { label: 'Luas', value: 'Mais de 200 conhecidas' },
    ],
    curiosities: [
      'Titã, sua maior lua, tem atmosfera densa e lagos de hidrocarbonetos.',
      'Encélado lança jatos de vapor de água que alimentam um dos anéis.',
    ],
  },
  {
    id: 'urano',
    name: 'Urano',
    category: 'planet',
    tagline: 'O gigante de gelo que gira de lado',
    color: '#9fe3e6',
    description: 'Gigante de gelo com eixo de rotação inclinado em ≈ 98°, de modo que parece "rolar" ao redor do Sol.',
    distance: 'Entre ≈ 2,6 e ≈ 3,15 bilhões de km da Terra (≈ 2,87 bilhões de km do Sol)',
    size: 'Diâmetro equatorial de 50.724 km',
    temperature: '≈ −195 °C no nível de 1 bar; atmosfera chega a ≈ −224 °C',
    composition: 'Hidrogênio, hélio e metano na atmosfera; manto de água, amônia e metano em estado "gelado"',
    facts: [
      { label: 'Ano', value: '≈ 84 anos terrestres' },
      { label: 'Descoberta', value: 'William Herschel, 1781' },
      { label: 'Visita', value: 'Apenas a Voyager 2, em 1986' },
    ],
    curiosities: ['Tem 13 anéis conhecidos, escuros e estreitos.'],
  },
  {
    id: 'netuno',
    name: 'Netuno',
    category: 'planet',
    tagline: 'O planeta mais distante do Sol',
    color: '#4766e8',
    description: 'Gigante de gelo azul, com os ventos mais rápidos do Sistema Solar. Sua existência foi prevista por cálculos antes de ser observada.',
    distance: 'Entre ≈ 4,3 e ≈ 4,7 bilhões de km da Terra (≈ 4,5 bilhões de km do Sol)',
    size: 'Diâmetro equatorial de 49.244 km',
    temperature: '≈ −201 °C no nível de 1 bar',
    composition: 'Hidrogênio (≈ 80%), hélio (≈ 19%) e metano (≈ 1,5%) na atmosfera',
    facts: [
      { label: 'Ventos', value: 'Até ≈ 2.100 km/h' },
      { label: 'Ano', value: '≈ 165 anos terrestres' },
      { label: 'Visita', value: 'Apenas a Voyager 2, em 1989' },
    ],
    curiosities: [
      'Foi descoberta em 1846 após cálculos matemáticos de Le Verrier e Adams.',
      'Sua maior lua, Tritão, orbita em sentido contrário ao da rotação do planeta, sugerindo que foi capturada.',
    ],
  },
];

const BY_ID = new Map([...GALAXY_OBJECTS, ...SOLAR_OBJECTS].map((body) => [body.id, body]));

export const getBody = (id) => BY_ID.get(id) ?? null;
export const objectsForMode = (mode) => (mode === 'solar' ? SOLAR_OBJECTS : GALAXY_OBJECTS);
