Lo que está bien definido: reglas del juego, flujo de equipos/jugadores, actos, turnos, puntaje, carga manual y random.
Lo incompleto que resolví: cómo manejar “individual” internamente, cómo mezclar contenido manual con random global, y cómo persistir partidas/configuración sin backend.
Recomendación: primero genera **diseño**, después pasa el segundo prompt a Claude Code para construir el MVP.

Use the actos-coordinator agent to implement the Actos MVP using the project prompt and the specialized agents in .claude/agents/.

---

# 1. Prompt diseño

Fetch this design file, read its readme, and implement the relevant aspects of the design. https://api.anthropic.com/v1/design/h/T03phRWF6kSYv58F66KTAQ?open_file=Actos.html
Implement: Actos.html

---

# 2. Prompt de desarrollo / lógica

````md
# PROMPT PARA CLAUDE CODE — Desarrollo del juego “Actos”

Eres un ingeniero senior full-stack/front-end especializado en juegos casuales web, arquitectura limpia, estado complejo y UX interactiva.

Construye un MVP funcional de una app llamada **Actos**, un party game local-first para jugar en grupo. El foco principal es que la lógica del juego sea sólida, modular y fácil de extender.

---

## 1. Stack recomendado

Usa:

- React + TypeScript
- Next.js o Vite
- Zustand para estado global
- localStorage o IndexedDB para persistencia
- Tailwind CSS para estilos
- Framer Motion para animaciones
- API externa para buscar películas/series y posters

Preferencia:

- Si usas Next.js, crea route handlers para evitar exponer tokens sensibles.
- Si usas Vite/client-only, deja claro en README que la key pública es para MVP local.
- No hardcodear credenciales.
- Crear `.env.example`.

---

## 2. Objetivo del juego

El juego permite crear jugadores, equipos, agregar películas/series a un pool global y jugar 3 actos:

- Acto 1: describir con 3 palabras
- Acto 2: describir con 1 palabra
- Acto 3: mímica

En cada acto se usan los mismos títulos, pero un título acertado no vuelve a aparecer dentro del mismo acto. Al pasar al siguiente acto, todos los títulos vuelven a estar disponibles.

El ganador se decide por el total de aciertos/puntos al terminar el Acto 3.

---

## 3. Reglas principales

### Jugadores

- Se pueden crear jugadores ilimitados.
- Cada jugador tiene:
  - id
  - nombre
  - avatar
  - items agregados
- El nombre debe ser editable.
- El avatar debe seleccionarse de un catálogo genérico y divertido.
- Se puede eliminar jugador.
- Se puede reordenar jugadores.

---

## 4. Modo de juego

El usuario puede elegir:

- Individual
- Equipos

### Individual

Cada jugador compite por separado.

Internamente puedes modelar cada jugador como un “equipo individual” para reutilizar la lógica de puntaje y turnos.

### Equipos

Cuando se elige modo equipos:

- El programa debe proponer equipos automáticamente.
- Los equipos deben estar balanceados.
- El usuario puede elegir cantidad de equipos.
- El usuario puede regenerar equipos.
- El usuario puede editar:
  - Nombre del equipo.
  - Integrantes.
  - Color.
- Se debe poder mover jugadores entre equipos.

---

## 5. Configuración de contenido

El usuario debe elegir:

### Categoría

- Películas
- Series
- Ambos

### Cantidad por participante

- Número fijo: de 1 a 4
- Opción: ilimitado

Reglas:

- Si es número fijo, cada participante puede agregar hasta ese número.
- Si es ilimitado, no hay máximo.
- Debe existir validación para impedir exceder el máximo.
- Debe existir validación para impedir iniciar el juego con pool vacío.

---

## 6. Pantalla/lógica de agregar películas o series por participante

Cada participante debe pasar por una pantalla donde puede agregar películas/series al pool.

Debe existir:

### Input con autocomplete

- Input para buscar películas o series.
- Debounce de búsqueda de 300ms.
- Filtro por categoría:
  - movie
  - tv
  - multi
- Resultados con:
  - id externo
  - título
  - año
  - poster
  - tipo
