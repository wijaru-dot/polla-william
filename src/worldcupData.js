// worldcupData.js — Mundial 2026 — Datos oficiales
// Fuente: Bing/Microsoft Sports (calendario oficial FIFA)
// Horarios en UTC (hora Toronto ET + 4h en verano)

export const TEAM_FLAGS = {
  "México": "🇲🇽", "Sudáfrica": "🇿🇦", "Corea del Sur": "🇰🇷", "República Checa": "🇨🇿",
  "Canadá": "🇨🇦", "Bosnia": "🇧🇦", "Catar": "🇶🇦", "Suiza": "🇨🇭",
  "Brasil": "🇧🇷", "Marruecos": "🇲🇦", "Haití": "🇭🇹", "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos": "🇺🇸", "Paraguay": "🇵🇾", "Australia": "🇦🇺", "Turquía": "🇹🇷",
  "Alemania": "🇩🇪", "Curazao": "🇨🇼", "Costa de Marfil": "🇨🇮", "Ecuador": "🇪🇨",
  "Países Bajos": "🇳🇱", "Japón": "🇯🇵", "Suecia": "🇸🇪", "Túnez": "🇹🇳",
  "Bélgica": "🇧🇪", "Egipto": "🇪🇬", "Irán": "🇮🇷", "Nueva Zelanda": "🇳🇿",
  "España": "🇪🇸", "Cabo Verde": "🇨🇻", "Arabia Saudita": "🇸🇦", "Uruguay": "🇺🇾",
  "Francia": "🇫🇷", "Senegal": "🇸🇳", "Irak": "🇮🇶", "Noruega": "🇳🇴",
  "Argentina": "🇦🇷", "Argelia": "🇩🇿", "Austria": "🇦🇹", "Jordania": "🇯🇴",
  "Portugal": "🇵🇹", "RD Congo": "🇨🇩", "Uzbekistán": "🇺🇿", "Colombia": "🇨🇴",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croacia": "🇭🇷", "Ghana": "🇬🇭", "Panamá": "🇵🇦",
};

// Horarios ET (Toronto) → UTC: sumar 4 horas (horario verano EDT)
// Ej: 15:00 ET = 19:00 UTC

