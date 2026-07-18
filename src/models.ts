/**
 * Modelos de datos para el sistema de análisis de enlaces ferroviarios
 */

export interface Link {
  draft: number | null; // distance
  core: number | null; // distance
  reviewed: boolean;
}

export interface Area {
  draftMin: number;
  coreMin: number;
  draftMax: number;
  coreMax: number;
}
