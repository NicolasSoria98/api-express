# Parcial – Desarrollo de API en Node.js con Express y JSON
## Problema: "La Academia de Aventureros"

Tu tarea es desarrollar una API para administrar una academia de aventureros. Los aventureros completan misiones y mejoran sus estadísticas según reglas simples.

Toda la información debe almacenarse en un único archivo JSON.  
No se permite usar bases de datos reales.

---

## 1. Contexto General

En la Academia de Aventureros, los estudiantes toman misiones para ganar experiencia y subir de nivel.

Debes desarrollar una API que permita:

1. Administrar Aventureros.  
2. Administrar Misiones.  
3. Permitir que los Aventureros completen misiones.  

Toda la información se almacenará en un archivo llamado `academy.json` con estructura inicial:
```json
{
  "adventurers": [],
  "missions": []
}
```

---

## 2. Reglas del Sistema

### 2.1 Aventureros

Un Aventurero posee:

- id  
- name  
- level (inicia en 1)  
- experience (inicia en 0)  
- stamina (inicia en 100)  
- skills (array de strings)

### 2.2 Fórmula de Nivel

Cada vez que la experiencia de un aventurero cambie, se debe evaluar:
```
Experiencia necesaria para subir = level * 100

Si experience >= (level * 100):
    subir un nivel
    experience = experience - (level * 100)
```

Pueden ocurrir múltiples subidas de nivel si la experiencia es suficiente.

### 2.3 Misiones

Cada misión posee:

- id  
- title  
- difficulty (1 a 10)  
- staminaCost  
- rewardFormula (string con una fórmula matemática)  
- requiredSkill (palabra clave)

Ejemplos de fórmulas:

- "difficulty * 10 + staminaCost * 2"  
- "difficulty^2 + staminaCost"  

La fórmula debe evaluarse de forma segura. No se permite usar eval.

---

## 3. Completar Misión

Cuando un aventurero intenta completar una misión:

1. Debe tener suficiente stamina.  
2. Debe poseer la skill requerida.  
3. Se descuenta la stamina del aventurero:  
```
   adventurer.stamina -= staminaCost
```
4. Se calcula la experiencia otorgada evaluando la fórmula de la misión.  
5. Si la dificultad de la misión es mayor que el nivel del aventurero + 2:  
   - El aventurero falla la misión.  
   - Pierde stamina adicional:  
```
     penalty = difficulty * 5
     adventurer.stamina -= penalty
```
   - No gana experiencia.  
   - Retornar estado "failed".  

6. Si la misión se completa con éxito:  
   - El aventurero gana la experiencia calculada.  
   - Se aplica la fórmula de subida de nivel.  
   - Retornar estado "success".

---

## 4. Consignas de Implementación

### 4.1 Estructura del Proyecto

La API debe utilizar:

- Node.js  
- Express  
- fs.promises para lectura y escritura del JSON  
- Middleware global de logging  
- Manejo de errores centralizado  
- Arquitectura separada en capas:
  - routes  
  - controllers  
  - services  
  - repositories  

No se permite duplicar lógica entre controllers y services.

### 4.2 Endpoints Obligatorios

#### Aventureros

- POST `/adventurers`  
- GET `/adventurers` (con filtros opcionales: skill, nivel mínimo)  
- PATCH `/adventurers/:id/stamina` (recuperar stamina)

#### Misiones

- POST `/missions`  
- GET `/missions` (con filtros opcionales: dificultad, skill requerida)  
- POST `/missions/:missionId/complete/:adventurerId`

---

## 5. Requisitos Técnicos

- No se permite usar eval para fórmulas.  
- No se permiten console.log en la entrega final (excepto en logger).  
- La lógica matemática debe estar en los services.  
- Se debe crear al menos una función utilitaria para cálculos en `utils/formulas.js`.  
- El sistema debe manejar el caso en que el JSON esté corrupto.  

---

## 6. Puntaje Sugerido

| Sección | Puntos |
|--------|--------|
| Arquitectura y modularización | 25 |
| Gestión de Aventureros | 25 |
| Gestión de Misiones | 25 |
| Completar misión con lógica | 20 |
| Calidad del código | 5 |
| Total | 100 |

---

## 7. Pistas de Implementación

### Pista 1: Estructura de Archivos
```
src/
├── controllers/
│   ├── adventurerController.js
│   └── missionController.js
├── services/
│   ├── adventurerService.js
│   └── missionService.js
├── repositories/
│   ├── adventurerRepository.js
│   └── missionRepository.js
├── routes/
│   ├── adventurerRoutes.js
│   └── missionRoutes.js
├── utils/
│   └── formulas.js
├── middlewares/
│   ├── logger.js
│   └── errorHandler.js
└── data/
    └── academy.json
server.js
```

### Pista 2: Funciones en utils/formulas.js
Necesitarás solo 2 funciones:
1. `evaluarFormula(formula, variables)` - Para rewardFormula
2. `calculateLevelUp(adventurer)` - Para subir niveles
```javascript
function evaluarFormula(formula, variables) {
    // Reemplazar variables
    let expresion = formula;
    expresion = expresion.split('difficulty').join(variables.difficulty);
    expresion = expresion.split('staminaCost').join(variables.staminaCost);
    expresion = expresion.split('^').join('**');
    
    // Calcular
    return calcularExpresion(expresion);
}

function calculateLevelUp(adventurer) {
    let level = adventurer.level;
    let experience = adventurer.experience;
    
    while (experience >= level * 100) {
        experience = experience - (level * 100);
        level = level + 1;
    }
    
    return { level: level, experience: experience };
}
```

