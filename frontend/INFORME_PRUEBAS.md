# Informe de pruebas

## Resumen

Se desarrollaron las pruebas unitarias de las páginas del frontend siguiendo un flujo de trabajo orientado a TDD. La entrega se centró en primero definir el comportamiento esperado de cada pantalla y luego ajustar la implementación para que esas pruebas fueran consistentes y estables.

## Qué se hizo en TDD

- Se revisaron las páginas de `src/pages` para identificar el comportamiento mínimo que debían cubrir.
- Se creó una prueba por cada vista principal con foco en lo visible y en las interacciones básicas.
- Se validó la renderización inicial, textos clave, cambios de inputs y clics cuando eran relevantes.
- Se ajustaron los mocks para escenarios específicos como carga asíncrona, geolocalización y rendering de mapas, sin sobrecomplejizar la lógica de prueba.
- Se ejecutó la suite para verificar que cada caso había quedado cubierto y que los componentes respondían como se esperaba.

## Archivos de prueba creados

- `src/pages/test/GestionBancos.test.jsx`
- `src/pages/test/HomeBanco.test.jsx`
- `src/pages/test/HomeDonante.test.jsx`
- `src/pages/test/HomeSuperAdmin.test.jsx`
- `src/pages/test/InventarioBanco.test.jsx`
- `src/pages/test/Login.test.jsx`
- `src/pages/test/MapaBancos.test.jsx`
- `src/pages/test/Registro.test.jsx`
- `src/pages/test/Reportes.test.jsx`
- `src/pages/test/SolicitudesBanco.test.jsx`
- `src/pages/test/Urgencias.test.jsx`

## Resultado verificado

La validación final se ejecutó con:

```bash
npm test -- --run
```

Resultado confirmado:

- 11 archivos de prueba pasados
- 15 pruebas pasadas
- 0 fallos

La suite quedó en verde y sirve como base sólida para continuar agregando pruebas más específicas en el futuro. No se hizo una cobertura excesivamente profunda, pero sí se dejó una capa útil de validación para asegurar que las pantallas principales sigan renderizando bien y respondiendo a interacciones básicas.

## Nota final

Durante la ejecución también fue necesario resolver ajustes de entorno, como la configuración de `jsdom` y la estabilización de algunos mocks, para que la suite pudiera ejecutarse en condiciones reales del proyecto. Una vez corregido eso, la validación quedó estable y en verde.