export const WC2026_MATCHES = [
  // ═══════════════════════════════
  // JUE 11 JUNIO
  // ═══════════════════════════════
  { id: "m001", homeTeam: "México", awayTeam: "Sudáfrica", datetime: "2026-06-11T19:00:00Z", phase: "groups", group: "A", stadium: "Estadio Azteca, Ciudad de México", enabled: false },
  { id: "m002", homeTeam: "Corea del Sur", awayTeam: "República Checa", datetime: "2026-06-12T02:00:00Z", phase: "groups", group: "A", stadium: "Estadio Akron, Guadalajara", enabled: false },

  // ═══════════════════════════════
  // VIE 12 JUNIO
  // ═══════════════════════════════
  { id: "m003", homeTeam: "Canadá", awayTeam: "Bosnia", datetime: "2026-06-12T19:00:00Z", phase: "groups", group: "B", stadium: "BMO Field, Toronto", enabled: false },
  { id: "m004", homeTeam: "Estados Unidos", awayTeam: "Paraguay", datetime: "2026-06-13T01:00:00Z", phase: "groups", group: "D", stadium: "SoFi Stadium, Los Ángeles", enabled: false },

  // ═══════════════════════════════
  // SAB 13 JUNIO
  // ═══════════════════════════════
  { id: "m005", homeTeam: "Catar", awayTeam: "Suiza", datetime: "2026-06-13T19:00:00Z", phase: "groups", group: "B", stadium: "Levi's Stadium, San Francisco", enabled: false },
  { id: "m006", homeTeam: "Brasil", awayTeam: "Marruecos", datetime: "2026-06-13T22:00:00Z", phase: "groups", group: "C", stadium: "MetLife Stadium, Nueva York", enabled: false },
  { id: "m007", homeTeam: "Haití", awayTeam: "Escocia", datetime: "2026-06-14T01:00:00Z", phase: "groups", group: "C", stadium: "Gillette Stadium, Boston", enabled: false },

  // ═══════════════════════════════
  // DOM 14 JUNIO
  // ═══════════════════════════════
  { id: "m008", homeTeam: "Australia", awayTeam: "Turquía", datetime: "2026-06-14T04:00:00Z", phase: "groups", group: "D", stadium: "BC Place, Vancouver", enabled: false },
  { id: "m009", homeTeam: "Alemania", awayTeam: "Curazao", datetime: "2026-06-14T17:00:00Z", phase: "groups", group: "E", stadium: "NRG Stadium, Houston", enabled: false },
  { id: "m010", homeTeam: "Países Bajos", awayTeam: "Japón", datetime: "2026-06-14T20:00:00Z", phase: "groups", group: "F", stadium: "AT&T Stadium, Dallas", enabled: false },
  { id: "m011", homeTeam: "Costa de Marfil", awayTeam: "Ecuador", datetime: "2026-06-14T23:00:00Z", phase: "groups", group: "E", stadium: "Lincoln Financial Field, Filadelfia", enabled: false },
  { id: "m012", homeTeam: "Suecia", awayTeam: "Túnez", datetime: "2026-06-15T02:00:00Z", phase: "groups", group: "F", stadium: "Estadio BBVA, Monterrey", enabled: false },

  // ═══════════════════════════════
  // LUN 15 JUNIO
  // ═══════════════════════════════
  { id: "m013", homeTeam: "España", awayTeam: "Cabo Verde", datetime: "2026-06-15T16:00:00Z", phase: "groups", group: "H", stadium: "Mercedes-Benz Stadium, Atlanta", enabled: false },
  { id: "m014", homeTeam: "Bélgica", awayTeam: "Egipto", datetime: "2026-06-15T19:00:00Z", phase: "groups", group: "G", stadium: "Lumen Field, Seattle", enabled: false },
  { id: "m015", homeTeam: "Arabia Saudita", awayTeam: "Uruguay", datetime: "2026-06-15T22:00:00Z", phase: "groups", group: "H", stadium: "Hard Rock Stadium, Miami", enabled: false },
  { id: "m016", homeTeam: "Irán", awayTeam: "Nueva Zelanda", datetime: "2026-06-16T01:00:00Z", phase: "groups", group: "G", stadium: "SoFi Stadium, Los Ángeles", enabled: false },

  // ═══════════════════════════════
  // MAR 16 JUNIO
  // ═══════════════════════════════
  { id: "m017", homeTeam: "Francia", awayTeam: "Senegal", datetime: "2026-06-16T19:00:00Z", phase: "groups", group: "I", stadium: "MetLife Stadium, Nueva York", enabled: false },
  { id: "m018", homeTeam: "Irak", awayTeam: "Noruega", datetime: "2026-06-16T22:00:00Z", phase: "groups", group: "I", stadium: "Gillette Stadium, Boston", enabled: false },
  { id: "m019", homeTeam: "Argentina", awayTeam: "Argelia", datetime: "2026-06-17T01:00:00Z", phase: "groups", group: "J", stadium: "Arrowhead Stadium, Kansas City", enabled: false },

  // ═══════════════════════════════
  // MIE 17 JUNIO
  // ═══════════════════════════════
  { id: "m020", homeTeam: "Austria", awayTeam: "Jordania", datetime: "2026-06-17T04:00:00Z", phase: "groups", group: "J", stadium: "Levi's Stadium, San Francisco", enabled: false },
  { id: "m021", homeTeam: "Portugal", awayTeam: "RD Congo", datetime: "2026-06-17T17:00:00Z", phase: "groups", group: "K", stadium: "NRG Stadium, Houston", enabled: false },
  { id: "m022", homeTeam: "Inglaterra", awayTeam: "Croacia", datetime: "2026-06-17T20:00:00Z", phase: "groups", group: "L", stadium: "AT&T Stadium, Dallas", enabled: false },
  { id: "m023", homeTeam: "Ghana", awayTeam: "Panamá", datetime: "2026-06-17T23:00:00Z", phase: "groups", group: "L", stadium: "BMO Field, Toronto", enabled: false },
  { id: "m024", homeTeam: "Uzbekistán", awayTeam: "Colombia", datetime: "2026-06-18T02:00:00Z", phase: "groups", group: "K", stadium: "Estadio Azteca, Ciudad de México", enabled: false },

  // ═══════════════════════════════
  // JUE 18 JUNIO
  // ═══════════════════════════════
  { id: "m025", homeTeam: "República Checa", awayTeam: "Sudáfrica", datetime: "2026-06-18T16:00:00Z", phase: "groups", group: "A", stadium: "Mercedes-Benz Stadium, Atlanta", enabled: false },
  { id: "m026", homeTeam: "Suiza", awayTeam: "Bosnia", datetime: "2026-06-18T19:00:00Z", phase: "groups", group: "B", stadium: "SoFi Stadium, Los Ángeles", enabled: false },
  { id: "m027", homeTeam: "Canadá", awayTeam: "Catar", datetime: "2026-06-18T22:00:00Z", phase: "groups", group: "B", stadium: "BC Place, Vancouver", enabled: false },
  { id: "m028", homeTeam: "México", awayTeam: "Corea del Sur", datetime: "2026-06-19T01:00:00Z", phase: "groups", group: "A", stadium: "Estadio Akron, Guadalajara", enabled: false },

  // ═══════════════════════════════
  // VIE 19 JUNIO
  // ═══════════════════════════════
  { id: "m029", homeTeam: "Estados Unidos", awayTeam: "Australia", datetime: "2026-06-19T19:00:00Z", phase: "groups", group: "D", stadium: "Lumen Field, Seattle", enabled: false },
  { id: "m030", homeTeam: "Escocia", awayTeam: "Marruecos", datetime: "2026-06-19T22:00:00Z", phase: "groups", group: "C", stadium: "Gillette Stadium, Boston", enabled: false },
  { id: "m031", homeTeam: "Brasil", awayTeam: "Haití", datetime: "2026-06-20T00:30:00Z", phase: "groups", group: "C", stadium: "Lincoln Financial Field, Filadelfia", enabled: false },
  { id: "m032", homeTeam: "Turquía", awayTeam: "Paraguay", datetime: "2026-06-20T03:00:00Z", phase: "groups", group: "D", stadium: "Levi's Stadium, San Francisco", enabled: false },

  // ═══════════════════════════════
  // SAB 20 JUNIO
  // ═══════════════════════════════
  { id: "m033", homeTeam: "Países Bajos", awayTeam: "Suecia", datetime: "2026-06-20T17:00:00Z", phase: "groups", group: "F", stadium: "NRG Stadium, Houston", enabled: false },
  { id: "m034", homeTeam: "Alemania", awayTeam: "Costa de Marfil", datetime: "2026-06-20T20:00:00Z", phase: "groups", group: "E", stadium: "BMO Field, Toronto", enabled: false },
  { id: "m035", homeTeam: "Ecuador", awayTeam: "Curazao", datetime: "2026-06-21T00:00:00Z", phase: "groups", group: "E", stadium: "Arrowhead Stadium, Kansas City", enabled: false },
  { id: "m036", homeTeam: "Túnez", awayTeam: "Japón", datetime: "2026-06-21T04:00:00Z", phase: "groups", group: "F", stadium: "Estadio BBVA, Monterrey", enabled: false },

  // ═══════════════════════════════
  // DOM 21 JUNIO
  // ═══════════════════════════════
  { id: "m037", homeTeam: "España", awayTeam: "Arabia Saudita", datetime: "2026-06-21T16:00:00Z", phase: "groups", group: "H", stadium: "Mercedes-Benz Stadium, Atlanta", enabled: false },
  { id: "m038", homeTeam: "Bélgica", awayTeam: "Irán", datetime: "2026-06-21T19:00:00Z", phase: "groups", group: "G", stadium: "SoFi Stadium, Los Ángeles", enabled: false },
  { id: "m039", homeTeam: "Uruguay", awayTeam: "Cabo Verde", datetime: "2026-06-21T22:00:00Z", phase: "groups", group: "H", stadium: "Hard Rock Stadium, Miami", enabled: false },
  { id: "m040", homeTeam: "Nueva Zelanda", awayTeam: "Egipto", datetime: "2026-06-22T01:00:00Z", phase: "groups", group: "G", stadium: "BC Place, Vancouver", enabled: false },

  // ═══════════════════════════════
  // LUN 22 JUNIO
  // ═══════════════════════════════
  { id: "m041", homeTeam: "Argentina", awayTeam: "Austria", datetime: "2026-06-22T17:00:00Z", phase: "groups", group: "J", stadium: "AT&T Stadium, Dallas", enabled: false },
  { id: "m042", homeTeam: "Francia", awayTeam: "Irak", datetime: "2026-06-22T21:00:00Z", phase: "groups", group: "I", stadium: "Lincoln Financial Field, Filadelfia", enabled: false },
  { id: "m043", homeTeam: "Noruega", awayTeam: "Senegal", datetime: "2026-06-23T00:00:00Z", phase: "groups", group: "I", stadium: "MetLife Stadium, Nueva York", enabled: false },
  { id: "m044", homeTeam: "Jordania", awayTeam: "Argelia", datetime: "2026-06-23T03:00:00Z", phase: "groups", group: "J", stadium: "Levi's Stadium, San Francisco", enabled: false },

  // ═══════════════════════════════
  // MAR 23 JUNIO
  // ═══════════════════════════════
  { id: "m045", homeTeam: "Portugal", awayTeam: "Uzbekistán", datetime: "2026-06-23T17:00:00Z", phase: "groups", group: "K", stadium: "NRG Stadium, Houston", enabled: false },
  { id: "m046", homeTeam: "Inglaterra", awayTeam: "Ghana", datetime: "2026-06-23T20:00:00Z", phase: "groups", group: "L", stadium: "Gillette Stadium, Boston", enabled: false },
  { id: "m047", homeTeam: "Panamá", awayTeam: "Croacia", datetime: "2026-06-23T23:00:00Z", phase: "groups", group: "L", stadium: "BMO Field, Toronto", enabled: false },
  { id: "m048", homeTeam: "Colombia", awayTeam: "RD Congo", datetime: "2026-06-24T02:00:00Z", phase: "groups", group: "K", stadium: "Estadio Akron, Guadalajara", enabled: false },

  // ═══════════════════════════════
  // MIE 24 JUNIO
  // ═══════════════════════════════
  { id: "m049", homeTeam: "Suiza", awayTeam: "Canadá", datetime: "2026-06-24T19:00:00Z", phase: "groups", group: "B", stadium: "BC Place, Vancouver", enabled: false },
  { id: "m050", homeTeam: "Bosnia", awayTeam: "Catar", datetime: "2026-06-24T19:00:00Z", phase: "groups", group: "B", stadium: "Lumen Field, Seattle", enabled: false },
  { id: "m051", homeTeam: "Escocia", awayTeam: "Brasil", datetime: "2026-06-24T22:00:00Z", phase: "groups", group: "C", stadium: "Hard Rock Stadium, Miami", enabled: false },
  { id: "m052", homeTeam: "Marruecos", awayTeam: "Haití", datetime: "2026-06-24T22:00:00Z", phase: "groups", group: "C", stadium: "Mercedes-Benz Stadium, Atlanta", enabled: false },
  { id: "m053", homeTeam: "República Checa", awayTeam: "México", datetime: "2026-06-25T01:00:00Z", phase: "groups", group: "A", stadium: "Estadio Azteca, Ciudad de México", enabled: false },
  { id: "m054", homeTeam: "Sudáfrica", awayTeam: "Corea del Sur", datetime: "2026-06-25T01:00:00Z", phase: "groups", group: "A", stadium: "Estadio BBVA, Monterrey", enabled: false },

  // ═══════════════════════════════
  // JUE 25 JUNIO
  // ═══════════════════════════════
  { id: "m055", homeTeam: "Curazao", awayTeam: "Costa de Marfil", datetime: "2026-06-25T20:00:00Z", phase: "groups", group: "E", stadium: "Lincoln Financial Field, Filadelfia", enabled: false },
  { id: "m056", homeTeam: "Ecuador", awayTeam: "Alemania", datetime: "2026-06-25T20:00:00Z", phase: "groups", group: "E", stadium: "MetLife Stadium, Nueva York", enabled: false },
  { id: "m057", homeTeam: "Japón", awayTeam: "Suecia", datetime: "2026-06-25T23:00:00Z", phase: "groups", group: "F", stadium: "AT&T Stadium, Dallas", enabled: false },
  { id: "m058", homeTeam: "Túnez", awayTeam: "Países Bajos", datetime: "2026-06-25T23:00:00Z", phase: "groups", group: "F", stadium: "Arrowhead Stadium, Kansas City", enabled: false },
  { id: "m059", homeTeam: "Turquía", awayTeam: "Estados Unidos", datetime: "2026-06-26T02:00:00Z", phase: "groups", group: "D", stadium: "SoFi Stadium, Los Ángeles", enabled: false },
  { id: "m060", homeTeam: "Paraguay", awayTeam: "Australia", datetime: "2026-06-26T02:00:00Z", phase: "groups", group: "D", stadium: "Levi's Stadium, San Francisco", enabled: false },

  // ═══════════════════════════════
  // VIE 26 JUNIO
  // ═══════════════════════════════
  { id: "m061", homeTeam: "Noruega", awayTeam: "Francia", datetime: "2026-06-26T19:00:00Z", phase: "groups", group: "I", stadium: "Gillette Stadium, Boston", enabled: false },
  { id: "m062", homeTeam: "Senegal", awayTeam: "Irak", datetime: "2026-06-26T19:00:00Z", phase: "groups", group: "I", stadium: "BMO Field, Toronto", enabled: false },
  { id: "m063", homeTeam: "Uruguay", awayTeam: "España", datetime: "2026-06-27T00:00:00Z", phase: "groups", group: "H", stadium: "Estadio Akron, Guadalajara", enabled: false },
  { id: "m064", homeTeam: "Cabo Verde", awayTeam: "Arabia Saudita", datetime: "2026-06-27T00:00:00Z", phase: "groups", group: "H", stadium: "NRG Stadium, Houston", enabled: false },
  { id: "m065", homeTeam: "Egipto", awayTeam: "Irán", datetime: "2026-06-27T03:00:00Z", phase: "groups", group: "G", stadium: "Lumen Field, Seattle", enabled: false },
  { id: "m066", homeTeam: "Nueva Zelanda", awayTeam: "Bélgica", datetime: "2026-06-27T03:00:00Z", phase: "groups", group: "G", stadium: "BC Place, Vancouver", enabled: false },

  // ═══════════════════════════════
  // SAB 27 JUNIO
  // ═══════════════════════════════
  { id: "m067", homeTeam: "Panamá", awayTeam: "Inglaterra", datetime: "2026-06-27T21:00:00Z", phase: "groups", group: "L", stadium: "MetLife Stadium, Nueva York", enabled: false },
  { id: "m068", homeTeam: "Croacia", awayTeam: "Ghana", datetime: "2026-06-27T21:00:00Z", phase: "groups", group: "L", stadium: "Lincoln Financial Field, Filadelfia", enabled: false },
  { id: "m069", homeTeam: "RD Congo", awayTeam: "Uzbekistán", datetime: "2026-06-27T23:30:00Z", phase: "groups", group: "K", stadium: "Mercedes-Benz Stadium, Atlanta", enabled: false },
  { id: "m070", homeTeam: "Colombia", awayTeam: "Portugal", datetime: "2026-06-27T23:30:00Z", phase: "groups", group: "K", stadium: "Hard Rock Stadium, Miami", enabled: false },
  { id: "m071", homeTeam: "Jordania", awayTeam: "Argentina", datetime: "2026-06-28T02:00:00Z", phase: "groups", group: "J", stadium: "AT&T Stadium, Dallas", enabled: false },
  { id: "m072", homeTeam: "Argelia", awayTeam: "Austria", datetime: "2026-06-28T02:00:00Z", phase: "groups", group: "J", stadium: "Arrowhead Stadium, Kansas City", enabled: false },
];

