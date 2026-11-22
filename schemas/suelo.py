"""Contrato del formulario agrícola. Vacío significa no determinado, nunca cero."""
from datetime import date
import re
import unicodedata
from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator, field_validator


def validate_text(value):
    if isinstance(value, str) and ('<' in value or '>' in value or any(unicodedata.category(c) == 'Cc' and c not in '\n\r\t' for c in value)):
        raise ValueError('Escribe texto sin etiquetas HTML ni caracteres de control.')
    return value


def allowed_units(key):
    if key == 'ph':
        return {'Sin unidad'}
    if key == 'ec':
        return {'dS/m', 'mS/cm', 'µS/cm'}
    if key in {'mo', 'n_total', 'sat_bases', 'sat_al', 'psi'}:
        return {'%'}
    if key in {'n_nitrato', 'n_amonio', 'p'}:
        return {'mg/kg', 'ppm'}
    if key in {'cic', 'cic_efectiva'}:
        return {'cmol(+)/kg', 'meq/100g'}
    return {'cmol(+)/kg', 'meq/100g', 'mg/kg', 'ppm'}

NonNegative = Annotated[float, Field(ge=0, allow_inf_nan=False)]
Percentage = Annotated[float, Field(ge=0, le=100, allow_inf_nan=False)]


class ResultadoSuelo(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    valor: NonNegative | None = None
    unidad: str = Field(default='', max_length=50)
    metodo: str = Field(default='', max_length=500)

    @field_validator('metodo')
    @classmethod
    def clean_method(cls, value):
        return validate_text(value)

    @model_validator(mode='after')
    def require_unit(self):
        if self.valor is not None and not self.unidad:
            raise ValueError('Indica la unidad del resultado.')
        if self.valor is not None and not self.metodo:
            raise ValueError('Indica el método del informe para este resultado.')
        if self.valor is not None and self.unidad == '%' and self.valor > 100:
            raise ValueError('Un porcentaje no puede superar 100.')
        return self


class FormularioSuelo(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True, str_max_length=2000)
    numero_muestra: str = Field(min_length=1, max_length=50)
    productor_finca: str | None = None
    lote_sector: str = Field(min_length=1, max_length=100)
    ubicacion: str | None = None
    geolocalizacion: str | None = Field(default=None, max_length=100)
    superficie_ha: NonNegative | None = None
    fecha_muestreo: date
    responsable_muestreo: str | None = None
    profundidad_desde: NonNegative | None = None
    profundidad_hasta: NonNegative | None = None
    tipo_muestra: Literal['Simple', 'Compuesta'] | None = None
    numero_submuestras: Annotated[int, Field(ge=1)] | None = None
    cultivo: str = Field(min_length=1, max_length=100)
    sistema_produccion: Literal['Secano', 'Riego'] | None = None
    aplicaciones_recientes: str | None = None
    textura: str | None = Field(default=None, max_length=50)
    determinacion_textura: Literal['Laboratorio', 'Estimación en campo'] | None = None
    arena: Percentage | None = None
    limo: Percentage | None = None
    arcilla: Percentage | None = None
    humedad_campo: Literal['Seco', 'Húmedo', 'Saturado'] | None = None
    drenaje: Literal['Bueno', 'Moderado', 'Deficiente'] | None = None
    compactacion: Literal['Sí', 'No', 'No evaluado'] | None = None
    erosion: Literal['Sí', 'No', 'No evaluado'] | None = None
    observaciones_campo: str | None = None
    laboratorio: str | None = None
    numero_informe: str | None = None
    fecha_informe: date | None = None
    referencia_interpretacion: str | None = None
    interpretacion_ph: str | None = None
    nivel_mo: Literal['Baja', 'Adecuada', 'Alta', 'Sin interpretar'] | None = None
    nivel_p: Literal['Bajo', 'Adecuado', 'Alto', 'Sin interpretar'] | None = None
    nivel_k: Literal['Bajo', 'Adecuado', 'Alto', 'Sin interpretar'] | None = None
    otros_nutrientes: str | None = None
    salinidad: str | None = None
    sodicidad: str | None = None
    limitantes_fisicas: str | None = None
    resultados: dict[str, ResultadoSuelo] = Field(default_factory=dict)

    @field_validator('*')
    @classmethod
    def clean_fields(cls, value, info):
        validate_text(value)
        if isinstance(value, str):
            max_length = 2000 if info.field_name in {'aplicaciones_recientes', 'observaciones_campo'} else 500
            if len(value) > max_length:
                raise ValueError(f'Usa hasta {max_length} caracteres.')
        return value

    @field_validator('numero_muestra', 'numero_informe')
    @classmethod
    def valid_identifier(cls, value):
        if value and (not value[0].isalnum() or any(not c.isalnum() and c not in ' ._/-' for c in value)):
            raise ValueError('Usa letras, números, espacios, guiones, punto o barra. Ejemplo: M-001.')
        return value

    @field_validator('productor_finca', 'responsable_muestreo', 'cultivo', 'laboratorio')
    @classmethod
    def valid_name(cls, value):
        if value and not any(c.isalpha() for c in value):
            raise ValueError('Escribe un nombre que contenga letras.')
        return value

    @field_validator('geolocalizacion')
    @classmethod
    def valid_coordinates(cls, value):
        if value:
            match = re.fullmatch(r'\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*', value)
            if not match or abs(float(match[1])) > 90 or abs(float(match[2])) > 180:
                raise ValueError('Usa latitud (-90 a 90), longitud (-180 a 180). Ejemplo: -16.5520, -68.1650.')
        return value

    @model_validator(mode='after')
    def validate_measurements(self):
        if self.fecha_informe and self.fecha_informe < self.fecha_muestreo:
            raise ValueError('La fecha del informe no puede ser anterior al muestreo.')
        if all(value is not None for value in (self.arena, self.limo, self.arcilla)) and abs(self.arena + self.limo + self.arcilla - 100) > 0.5:
            raise ValueError('Arena, limo y arcilla deben sumar 100 % (tolerancia de 0,5).')
        if self.profundidad_desde is not None and self.profundidad_hasta is not None and self.profundidad_hasta < self.profundidad_desde:
            raise ValueError('La profundidad hasta debe ser mayor o igual que la profundidad desde.')
        allowed = {'ph', 'ec', 'mo', 'n_total', 'n_nitrato', 'n_amonio', 'p', 'k', 'ca', 'mg', 'na', 'al', 'cic', 'cic_efectiva', 'sat_bases', 'sat_al', 'psi'}
        if self.resultados.keys() - allowed:
            raise ValueError('Parámetro de laboratorio desconocido.')
        for key, reading in self.resultados.items():
            if reading.unidad not in allowed_units(key):
                raise ValueError(f'Unidad incompatible para {key}.')
        ph = self.resultados.get('ph')
        if ph and ph.valor is not None and ph.valor > 14:
            raise ValueError('El pH debe estar entre 0 y 14.')
        return self