- Al seleccionar un resultado:
  - Se agrega al jugador.
  - Se agrega al pool manual.
  - Se limpia el input.
  - Se evita duplicado global.

### Botón random por participante

Debe existir un botón:

“Random”

Función:

- Obtiene una película/serie aleatoria.
- Respeta la categoría seleccionada.
- Evita duplicados.
- Agrega el item al participante actual.
- Si el límite por participante ya se alcanzó, bloquea la acción.
- Si falla la API, mostrar error manejado.
- Si no hay API key, usar fallback local.

---

## 7. Modo random global

Agregar una funcionalidad para llenar el pool automáticamente cuando nadie quiere agregar contenido manual.

Debe existir configuración:

```ts
type RandomGlobalConfig = {
  enabled: boolean;
  category: "movie" | "tv" | "multi";
  totalItems: number;
  mode: "replace" | "append";
};
````

Reglas:

* El usuario puede elegir categoría:

  * Películas
  * Series
  * Ambos
* El usuario puede elegir cantidad:

  * 10
  * 20
  * 30
  * 50
  * personalizado
* El random global debe generar items únicos.
* Debe poder mezclarse con items manuales.
* Debe permitir:

  * Regenerar todo.
  * Agregar más.
  * Eliminar items individuales.
  * Reemplazar todo con confirmación.

Cada item random global debe marcarse como:

```ts
source: "random-global"
```

Cada item manual debe marcarse como:

```ts
source: "manual"
```

---

## 8. API de películas/series / Modo offline

Integra una API para búsqueda y posters.

En la pantalla de agregar contenido también debería se existir la opción offline o si no se encontró la pelicular deseada agregar el titulo con una imagen genérica.

Recomendación:

* TMDB API

Crear servicio desacoplado:

```ts
interface MediaSearchProvider {
  searchContent(query: string, category: MediaCategory): Promise<MediaItem[]>;
  getRandomContent(category: MediaCategory, excludeIds: string[]): Promise<MediaItem>;
  getRandomPool(category: MediaCategory, count: number, excludeIds: string[]): Promise<MediaItem[]>;
}
```

Tipos:

```ts
type MediaCategory = "movie" | "tv" | "multi";
type MediaType = "movie" | "tv";
```

El servicio debe:

* Buscar por texto.
* Filtrar por categoría.
* Obtener poster.
* Manejar ausencia de poster.
* Evitar duplicados.
* Soportar paginación para random global.
* Tener fallback local con una lista básica de películas/series si no hay API key.

No acoplar la UI directamente a la API.

---

## 9. Modelos de datos

Implementar tipos claros:

```ts
type GameMode = "individual" | "teams";
type ActNumber = 1 | 2 | 3;

type Player = {
  id: string;
  name: string;
  avatarId: string;
  order: number;
};

type Team = {
  id: string;
  name: string;
  color: string;
  playerIds: string[];
  score: number;
};

type MediaItem = {
  id: string;
  externalId: string;
  title: string;
  year?: string;
  posterUrl?: string;
  type: "movie" | "tv";
  addedByPlayerId?: string;
  source: "manual" | "player-random" | "random-global";
};

type GameConfig = {
  mode: GameMode;
  category: MediaCategory;
  itemsPerPlayer: number | "unlimited";
  teamCount?: number;
};

type TurnState = {
  currentTeamId: string;
  currentPlayerId: string;
  currentItemId?: string;
  timerSeconds: number;
  isTimerRunning: boolean;
};

type ActState = {
  currentAct: ActNumber;
  remainingItemIds: string[];
  completedItemIds: string[];
};