// ═══════════════════════════════════════════════════════
// FASE ELIMINATORIA — Mundial 2026
// ═══════════════════════════════════════════════════════
export const WC2026_KNOCKOUT = [
  // ── RONDA DE 32 ──────────────────────────────────────
  { id: "m073", homeTeam: "Sudáfrica", awayTeam: "Canadá", datetime: "2026-06-28T19:00:00Z", phase: "r32", stadium: "SoFi Stadium, Los Ángeles", enabled: true, status: "upcoming", matchNumber: 73, nextMatch: "m089" },
  { id: "m074", homeTeam: "Alemania", awayTeam: "Paraguay", datetime: "2026-06-29T20:30:00Z", phase: "r32", stadium: "Gillette Stadium, Boston", enabled: true, status: "upcoming", matchNumber: 74, nextMatch: "m090" },
  { id: "m075", homeTeam: "Países Bajos", awayTeam: "Marruecos", datetime: "2026-06-30T01:00:00Z", phase: "r32", stadium: "Estadio BBVA, Monterrey", enabled: true, status: "upcoming", matchNumber: 75, nextMatch: "m089" },
  { id: "m076", homeTeam: "Brasil", awayTeam: "Japón", datetime: "2026-06-29T17:00:00Z", phase: "r32", stadium: "NRG Stadium, Houston", enabled: true, status: "upcoming", matchNumber: 76, nextMatch: "m091" },
  { id: "m077", homeTeam: "Francia", awayTeam: "Suecia", datetime: "2026-06-30T21:00:00Z", phase: "r32", stadium: "MetLife Stadium, Nueva York", enabled: true, status: "upcoming", matchNumber: 77, nextMatch: "m090" },
  { id: "m078", homeTeam: "Costa de Marfil", awayTeam: "Noruega", datetime: "2026-06-30T17:00:00Z", phase: "r32", stadium: "AT&T Stadium, Dallas", enabled: true, status: "upcoming", matchNumber: 78, nextMatch: "m091" },
  { id: "m079", homeTeam: "México", awayTeam: "Ecuador", datetime: "2026-07-01T01:00:00Z", phase: "r32", stadium: "Estadio Azteca, Ciudad de México", enabled: true, status: "upcoming", matchNumber: 79, nextMatch: "m092" },
  { id: "m080", homeTeam: "Estados Unidos", awayTeam: "Bosnia", datetime: "2026-07-02T00:00:00Z", phase: "r32", stadium: "Levi's Stadium, San Francisco", enabled: true, status: "upcoming", matchNumber: 80, nextMatch: "m093" },
  { id: "m081", homeTeam: "Bélgica", awayTeam: "Senegal", datetime: "2026-07-01T20:00:00Z", phase: "r32", stadium: "Lumen Field, Seattle", enabled: true, status: "upcoming", matchNumber: 81, nextMatch: "m093" },
  { id: "m082", homeTeam: "Portugal", awayTeam: "Croacia", datetime: "2026-07-02T23:00:00Z", phase: "r32", stadium: "BMO Field, Toronto", enabled: true, status: "upcoming", matchNumber: 82, nextMatch: "m094" },
  { id: "m083", homeTeam: "Inglaterra", awayTeam: "RD Congo", datetime: "2026-07-01T16:00:00Z", phase: "r32", stadium: "Mercedes-Benz Stadium, Atlanta", enabled: true, status: "upcoming", matchNumber: 83, nextMatch: "m092" },
  { id: "m084", homeTeam: "España", awayTeam: "Austria", datetime: "2026-07-02T19:00:00Z", phase: "r32", stadium: "SoFi Stadium, Los Ángeles", enabled: true, status: "upcoming", matchNumber: 84, nextMatch: "m094" },
  { id: "m085", homeTeam: "Suiza", awayTeam: "Argelia", datetime: "2026-07-03T03:00:00Z", phase: "r32", stadium: "BC Place, Vancouver", enabled: true, status: "upcoming", matchNumber: 85, nextMatch: "m095" },
  { id: "m086", homeTeam: "Australia", awayTeam: "Egipto", datetime: "2026-07-03T18:00:00Z", phase: "r32", stadium: "AT&T Stadium, Dallas", enabled: true, status: "upcoming", matchNumber: 86, nextMatch: "m096" },
  { id: "m087", homeTeam: "Argentina", awayTeam: "Cabo Verde", datetime: "2026-07-03T22:00:00Z", phase: "r32", stadium: "Hard Rock Stadium, Miami", enabled: true, status: "upcoming", matchNumber: 87, nextMatch: "m096" },
  { id: "m088", homeTeam: "Colombia", awayTeam: "Ghana", datetime: "2026-07-04T01:30:00Z", phase: "r32", stadium: "Arrowhead Stadium, Kansas City", enabled: true, status: "upcoming", matchNumber: 88, nextMatch: "m095" },

  // ── OCTAVOS DE FINAL ─────────────────────────────────
  { id: "m089", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-05T17:00:00Z", phase: "r16", stadium: "NRG Stadium, Houston", enabled: true, status: "upcoming", matchNumber: 89, nextMatch: "m097", slot1: "m073", slot2: "m075" },
  { id: "m090", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-05T21:00:00Z", phase: "r16", stadium: "Lincoln Financial Field, Filadelfia", enabled: true, status: "upcoming", matchNumber: 90, nextMatch: "m097", slot1: "m074", slot2: "m077" },
  { id: "m091", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-06T17:00:00Z", phase: "r16", stadium: "MetLife Stadium, Nueva York", enabled: true, status: "upcoming", matchNumber: 91, nextMatch: "m098", slot1: "m076", slot2: "m078" },
  { id: "m092", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-07T01:00:00Z", phase: "r16", stadium: "Estadio Azteca, Ciudad de México", enabled: true, status: "upcoming", matchNumber: 92, nextMatch: "m098", slot1: "m079", slot2: "m083" },
  { id: "m093", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-06T20:00:00Z", phase: "r16", stadium: "Lumen Field, Seattle", enabled: true, status: "upcoming", matchNumber: 93, nextMatch: "m099", slot1: "m080", slot2: "m081" },
  { id: "m094", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-05T23:00:00Z", phase: "r16", stadium: "AT&T Stadium, Dallas", enabled: true, status: "upcoming", matchNumber: 94, nextMatch: "m099", slot1: "m082", slot2: "m084" },
  { id: "m095", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-07T19:00:00Z", phase: "r16", stadium: "BC Place, Vancouver", enabled: true, status: "upcoming", matchNumber: 95, nextMatch: "m100", slot1: "m085", slot2: "m088" },
  { id: "m096", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-06T22:00:00Z", phase: "r16", stadium: "Mercedes-Benz Stadium, Atlanta", enabled: true, status: "upcoming", matchNumber: 96, nextMatch: "m100", slot1: "m086", slot2: "m087" },

  // ── CUARTOS DE FINAL ─────────────────────────────────
  { id: "m097", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-10T20:00:00Z", phase: "qf", stadium: "Gillette Stadium, Boston", enabled: true, status: "upcoming", matchNumber: 97, nextMatch: "m101", slot1: "m089", slot2: "m090" },
  { id: "m098", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-11T00:00:00Z", phase: "qf", stadium: "SoFi Stadium, Los Ángeles", enabled: true, status: "upcoming", matchNumber: 98, nextMatch: "m101", slot1: "m091", slot2: "m092" },
  { id: "m099", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-11T20:00:00Z", phase: "qf", stadium: "Hard Rock Stadium, Miami", enabled: true, status: "upcoming", matchNumber: 99, nextMatch: "m102", slot1: "m093", slot2: "m094" },
  { id: "m100", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-12T00:00:00Z", phase: "qf", stadium: "Arrowhead Stadium, Kansas City", enabled: true, status: "upcoming", matchNumber: 100, nextMatch: "m102", slot1: "m095", slot2: "m096" },

  // ── SEMIFINALES ──────────────────────────────────────
  { id: "m101", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-14T23:00:00Z", phase: "sf", stadium: "AT&T Stadium, Dallas", enabled: true, status: "upcoming", matchNumber: 101, nextMatch: "m104", slot1: "m097", slot2: "m098" },
  { id: "m102", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-15T23:00:00Z", phase: "sf", stadium: "Mercedes-Benz Stadium, Atlanta", enabled: true, status: "upcoming", matchNumber: 102, nextMatch: "m104", slot1: "m099", slot2: "m100" },

  // ── TERCER PUESTO ────────────────────────────────────
  { id: "m103", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-18T21:00:00Z", phase: "third", stadium: "Hard Rock Stadium, Miami", enabled: true, status: "upcoming", matchNumber: 103, slot1: "m101_loser", slot2: "m102_loser" },

  // ── FINAL ────────────────────────────────────────────
  { id: "m104", homeTeam: "Por definir", awayTeam: "Por definir", datetime: "2026-07-19T19:00:00Z", phase: "final", stadium: "MetLife Stadium, Nueva York", enabled: true, status: "upcoming", matchNumber: 104, slot1: "m101", slot2: "m102" },
];
