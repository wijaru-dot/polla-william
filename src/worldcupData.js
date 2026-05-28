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