### Pista 3: Completar Misión (missionService.js)
```javascript
async function completeMission(missionId, adventurerId) {
    // 1. Obtener misión y aventurero
    // 2. Validar stamina suficiente
    // 3. Validar skill requerida
    // 4. Descontar staminaCost
    // 5. Verificar si falla (difficulty > level + 2)
    // 6. Si falla: penalización, return {status: 'failed'}
    // 7. Si éxito: calcular XP, aplicar levelUp, return {status: 'success'}
}
```

### Pista 4: Endpoints de Ejemplo

**POST /adventurers**
```json
{
  "name": "Luna",
  "skills": ["Combate", "Magia"]
}
```

**POST /missions**
```json
{
  "title": "Rescate en el Bosque",
  "difficulty": 3,
  "staminaCost": 20,
  "rewardFormula": "difficulty * 10 + staminaCost * 2",
  "requiredSkill": "Combate"
}
```

**POST /missions/1/complete/1**
Sin body

**PATCH /adventurers/1/stamina**
```json
{
  "amount": 30
}
```

**GET /adventurers?skill=Magia**
**GET /adventurers?minLevel=2**

**GET /missions?difficulty=3**
**GET /missions?requiredSkill=Combate**

### Pista 5: academy.json inicial
```json
{
  "adventurers": [
    {
      "id": 1,
      "name": "Luna",
      "level": 1,
      "experience": 0,
      "stamina": 100,
      "skills": ["Combate", "Magia"]
    }
  ],
  "missions": [
    {
      "id": 1,
      "title": "Rescate en el Bosque",
      "difficulty": 3,
      "staminaCost": 20,
      "rewardFormula": "difficulty * 10 + staminaCost * 2",
      "requiredSkill": "Combate"
    }
  ]
}
```

### Pista 6: Validaciones Importantes
- Stamina no puede ser negativo (mínimo 0)
- Level inicia en 1
- Experience inicia en 0
- Difficulty entre 1 y 10
- skills es un array

---

## 8. Ejemplo Completo Paso a Paso

**Aventurero:**
```json
{
  "id": 1,
  "name": "Luna",
  "level": 2,
  "experience": 50,
  "stamina": 80,
  "skills": ["Combate"]
}
```

**Misión:**
```json
{
  "id": 1,
  "title": "Rescate",
  "difficulty": 3,
  "staminaCost": 20,
  "rewardFormula": "difficulty * 10 + staminaCost * 2",
  "requiredSkill": "Combate"
}
```

**Proceso:**

1. ✅ Stamina: 80 >= 20 (suficiente)
2. ✅ Skill: Tiene "Combate"
3. Descontar: 80 - 20 = 60
4. ¿Falla? 3 > 2 + 2 (4)? NO
5. Calcular XP: `3 * 10 + 20 * 2 = 70`
6. Experience: 50 + 70 = 120
7. ¿Sube nivel? 120 >= 2 * 100 (200)? NO
8. Se queda nivel 2 con 120 XP

**Respuesta:**
```json
{
  "status": "success",
  "experienceGained": 70,
  "adventurer": {
    "id": 1,
    "name": "Luna",
    "level": 2,
    "experience": 120,
    "stamina": 60,
    "skills": ["Combate"]
  }
}
```

---

## ✅ CHECKLIST FINAL

Antes de entregar verifica:

### Arquitectura (25 pts)
- [ ] 4 carpetas: controllers, services, repositories, routes
- [ ] utils/formulas.js con 2 funciones
- [ ] Middleware logger
- [ ] Middleware errorHandler
- [ ] No hay lógica duplicada

### Aventureros (25 pts)
- [ ] POST /adventurers crea aventurero
- [ ] GET /adventurers lista todos
- [ ] GET /adventurers?skill= filtra por skill
- [ ] GET /adventurers?minLevel= filtra por nivel
- [ ] PATCH /adventurers/:id/stamina recupera stamina
- [ ] Stamina no negativa

### Misiones (25 pts)
- [ ] POST /missions crea misión
- [ ] GET /missions lista todas
- [ ] GET /missions?difficulty= filtra
- [ ] GET /missions?requiredSkill= filtra
- [ ] Validaciones de campos

### Completar Misión (20 pts)
- [ ] Valida stamina
- [ ] Valida skill requerida
- [ ] Descuenta staminaCost
- [ ] Falla si difficulty > level + 2
- [ ] Penalización correcta (difficulty * 5)
- [ ] Calcula XP con fórmula
- [ ] Aplica subida de nivel
- [ ] Retorna estado correcto

### Calidad (5 pts)
- [ ] Sin console.log (excepto logger)
- [ ] Sin errores de sintaxis
- [ ] Código limpio

---

## 🚀 ¡MUCHO ÉXITO!

**Tiempo:** 2 horas

**Estrategia recomendada:**
1. **15 min:** Crear estructura de carpetas y archivos vacíos
2. **30 min:** Implementar Aventureros (CRUD básico)
3. **20 min:** Implementar Misiones (CRUD básico)
4. **15 min:** Crear utils/formulas.js
5. **30 min:** Implementar completar misión
6. **10 min:** Revisar y probar todo

**Cuando termines, envíame tu código para revisión. 🎯**