type GameState = {
  players: Player[];
  teams: Team[];
  config: GameConfig;
  manualItems: MediaItem[];
  randomGlobalItems: MediaItem[];
  globalPool: MediaItem[];
  actState: ActState;
  turnState: TurnState;
  status:
    | "setup"
    | "adding-content"
    | "review"
    | "playing"
    | "act-summary"
    | "finished";
};
```

---

## 10. Arquitectura de carpetas

Propón e implementa una estructura similar:

```txt
src/
  app/
  components/
    players/
    teams/
    media/
    game/
    results/
    common/
  stores/
    gameStore.ts
  services/
    media/
      mediaProvider.ts
      tmdbProvider.ts
      fallbackProvider.ts
  domain/
    models.ts
    gameEngine.ts
    teamEngine.ts
    mediaPoolEngine.ts
    scoringEngine.ts
  persistence/
    storage.ts
  utils/
    shuffle.ts
    ids.ts
```

Separar:

* UI
* Estado
* Lógica de dominio
* Servicios externos
* Persistencia

No meter toda la lógica en componentes.

---

## 11. Lógica de equipos

Implementar:

```ts
generateBalancedTeams(players: Player[], teamCount: number): Team[]
```

Debe:

* Mezclar jugadores.
* Distribuir balanceadamente.
* Crear nombres temporales.
* Asignar colores.
* Permitir regenerar.
* Permitir edición manual.

---

## 12. Construcción del pool global

El pool global se construye con:

```ts
globalPool = mergePools(manualItems, randomGlobalItems)
```

Reglas:

* No duplicados por `type + externalId`.
* Mantener metadata de quién lo agregó.
* Validar que no esté vacío.
* Permitir eliminar items antes de iniciar.

Implementar:

```ts
addManualItem(playerId, item)
addPlayerRandomItem(playerId, item)
removeItem(itemId)
isDuplicate(item)
buildGlobalPool()
mergePools(manualItems, randomGlobalItems)
```

---

## 13. Inicio del juego

Cuando se inicia:

* Construir pool global.
* Crear equipos si es modo individual o equipos.
* Elegir al azar equipo inicial.
* Elegir al azar jugador inicial dentro del equipo.
* Iniciar Acto 1.
* Crear `remainingItemIds` con todos los items del pool.
* Elegir primer item random.

Implementar:

```ts
startGame()
initializeAct(actNumber)
selectRandomStartingTeam()
selectRandomPlayerFromTeam(teamId)
selectNextItem()
```

---

## 14. Sistema de actos

Hay 3 actos:

```ts
const ACTS = {
  1: { label: "3 palabras", instruction: "Describe usando máximo 3 palabras" },
  2: { label: "1 palabra", instruction: "Describe usando solo 1 palabra" },
  3: { label: "Mímica", instruction: "No hables, solo actúa" }
};
```

Reglas:

* Cada acto inicia con todos los items del pool disponibles.
* Dentro del acto:

  * Si un item se acierta, se elimina del pool del acto.
  * Si se pasa, no se elimina.
* El acto termina cuando `remainingItemIds.length === 0`.
* Al terminar acto:

  * Mostrar resumen.
  * Si era acto 1, pasar a acto 2.
  * Si era acto 2, pasar a acto 3.
  * Si era acto 3, terminar juego.

Implementar:

```ts
handleCorrect()
handleSkip()
finishAct()
goToNextAct()
finishGame()
```

---

## 15. Lógica de turnos

Cada turno:

* Tiene cronómetro de 60 segundos.
* El usuario puede dar Play/Pause.
* El turno termina cuando el timer llega a 0.
* Al terminar turno:

  * Cambia al siguiente equipo/jugador.
  * Se selecciona otro item random disponible.

Acciones:

### Acertado

* Suma 1 punto al equipo/jugador actual.
* Remueve item de `remainingItemIds`.
* Agrega item a `completedItemIds`.
* Selecciona siguiente item.
* Si ya no quedan items, termina el acto.

### Paso

* No suma punto.
* No elimina item del acto.
* Cambia a otro item.
* Evitar que salga el mismo inmediatamente si hay más opciones.

Implementar:

```ts
startTimer()
pauseTimer()
resetTimer()
onTimerEnd()
nextTurn()
handleCorrect()
handleSkip()
selectNextItemAvoidingCurrent()
```

---

## 16. Rotación de turnos

### En modo equipos

Rotar:

1. Equipo actual -> siguiente equipo.
2. Jugador dentro del equipo -> siguiente jugador de ese equipo en su próximo turno.

### En modo individual

Cada jugador funciona como equipo individual.

Implementar:

```ts
getNextTeamId()
getNextPlayerIdForTeam(teamId)
```

Debe ser determinista y justo.

---

## 17. Puntaje

Reglas:

* Cada acierto vale 1 punto.
* El punto se asigna al equipo actual.
* En modo individual, se asigna al jugador/equipo individual.
* El puntaje se acumula durante los 3 actos.
* Al final se calcula:

  * Ganador único.
  * Empate.

Implementar:

```ts
addPoint(teamId)
calculateRanking()
calculateWinner()
isTie()
```

---

## 18. Persistencia local

Guardar automáticamente:

* Jugadores
* Equipos
* Configuración
* Items manuales
* Items random globales
* Pool global
* Estado de partida opcional
* Puntajes
* Acto actual
* Turno actual

Implementar:

```ts
saveGame()
loadGame()
clearGame()
saveConfig()
loadConfig()
resetGameKeepingConfig()
resetGameEditingPlayers()
```

Usar localStorage para MVP o IndexedDB si el estado crece.

Debe existir versionado:

```ts
type PersistedGame = {
  version: number;
  savedAt: string;
  state: GameState;
};
```

---

## 19. Opciones de volver a jugar

Al terminar el juego, permitir:

1. Volver a jugar con la misma configuración.
2. Volver a jugar con mismos jugadores/equipos pero nuevo contenido.
3. Editar jugadores/equipos.
4. Editar contenido.
5. Nuevo juego desde cero.

Implementar:

```ts
replaySameConfig()
replaySamePlayersNewContent()
editTeamsAndPlayers()
startNewGame()
```

---

## 20. UI mínima funcional para MVP

Construir pantallas:

1. Inicio
2. Crear jugadores
3. Seleccionar modo
4. Crear/editar equipos
5. Configurar categoría/cantidad
6. Agregar contenido por participante
7. Random global
8. Revisar pool
9. Pantalla de juego/ronda
10. Resumen de acto
11. Resultados finales
12. Configuraciones guardadas

---

## 21. Componentes sugeridos

Crear componentes:

```txt
PlayerForm
PlayerCard
AvatarPicker
ModeSelector
TeamBuilder
TeamCard
CategorySelector
ItemsPerPlayerSelector
MediaAutocomplete
MediaSearchResult
PlayerContentStep
RandomButton
RandomGlobalGenerator
PoolReview
GameRoundScreen
TimerControls
ScoreBoard
ActSummary
FinalResults
SavedGamesList
```

---

## 22. Validaciones

Implementar validaciones:

* No iniciar sin jugadores suficientes.
* Mínimo recomendado:

  * Individual: 2 jugadores
  * Equipos: mínimo 2 equipos con jugadores
* No iniciar con pool vacío.
* No duplicados en pool.
* No exceder cantidad por participante.
* No equipos vacíos.
* No nombres vacíos.
* Manejo de errores de API.
* Manejo de estado sin conexión/fallback.

---

## 23. Random global detallado

Implementar:

```ts
generateGlobalRandomPool(category, totalItems, excludeIds)
```

Debe:

* Respetar categoría.
* Obtener N items únicos.
* Usar paginación si la API devuelve pocos resultados.
* Excluir items ya existentes.
* Preferir items con poster.
* Mezclar resultados.
* Retornar items normalizados.

Pseudo:

```ts
async function generateGlobalRandomPool(category, totalItems, excludeIds) {
  const pool = new Map();

  while (pool.size < totalItems && attempts < MAX_ATTEMPTS) {
    const page = getRandomPage();
    const results = await discover(category, page);

    for (const raw of shuffle(results)) {
      const item = normalize(raw);

      if (!item.posterUrl) continue;
      if (excludeIds.includes(getUniqueMediaKey(item))) continue;
      if (pool.has(getUniqueMediaKey(item))) continue;

      pool.set(getUniqueMediaKey(item), {
        ...item,
        source: "random-global"
      });

      if (pool.size >= totalItems) break;
    }

    attempts++;
  }

  return Array.from(pool.values());
}
```

---

## 24. Random por participante detallado

Implementar:

```ts
getRandomContentForPlayer(playerId, category)
```

Debe:

* Revisar límite del participante.
* Obtener un item random.
* Validar duplicado global.
* Agregar con:

```ts
source: "player-random"
addedByPlayerId: playerId
```

---

## 25. Reglas de UX en desarrollo

La app debe:

* Sentirse rápida.
* No bloquear al usuario sin feedback.
* Mostrar loaders.
* Mostrar errores claros.
* Tener botones grandes.
* Tener diseño mobile-first.
* Tener animaciones ligeras.
* Guardar automáticamente.

---

## 26. Testing mínimo

Agregar pruebas unitarias para:

* Generación de equipos balanceados.
* Merge de pools sin duplicados.
* Add item manual.
* Random item no duplicado.
* Correct remueve item del acto.
* Skip no remueve item.
* Cambio de acto.
* Cálculo de ganador.
* Empate.
* Replay con misma configuración.

---

## 27. README esperado

Crear README con:

* Descripción del juego.
* Instalación.
* Variables de entorno.
* Cómo configurar API.
* Cómo correr local.
* Cómo correr tests.
* Arquitectura.
* Reglas del juego.
* Limitaciones del MVP.
* Próximos pasos.

Incluir `.env.example`:

```env
TMDB_API_KEY=
TMDB_ACCESS_TOKEN=
```

Si usas Next.js:

```env
TMDB_ACCESS_TOKEN=
```

Evita exponer tokens privados en cliente.

---

## 28. Criterios de aceptación

El MVP se considera completo cuando:

* Puedo crear jugadores ilimitados.
* Puedo editar nombres y avatares.
* Puedo elegir individual o equipos.
* En equipos, la app propone equipos automáticamente.
* Puedo editar equipos e integrantes.
* Puedo guardar configuración local.
* Puedo elegir categoría: películas, series o ambos.
* Puedo elegir cantidad por jugador: 1 a 4 o ilimitado.
* Cada participante puede agregar contenido con autocomplete.
* Cada participante puede usar botón random.
* Existe random global por categoría.
* Puedo combinar contenido manual y random global.
* No hay duplicados en el pool.
* El juego inicia con equipo/jugador aleatorio.
* Existen 3 actos.
* Cada turno tiene cronómetro de 60 segundos con play/pause.
* “Acertado” suma punto y remueve item del acto.
* “Paso” cambia item sin removerlo.
* Cada acto termina cuando se acaban los items.
* Al cambiar de acto, los items vuelven a estar disponibles.
* Al final se calcula ganador o empate.
* Puedo volver a jugar con la misma configuración.
* Puedo editar participantes/equipos/contenido.
* La app funciona local-first.
* El código está modularizado y no concentrado en un solo componente.

---

## 29. Prioridad de implementación

Implementa en este orden:

1. Modelos de datos.
2. Store global.
3. Persistencia local.
4. Jugadores.
5. Equipos.
6. Configuración.
7. Servicios de búsqueda/media.
8. Agregar contenido por participante.
9. Random individual.
10. Random global.
11. Pool global.
12. Game engine.
13. Timer.
14. Pantalla de ronda.
15. Act summary.
16. Resultados.
17. Replay.
18. Tests.
19. README.

No empieces por animaciones. Primero lógica correcta, después pulido visual.

---

## 30. Entregable final

Entrega el proyecto funcional con:

* Código limpio.
* Tipos TypeScript.
* Componentes separados.
* Lógica de dominio separada.
* Persistencia local.
* Servicios API desacoplados.
* Tests mínimos.
* README.
* `.env.example`.

No entregues pseudocódigo únicamente. Construye un MVP real ejecutable.

```

---

Recomendación concreta: usa primero el prompt de diseño para obtener el flujo visual completo, y después pega el prompt de desarrollo en Claude Code para implementar el MVP con prioridad en **game engine + persistencia + pool de películas/series** antes de pulir animaciones.
```
