# SQL OVA Frontend — Design Spec

**Date:** 2026-05-29  
**Branch:** feature/app-sql-frontend  
**Status:** Approved

---

## Overview

Frontend Angular 21 para un OVA (Objeto Virtual de Aprendizaje) de SQL. El usuario selecciona una dificultad, recibe un ejercicio aleatorio con esquemas de tablas, escribe una query SQL en un editor enriquecido y obtiene feedback inmediato con comparación de resultados.

**Backend API base:** `http://localhost:3000/api/v1`  
**Audiencia:** estudiantes universitarios y desarrolladores con experiencia variable.

---

## Architecture

### Stack técnico

- Angular 21 standalone components + signals
- Angular Router (2 rutas)
- CodeMirror 6 con `@codemirror/lang-sql` para el editor
- `provideHttpClient` para llamadas HTTP
- CSS puro con custom properties para theming (sin librería UI)
- Fuentes: `Inter` (UI) + `JetBrains Mono` (editor/código)

### Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `HomeComponent` | Selector de dificultad |
| `/exercise` | `ExerciseComponent` | Vista split del ejercicio activo |

La dificultad se pasa via **Angular Router state** (`history.state.difficulty`) — no en la URL.

### Estructura de carpetas

```
src/app/
  core/
    services/
      exercise.service.ts
      theme.service.ts
    models/
      exercise.model.ts
  pages/
    home/
      home.component.ts
      home.component.html
      home.component.css
    exercise/
      exercise.component.ts
      exercise.component.html
      exercise.component.css
  shared/
    components/
      result-table/
        result-table.component.ts
        result-table.component.html
        result-table.component.css
      sql-editor/
        sql-editor.component.ts
        sql-editor.component.html
        sql-editor.component.css
      schema-viewer/
        schema-viewer.component.ts
        schema-viewer.component.html
        schema-viewer.component.css
```

---

## Components

### HomeComponent (`/`)

- Header con nombre del OVA y toggle dark/light
- Tres tarjetas de dificultad: **Fácil** (verde) / **Medio** (ámbar) / **Difícil** (rojo)
- Cada tarjeta tiene borde izquierdo de color, ícono, nombre y descripción breve del nivel
- Click en tarjeta navega a `/exercise` con `{ state: { difficulty } }`

### ExerciseComponent (`/exercise`) — split layout

```
┌─────────────────────────────────────────────────────┐
│  Header: título OVA + badge dificultad + toggle tema │
├─────────────────────┬───────────────────────────────┤
│  PANEL IZQUIERDO    │  PANEL DERECHO                 │
│  (40%)              │  (60%)                         │
│                     │                                │
│  Título ejercicio   │  [Editor CodeMirror SQL]       │
│  Descripción        │                                │
│  [Ver pista ▾]      │  [Ejecutar query]              │
│                     │                                │
│  ── Tablas ──       │  ── Resultado ──               │
│  [Tab: tabla1]      │  ✅/❌ mensaje feedback        │
│  [Tab: tabla2]      │  Tabla: tu resultado           │
│  CREATE TABLE...    │  Tabla: resultado esperado     │
│  datos de ejemplo   │  (solo si correct: false y     │
│                     │   sin executionError)          │
│                     │  Bloque error SQL destacado    │
│                     │                                │
│                     │  [Siguiente ejercicio →]       │
└─────────────────────┴───────────────────────────────┘
```

En pantallas < 768px: panel izquierdo colapsa encima del editor.

### SqlEditorComponent

- Wrappea CodeMirror 6 con soporte SQL
- Tema `githubLight` en light mode, `oneDark` en dark mode
- Emite `(queryChange): EventEmitter<string>` con el texto actual
- Input `[readonly]` para bloquear durante la evaluación

### ResultTableComponent

- Input: `data: { columns: string[], rows: any[][] } | null`
- Renderiza `<table>` con scroll horizontal
- Muestra estado vacío si `data` es null

### SchemaViewerComponent

- Input: `tables: ExerciseTable[]`
- Tabs por cada tabla (usando `tableName` como label, ordenado por `displayOrder`)
- Dentro de cada tab: bloque `CREATE TABLE` y bloque `INSERT` en `<pre><code>` con scroll

---

## Services

### ExerciseService

```typescript
getRandom(difficulty?: string): Observable<Exercise>
// GET /exercises/random?difficulty=...

evaluate(exerciseId: string, userQuery: string): Observable<EvaluationResult>
// POST /evaluation  { exerciseId, userQuery }
```

Base URL inyectada como token o constante `API_BASE = 'http://localhost:3000/api/v1'`.

### ThemeService

```typescript
theme: Signal<'light' | 'dark'>
toggle(): void
```

- Al init: lee `localStorage.getItem('theme')`, hace fallback a `'light'`
- Al toggle: actualiza signal, persiste en `localStorage`, aplica `document.documentElement.setAttribute('data-theme', theme)`

---

## Data Models

```typescript
interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
  orderMatters: boolean;
  tables: ExerciseTable[];
}

interface ExerciseTable {
  id: string;
  tableName: string;
  createStatement: string;
  insertStatement: string;
  displayOrder: number;
}

interface QueryResult {
  columns: string[];
  rows: any[][];
}

interface EvaluationResult {
  correct: boolean;
  feedback: string;
  userResult: QueryResult | null;
  expectedResult: QueryResult | null;
  executionError: string | null;
}
```

---

## Data Flow

```
1. Home → usuario click dificultad
        → router.navigate(['/exercise'], { state: { difficulty } })

2. ExerciseComponent.ngOnInit
        → lee difficulty de router.getCurrentNavigation().extras.state
        → exerciseService.getRandom(difficulty).subscribe(...)
        → almacena en signal<Exercise | null>

3. Usuario escribe SQL en SqlEditorComponent
        → (queryChange) actualiza signal<string> en ExerciseComponent

4. Click "Ejecutar query"
        → loading.set(true)
        → exerciseService.evaluate(exercise.id, userQuery).subscribe(...)
        → evaluationResult.set(result)
        → loading.set(false)

5. Template reacciona a signals:
        → correct=true               → banner ✅ verde + userResult table
        → correct=false + error      → banner ❌ rojo + bloque error destacado
        → correct=false + sin error  → banner ❌ rojo + userResult + expectedResult

6. Click "Siguiente ejercicio"
        → exerciseService.getRandom(difficulty).subscribe(...)
        → userQuery.set('')
        → evaluationResult.set(null)
```

---

## Theming

### CSS Custom Properties

```css
/* light (default) */
:root {
  --bg-primary: #f8fafc;
  --bg-surface: #ffffff;
  --bg-editor: #f1f5f9;
  --text-primary: #0f172a;
  --text-muted: #64748b;
  --accent: #6366f1;
  --success: #22c55e;
  --error: #ef4444;
  --border: #e2e8f0;
}

/* dark */
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-surface: #1e293b;
  --bg-editor: #0d1117;
  --text-primary: #f1f5f9;
  --text-muted: #94a3b8;
  --accent: #818cf8;
  --border: #334155;
}
```

### Convenciones visuales

- Bordes redondeados: `8px` (cards), `12px` (paneles)
- Cards de dificultad: borde izquierdo `4px solid` con color del nivel + hover con `box-shadow` sutil
- Feedback banner: fondo suave (`success/10%` o `error/10%`), ícono grande, texto del campo `feedback` del API
- Editor CodeMirror: tema `@codemirror/theme-one-dark` en dark, tema claro en light
- Bloques de código SQL en SchemaViewer: `<pre>` con `--bg-editor`, fuente monospace, scroll horizontal

---

## Dependencies to Install

```bash
npm install @codemirror/view @codemirror/state @codemirror/lang-sql @codemirror/theme-one-dark
```

---

## Out of Scope

- Autenticación / sesión de usuario
- Historial de intentos
- Lista de ejercicios completados
- Backend / base de datos
