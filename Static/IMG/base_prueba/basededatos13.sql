--
-- PostgreSQL database dump
--

\restrict Z74BFURpnzKy72ChCoK2a3SK9kqedykdEjl7kh7rivW1hNILswdwMAtH6R735g4

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-10-06 22:33:48

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 240 (class 1259 OID 57527)
-- Name: alerta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alerta (
    id_alerta integer NOT NULL,
    id_invernadero integer,
    tipo_alerta character varying(50),
    descripcion text,
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_estado integer,
    id_referencia integer,
    tipo_origen character varying(50),
    severidad character varying(20),
    zona_especifica character varying(50)
);


ALTER TABLE public.alerta OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 57526)
-- Name: alerta_id_alerta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alerta_id_alerta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerta_id_alerta_seq OWNER TO postgres;

--
-- TOC entry 5360 (class 0 OID 0)
-- Dependencies: 239
-- Name: alerta_id_alerta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alerta_id_alerta_seq OWNED BY public.alerta.id_alerta;


--
-- TOC entry 260 (class 1259 OID 81958)
-- Name: analisis_suelo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analisis_suelo (
    id_analisis integer NOT NULL,
    id_invernadero integer,
    id_muestra character varying(50),
    fecha_muestreo date,
    lote_sector character varying(100),
    geolocalizacion character varying(100),
    cultivo character varying(100),
    profundidad character varying(50),
    ph numeric(4,2),
    ec numeric(10,4),
    co2 numeric(10,2),
    materia_organica numeric(5,2),
    nitrogeno_total numeric(10,2),
    fosforo_disponible numeric(10,2),
    potasio_intercambiable numeric(10,2),
    calcio numeric(10,2),
    magnesio numeric(10,2),
    sodio numeric(10,2),
    cic numeric(10,2),
    saturacion_bases numeric(5,2),
    saturacion_aluminio numeric(5,2),
    textura character varying(50),
    densidad_aparente numeric(5,2),
    humedad_actual numeric(5,2),
    estado_balance character varying(50),
    recomendacion_enmienda text,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.analisis_suelo OWNER TO postgres;

--
-- TOC entry 5361 (class 0 OID 0)
-- Dependencies: 260
-- Name: TABLE analisis_suelo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.analisis_suelo IS 'Almacena el histórico de análisis químicos y físicos de suelos por invernadero';


--
-- TOC entry 259 (class 1259 OID 81957)
-- Name: analisis_suelo_id_analisis_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analisis_suelo_id_analisis_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analisis_suelo_id_analisis_seq OWNER TO postgres;

--
-- TOC entry 5362 (class 0 OID 0)
-- Dependencies: 259
-- Name: analisis_suelo_id_analisis_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analisis_suelo_id_analisis_seq OWNED BY public.analisis_suelo.id_analisis;


--
-- TOC entry 232 (class 1259 OID 57475)
-- Name: camara; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camara (
    id_camara integer NOT NULL,
    id_dispositivo integer,
    resolucion character varying(50),
    estado character varying(50)
);


ALTER TABLE public.camara OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 57474)
-- Name: camara_id_camara_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.camara_id_camara_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.camara_id_camara_seq OWNER TO postgres;

--
-- TOC entry 5363 (class 0 OID 0)
-- Dependencies: 231
-- Name: camara_id_camara_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.camara_id_camara_seq OWNED BY public.camara.id_camara;


--
-- TOC entry 250 (class 1259 OID 73852)
-- Name: ciclo_cultivo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ciclo_cultivo (
    id_ciclo integer NOT NULL,
    id_invernadero integer,
    id_especie integer,
    fecha_plantacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado_etapa character varying(30),
    activo boolean DEFAULT true
);


ALTER TABLE public.ciclo_cultivo OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 73851)
-- Name: ciclo_cultivo_id_ciclo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ciclo_cultivo_id_ciclo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ciclo_cultivo_id_ciclo_seq OWNER TO postgres;

--
-- TOC entry 5364 (class 0 OID 0)
-- Dependencies: 249
-- Name: ciclo_cultivo_id_ciclo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ciclo_cultivo_id_ciclo_seq OWNED BY public.ciclo_cultivo.id_ciclo;


--
-- TOC entry 262 (class 1259 OID 81974)
-- Name: configuracion_confort; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion_confort (
    id_config integer NOT NULL,
    id_tipo_sensor integer,
    valor_minimo numeric(10,2),
    valor_maximo numeric(10,2),
    descripcion_estado character varying(50),
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.configuracion_confort OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 81973)
-- Name: configuracion_confort_id_config_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.configuracion_confort_id_config_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configuracion_confort_id_config_seq OWNER TO postgres;

--
-- TOC entry 5365 (class 0 OID 0)
-- Dependencies: 261
-- Name: configuracion_confort_id_config_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuracion_confort_id_config_seq OWNED BY public.configuracion_confort.id_config;


--
-- TOC entry 256 (class 1259 OID 73900)
-- Name: consumo_energetico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumo_energetico (
    id_consumo integer NOT NULL,
    id_dispositivo integer,
    kwh numeric(10,3),
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.consumo_energetico OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 73899)
-- Name: consumo_energetico_id_consumo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consumo_energetico_id_consumo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consumo_energetico_id_consumo_seq OWNER TO postgres;

--
-- TOC entry 5366 (class 0 OID 0)
-- Dependencies: 255
-- Name: consumo_energetico_id_consumo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumo_energetico_id_consumo_seq OWNED BY public.consumo_energetico.id_consumo;


--
-- TOC entry 236 (class 1259 OID 57504)
-- Name: deteccion_plaga; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deteccion_plaga (
    id_deteccion integer NOT NULL,
    id_imagen integer,
    tipo_plaga character varying(50),
    nivel_confianza numeric(5,2),
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    x_min double precision,
    y_min double precision,
    x_max double precision,
    y_max double precision
);


ALTER TABLE public.deteccion_plaga OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 57503)
-- Name: deteccion_plaga_id_deteccion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deteccion_plaga_id_deteccion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deteccion_plaga_id_deteccion_seq OWNER TO postgres;

--
-- TOC entry 5367 (class 0 OID 0)
-- Dependencies: 235
-- Name: deteccion_plaga_id_deteccion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deteccion_plaga_id_deteccion_seq OWNED BY public.deteccion_plaga.id_deteccion;


--
-- TOC entry 222 (class 1259 OID 57405)
-- Name: dispositivo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispositivo (
    id_dispositivo integer NOT NULL,
    nombre character varying(50) NOT NULL,
    tipo character varying(50),
    estado character varying(20) NOT NULL,
    id_invernadero integer,
    categoria character varying(20),
    ubicacion character varying(100)
);


ALTER TABLE public.dispositivo OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 57404)
-- Name: dispositivo_id_dispositivo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dispositivo_id_dispositivo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dispositivo_id_dispositivo_seq OWNER TO postgres;

--
-- TOC entry 5368 (class 0 OID 0)
-- Dependencies: 221
-- Name: dispositivo_id_dispositivo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dispositivo_id_dispositivo_seq OWNED BY public.dispositivo.id_dispositivo;


--
-- TOC entry 268 (class 1259 OID 90134)
-- Name: especie_plaga; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.especie_plaga (
    id_especie integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion_tecnica text,
    imagen_referencia character varying(255)
);


ALTER TABLE public.especie_plaga OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 90133)
-- Name: especie_plaga_id_especie_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.especie_plaga_id_especie_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.especie_plaga_id_especie_seq OWNER TO postgres;

--
-- TOC entry 5369 (class 0 OID 0)
-- Dependencies: 267
-- Name: especie_plaga_id_especie_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.especie_plaga_id_especie_seq OWNED BY public.especie_plaga.id_especie;


--
-- TOC entry 248 (class 1259 OID 73841)
-- Name: especie_planta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.especie_planta (
    id_especie integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion text
);


ALTER TABLE public.especie_planta OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 73840)
-- Name: especie_planta_id_especie_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.especie_planta_id_especie_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.especie_planta_id_especie_seq OWNER TO postgres;

--
-- TOC entry 5370 (class 0 OID 0)
-- Dependencies: 247
-- Name: especie_planta_id_especie_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.especie_planta_id_especie_seq OWNED BY public.especie_planta.id_especie;


--
-- TOC entry 266 (class 1259 OID 82003)
-- Name: estado_actual_sistema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estado_actual_sistema (
    id_estado integer NOT NULL,
    id_invernadero integer,
    clima_descripcion character varying(100),
    clima_icono character varying(10),
    riego_activo boolean DEFAULT false,
    riego_intensidad integer,
    indice_calor integer,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.estado_actual_sistema OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 82002)
-- Name: estado_actual_sistema_id_estado_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estado_actual_sistema_id_estado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estado_actual_sistema_id_estado_seq OWNER TO postgres;

--
-- TOC entry 5371 (class 0 OID 0)
-- Dependencies: 265
-- Name: estado_actual_sistema_id_estado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estado_actual_sistema_id_estado_seq OWNED BY public.estado_actual_sistema.id_estado;


--
-- TOC entry 238 (class 1259 OID 57518)
-- Name: estado_alerta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estado_alerta (
    id_estado integer NOT NULL,
    nombre character varying(50)
);


ALTER TABLE public.estado_alerta OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 57517)
-- Name: estado_alerta_id_estado_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estado_alerta_id_estado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estado_alerta_id_estado_seq OWNER TO postgres;

--
-- TOC entry 5372 (class 0 OID 0)
-- Dependencies: 237
-- Name: estado_alerta_id_estado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estado_alerta_id_estado_seq OWNED BY public.estado_alerta.id_estado;


--
-- TOC entry 230 (class 1259 OID 57461)
-- Name: historial_ambiente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_ambiente (
    id_historial integer NOT NULL,
    id_invernadero integer,
    temperatura numeric(5,2),
    humedad numeric(5,2),
    luz numeric(10,2),
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.historial_ambiente OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 57460)
-- Name: historial_ambiente_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_ambiente_id_historial_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_ambiente_id_historial_seq OWNER TO postgres;

--
-- TOC entry 5373 (class 0 OID 0)
-- Dependencies: 229
-- Name: historial_ambiente_id_historial_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_ambiente_id_historial_seq OWNED BY public.historial_ambiente.id_historial;


--
-- TOC entry 234 (class 1259 OID 57488)
-- Name: imagen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.imagen (
    id_imagen integer NOT NULL,
    id_camara integer,
    ruta_imagen text,
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.imagen OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 57487)
-- Name: imagen_id_imagen_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.imagen_id_imagen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.imagen_id_imagen_seq OWNER TO postgres;

--
-- TOC entry 5374 (class 0 OID 0)
-- Dependencies: 233
-- Name: imagen_id_imagen_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.imagen_id_imagen_seq OWNED BY public.imagen.id_imagen;


--
-- TOC entry 220 (class 1259 OID 57388)
-- Name: invernadero; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invernadero (
    id_invernadero integer NOT NULL,
    nombre character varying(50) NOT NULL,
    ubicacion character varying(50) NOT NULL,
    descripcion text,
    id_usuario integer
);


ALTER TABLE public.invernadero OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 57387)
-- Name: invernadero_id_invernadero_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invernadero_id_invernadero_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invernadero_id_invernadero_seq OWNER TO postgres;

--
-- TOC entry 5375 (class 0 OID 0)
-- Dependencies: 219
-- Name: invernadero_id_invernadero_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invernadero_id_invernadero_seq OWNED BY public.invernadero.id_invernadero;


--
-- TOC entry 274 (class 1259 OID 90182)
-- Name: kpi_diario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kpi_diario (
    id_kpi integer NOT NULL,
    fecha timestamp without time zone,
    id_invernadero integer,
    energia_kwh double precision,
    productividad double precision,
    uptime_pct double precision,
    alertas_conteo integer
);


ALTER TABLE public.kpi_diario OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 90181)
-- Name: kpi_diario_id_kpi_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kpi_diario_id_kpi_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kpi_diario_id_kpi_seq OWNER TO postgres;

--
-- TOC entry 5376 (class 0 OID 0)
-- Dependencies: 273
-- Name: kpi_diario_id_kpi_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kpi_diario_id_kpi_seq OWNED BY public.kpi_diario.id_kpi;


--
-- TOC entry 228 (class 1259 OID 57447)
-- Name: lectura; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lectura (
    id_lectura integer NOT NULL,
    id_sensor integer,
    valor numeric(10,2),
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lectura OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 98367)
-- Name: lectura_esp32; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lectura_esp32 (
    id integer NOT NULL,
    id_dispositivo integer NOT NULL,
    temperatura double precision,
    humedad double precision,
    luz_adc integer NOT NULL,
    simulado boolean NOT NULL,
    recibido_en timestamp with time zone NOT NULL
);


ALTER TABLE public.lectura_esp32 OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 98366)
-- Name: lectura_esp32_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lectura_esp32_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lectura_esp32_id_seq OWNER TO postgres;

--
-- TOC entry 5377 (class 0 OID 0)
-- Dependencies: 277
-- Name: lectura_esp32_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lectura_esp32_id_seq OWNED BY public.lectura_esp32.id;


--
-- TOC entry 227 (class 1259 OID 57446)
-- Name: lectura_id_lectura_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lectura_id_lectura_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lectura_id_lectura_seq OWNER TO postgres;

--
-- TOC entry 5378 (class 0 OID 0)
-- Dependencies: 227
-- Name: lectura_id_lectura_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lectura_id_lectura_seq OWNED BY public.lectura.id_lectura;


--
-- TOC entry 276 (class 1259 OID 98357)
-- Name: lectura_sensor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lectura_sensor (
    id_lectura integer NOT NULL,
    id_invernadero integer NOT NULL,
    temperatura numeric(5,2),
    humedad numeric(5,2),
    luminosidad numeric(8,2),
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lectura_sensor OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 98356)
-- Name: lectura_sensor_id_lectura_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lectura_sensor_id_lectura_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lectura_sensor_id_lectura_seq OWNER TO postgres;

--
-- TOC entry 5379 (class 0 OID 0)
-- Dependencies: 275
-- Name: lectura_sensor_id_lectura_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lectura_sensor_id_lectura_seq OWNED BY public.lectura_sensor.id_lectura;


--
-- TOC entry 252 (class 1259 OID 73872)
-- Name: log_actuador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.log_actuador (
    id_log integer NOT NULL,
    id_dispositivo integer,
    accion character varying(50),
    valor_ajuste numeric(10,2),
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.log_actuador OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 73871)
-- Name: log_actuador_id_log_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.log_actuador_id_log_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.log_actuador_id_log_seq OWNER TO postgres;

--
-- TOC entry 5380 (class 0 OID 0)
-- Dependencies: 251
-- Name: log_actuador_id_log_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.log_actuador_id_log_seq OWNED BY public.log_actuador.id_log;


--
-- TOC entry 264 (class 1259 OID 81988)
-- Name: prediccion_climatica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prediccion_climatica (
    id_prediccion integer NOT NULL,
    id_invernadero integer,
    fecha date NOT NULL,
    temperatura_estimada numeric(5,2),
    humedad_estimada numeric(5,2),
    probabilidad_lluvia numeric(5,2),
    fecha_generacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.prediccion_climatica OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 81987)
-- Name: prediccion_climatica_id_prediccion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prediccion_climatica_id_prediccion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prediccion_climatica_id_prediccion_seq OWNER TO postgres;

--
-- TOC entry 5381 (class 0 OID 0)
-- Dependencies: 263
-- Name: prediccion_climatica_id_prediccion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prediccion_climatica_id_prediccion_seq OWNED BY public.prediccion_climatica.id_prediccion;


--
-- TOC entry 270 (class 1259 OID 90145)
-- Name: protocolo_resolucion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.protocolo_resolucion (
    id_protocolo integer NOT NULL,
    id_especie integer,
    instrucciones text NOT NULL,
    nivel_severidad_sugerido character varying(50),
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.protocolo_resolucion OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 90144)
-- Name: protocolo_resolucion_id_protocolo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.protocolo_resolucion_id_protocolo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.protocolo_resolucion_id_protocolo_seq OWNER TO postgres;

--
-- TOC entry 5382 (class 0 OID 0)
-- Dependencies: 269
-- Name: protocolo_resolucion_id_protocolo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.protocolo_resolucion_id_protocolo_seq OWNED BY public.protocolo_resolucion.id_protocolo;


--
-- TOC entry 254 (class 1259 OID 73886)
-- Name: registro_nutrientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registro_nutrientes (
    id_registro integer NOT NULL,
    id_invernadero integer,
    mezcla_nombre character varying(50),
    cantidad_ml numeric(10,2),
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.registro_nutrientes OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 73885)
-- Name: registro_nutrientes_id_registro_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registro_nutrientes_id_registro_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registro_nutrientes_id_registro_seq OWNER TO postgres;

--
-- TOC entry 5383 (class 0 OID 0)
-- Dependencies: 253
-- Name: registro_nutrientes_id_registro_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registro_nutrientes_id_registro_seq OWNED BY public.registro_nutrientes.id_registro;


--
-- TOC entry 258 (class 1259 OID 81942)
-- Name: relato; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.relato (
    id_relato integer NOT NULL,
    nombre character varying(100) NOT NULL,
    mensaje text NOT NULL,
    foto text,
    id_usuario integer
);


ALTER TABLE public.relato OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 81941)
-- Name: relato_id_relato_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.relato_id_relato_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.relato_id_relato_seq OWNER TO postgres;

--
-- TOC entry 5384 (class 0 OID 0)
-- Dependencies: 257
-- Name: relato_id_relato_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.relato_id_relato_seq OWNED BY public.relato.id_relato;


--
-- TOC entry 242 (class 1259 OID 65558)
-- Name: rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol (
    id_rol integer NOT NULL,
    nombre_rol character varying(30) NOT NULL
);


ALTER TABLE public.rol OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 65557)
-- Name: rol_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rol_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rol_id_rol_seq OWNER TO postgres;

--
-- TOC entry 5385 (class 0 OID 0)
-- Dependencies: 241
-- Name: rol_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rol_id_rol_seq OWNED BY public.rol.id_rol;


--
-- TOC entry 226 (class 1259 OID 57429)
-- Name: sensor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sensor (
    id_sensor integer NOT NULL,
    id_dispositivo integer,
    id_tipo_sensor integer
);


ALTER TABLE public.sensor OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 57428)
-- Name: sensor_id_sensor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sensor_id_sensor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sensor_id_sensor_seq OWNER TO postgres;

--
-- TOC entry 5386 (class 0 OID 0)
-- Dependencies: 225
-- Name: sensor_id_sensor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sensor_id_sensor_seq OWNED BY public.sensor.id_sensor;


--
-- TOC entry 272 (class 1259 OID 90165)
-- Name: telemetria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.telemetria (
    id_telemetria integer NOT NULL,
    id_dispositivo integer,
    metrica character varying(50) NOT NULL,
    valor double precision NOT NULL,
    unidad character varying(20),
    fecha_registro timestamp without time zone
);


ALTER TABLE public.telemetria OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 90164)
-- Name: telemetria_id_telemetria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.telemetria_id_telemetria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.telemetria_id_telemetria_seq OWNER TO postgres;

--
-- TOC entry 5387 (class 0 OID 0)
-- Dependencies: 271
-- Name: telemetria_id_telemetria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.telemetria_id_telemetria_seq OWNED BY public.telemetria.id_telemetria;


--
-- TOC entry 224 (class 1259 OID 57420)
-- Name: tipo_sensor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_sensor (
    id_tipo_sensor integer NOT NULL,
    nombre character varying(20) NOT NULL,
    unidad_medida character varying(15)
);


ALTER TABLE public.tipo_sensor OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 57419)
-- Name: tipo_sensor_id_tipo_sensor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_sensor_id_tipo_sensor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipo_sensor_id_tipo_sensor_seq OWNER TO postgres;

--
-- TOC entry 5388 (class 0 OID 0)
-- Dependencies: 223
-- Name: tipo_sensor_id_tipo_sensor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_sensor_id_tipo_sensor_seq OWNED BY public.tipo_sensor.id_tipo_sensor;


--
-- TOC entry 245 (class 1259 OID 65587)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    nombres character varying,
    apellidos character varying,
    correo character varying,
    celular character varying,
    password character varying(255)
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 65586)
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 5389 (class 0 OID 0)
-- Dependencies: 244
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- TOC entry 243 (class 1259 OID 65568)
-- Name: usuario_rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_rol (
    id_usuario integer NOT NULL,
    id_rol integer NOT NULL,
    fecha_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuario_rol OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 65609)
-- Name: vista_usuarios_roles; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_usuarios_roles AS
 SELECT u.id_usuario,
    (((u.nombres)::text || ' '::text) || (u.apellidos)::text) AS nombre_completo,
    u.correo,
    r.nombre_rol
   FROM ((public.usuario u
     LEFT JOIN public.usuario_rol ur ON ((u.id_usuario = ur.id_usuario)))
     LEFT JOIN public.rol r ON ((ur.id_rol = r.id_rol)));


ALTER VIEW public.vista_usuarios_roles OWNER TO postgres;

--
-- TOC entry 5018 (class 2604 OID 57530)
-- Name: alerta id_alerta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerta ALTER COLUMN id_alerta SET DEFAULT nextval('public.alerta_id_alerta_seq'::regclass);


--
-- TOC entry 5034 (class 2604 OID 81961)
-- Name: analisis_suelo id_analisis; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_suelo ALTER COLUMN id_analisis SET DEFAULT nextval('public.analisis_suelo_id_analisis_seq'::regclass);


--
-- TOC entry 5012 (class 2604 OID 57478)
-- Name: camara id_camara; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camara ALTER COLUMN id_camara SET DEFAULT nextval('public.camara_id_camara_seq'::regclass);


--
-- TOC entry 5024 (class 2604 OID 73855)
-- Name: ciclo_cultivo id_ciclo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ciclo_cultivo ALTER COLUMN id_ciclo SET DEFAULT nextval('public.ciclo_cultivo_id_ciclo_seq'::regclass);


--
-- TOC entry 5036 (class 2604 OID 81977)
-- Name: configuracion_confort id_config; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_confort ALTER COLUMN id_config SET DEFAULT nextval('public.configuracion_confort_id_config_seq'::regclass);


--
-- TOC entry 5031 (class 2604 OID 73903)
-- Name: consumo_energetico id_consumo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumo_energetico ALTER COLUMN id_consumo SET DEFAULT nextval('public.consumo_energetico_id_consumo_seq'::regclass);


--
-- TOC entry 5015 (class 2604 OID 57507)
-- Name: deteccion_plaga id_deteccion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deteccion_plaga ALTER COLUMN id_deteccion SET DEFAULT nextval('public.deteccion_plaga_id_deteccion_seq'::regclass);


--
-- TOC entry 5005 (class 2604 OID 57408)
-- Name: dispositivo id_dispositivo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivo ALTER COLUMN id_dispositivo SET DEFAULT nextval('public.dispositivo_id_dispositivo_seq'::regclass);


--
-- TOC entry 5043 (class 2604 OID 90137)
-- Name: especie_plaga id_especie; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.especie_plaga ALTER COLUMN id_especie SET DEFAULT nextval('public.especie_plaga_id_especie_seq'::regclass);


--
-- TOC entry 5023 (class 2604 OID 73844)
-- Name: especie_planta id_especie; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.especie_planta ALTER COLUMN id_especie SET DEFAULT nextval('public.especie_planta_id_especie_seq'::regclass);


--
-- TOC entry 5040 (class 2604 OID 82006)
-- Name: estado_actual_sistema id_estado; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_actual_sistema ALTER COLUMN id_estado SET DEFAULT nextval('public.estado_actual_sistema_id_estado_seq'::regclass);


--
-- TOC entry 5017 (class 2604 OID 57521)
-- Name: estado_alerta id_estado; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_alerta ALTER COLUMN id_estado SET DEFAULT nextval('public.estado_alerta_id_estado_seq'::regclass);


--
-- TOC entry 5010 (class 2604 OID 57464)
-- Name: historial_ambiente id_historial; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_ambiente ALTER COLUMN id_historial SET DEFAULT nextval('public.historial_ambiente_id_historial_seq'::regclass);


--
-- TOC entry 5013 (class 2604 OID 57491)
-- Name: imagen id_imagen; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagen ALTER COLUMN id_imagen SET DEFAULT nextval('public.imagen_id_imagen_seq'::regclass);


--
-- TOC entry 5004 (class 2604 OID 57391)
-- Name: invernadero id_invernadero; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invernadero ALTER COLUMN id_invernadero SET DEFAULT nextval('public.invernadero_id_invernadero_seq'::regclass);


--
-- TOC entry 5047 (class 2604 OID 90185)
-- Name: kpi_diario id_kpi; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kpi_diario ALTER COLUMN id_kpi SET DEFAULT nextval('public.kpi_diario_id_kpi_seq'::regclass);


--
-- TOC entry 5008 (class 2604 OID 57450)
-- Name: lectura id_lectura; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectura ALTER COLUMN id_lectura SET DEFAULT nextval('public.lectura_id_lectura_seq'::regclass);


--
-- TOC entry 5050 (class 2604 OID 98370)
-- Name: lectura_esp32 id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectura_esp32 ALTER COLUMN id SET DEFAULT nextval('public.lectura_esp32_id_seq'::regclass);


--
-- TOC entry 5048 (class 2604 OID 98360)
-- Name: lectura_sensor id_lectura; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectura_sensor ALTER COLUMN id_lectura SET DEFAULT nextval('public.lectura_sensor_id_lectura_seq'::regclass);


--
-- TOC entry 5027 (class 2604 OID 73875)
-- Name: log_actuador id_log; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_actuador ALTER COLUMN id_log SET DEFAULT nextval('public.log_actuador_id_log_seq'::regclass);


--
-- TOC entry 5038 (class 2604 OID 81991)
-- Name: prediccion_climatica id_prediccion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prediccion_climatica ALTER COLUMN id_prediccion SET DEFAULT nextval('public.prediccion_climatica_id_prediccion_seq'::regclass);


--
-- TOC entry 5044 (class 2604 OID 90148)
-- Name: protocolo_resolucion id_protocolo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocolo_resolucion ALTER COLUMN id_protocolo SET DEFAULT nextval('public.protocolo_resolucion_id_protocolo_seq'::regclass);


--
-- TOC entry 5029 (class 2604 OID 73889)
-- Name: registro_nutrientes id_registro; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_nutrientes ALTER COLUMN id_registro SET DEFAULT nextval('public.registro_nutrientes_id_registro_seq'::regclass);


--
-- TOC entry 5033 (class 2604 OID 81945)
-- Name: relato id_relato; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relato ALTER COLUMN id_relato SET DEFAULT nextval('public.relato_id_relato_seq'::regclass);


--
-- TOC entry 5020 (class 2604 OID 65561)
-- Name: rol id_rol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol ALTER COLUMN id_rol SET DEFAULT nextval('public.rol_id_rol_seq'::regclass);


--
-- TOC entry 5007 (class 2604 OID 57432)
-- Name: sensor id_sensor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor ALTER COLUMN id_sensor SET DEFAULT nextval('public.sensor_id_sensor_seq'::regclass);


--
-- TOC entry 5046 (class 2604 OID 90168)
-- Name: telemetria id_telemetria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telemetria ALTER COLUMN id_telemetria SET DEFAULT nextval('public.telemetria_id_telemetria_seq'::regclass);


--
-- TOC entry 5006 (class 2604 OID 57423)
-- Name: tipo_sensor id_tipo_sensor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_sensor ALTER COLUMN id_tipo_sensor SET DEFAULT nextval('public.tipo_sensor_id_tipo_sensor_seq'::regclass);


--
-- TOC entry 5022 (class 2604 OID 65590)
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- TOC entry 5317 (class 0 OID 57527)
-- Dependencies: 240
-- Data for Name: alerta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alerta (id_alerta, id_invernadero, tipo_alerta, descripcion, fecha_hora, id_estado, id_referencia, tipo_origen, severidad, zona_especifica) FROM stdin;
\.


--
-- TOC entry 5336 (class 0 OID 81958)
-- Dependencies: 260
-- Data for Name: analisis_suelo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analisis_suelo (id_analisis, id_invernadero, id_muestra, fecha_muestreo, lote_sector, geolocalizacion, cultivo, profundidad, ph, ec, co2, materia_organica, nitrogeno_total, fosforo_disponible, potasio_intercambiable, calcio, magnesio, sodio, cic, saturacion_bases, saturacion_aluminio, textura, densidad_aparente, humedad_actual, estado_balance, recomendacion_enmienda, fecha_registro) FROM stdin;
\.


--
-- TOC entry 5309 (class 0 OID 57475)
-- Dependencies: 232
-- Data for Name: camara; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camara (id_camara, id_dispositivo, resolucion, estado) FROM stdin;
\.


--
-- TOC entry 5326 (class 0 OID 73852)
-- Dependencies: 250
-- Data for Name: ciclo_cultivo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ciclo_cultivo (id_ciclo, id_invernadero, id_especie, fecha_plantacion, estado_etapa, activo) FROM stdin;
\.


--
-- TOC entry 5338 (class 0 OID 81974)
-- Dependencies: 262
-- Data for Name: configuracion_confort; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracion_confort (id_config, id_tipo_sensor, valor_minimo, valor_maximo, descripcion_estado, fecha_actualizacion) FROM stdin;
\.


--
-- TOC entry 5332 (class 0 OID 73900)
-- Dependencies: 256
-- Data for Name: consumo_energetico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumo_energetico (id_consumo, id_dispositivo, kwh, fecha_hora) FROM stdin;
\.


--
-- TOC entry 5313 (class 0 OID 57504)
-- Dependencies: 236
-- Data for Name: deteccion_plaga; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deteccion_plaga (id_deteccion, id_imagen, tipo_plaga, nivel_confianza, fecha_hora, x_min, y_min, x_max, y_max) FROM stdin;
\.


--
-- TOC entry 5299 (class 0 OID 57405)
-- Dependencies: 222
-- Data for Name: dispositivo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispositivo (id_dispositivo, nombre, tipo, estado, id_invernadero, categoria, ubicacion) FROM stdin;
14	Sensor Luz 	Sensor de Luz	Activo	15	\N	pasillo sur
15	Humedad	Sensor de Humedad	Activo	4	\N	Sector Este
13	Bomba de Agua	Bomba de Agua	Activo	3	\N	ESTE
17	Detector de luz	Luz LED	Activo	15	\N	pasillo sur
21	CAM 3	Cámara	Activo	4	\N	Sector Este
22	Riego Central	Bomba de Agua	Activo	1	\N	Central
24	Control de temperatura	Sensor de Temperatura	Activo	3	\N	Central
25	Bomba de Agua automatica	Sensor de Humedad	Activo	1	\N	pasillo sur
26	ESP32 Central	ESP32	Activo	3	\N	Sector Norte
\.


--
-- TOC entry 5344 (class 0 OID 90134)
-- Dependencies: 268
-- Data for Name: especie_plaga; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.especie_plaga (id_especie, nombre, descripcion_tecnica, imagen_referencia) FROM stdin;
\.


--
-- TOC entry 5324 (class 0 OID 73841)
-- Dependencies: 248
-- Data for Name: especie_planta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.especie_planta (id_especie, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5342 (class 0 OID 82003)
-- Dependencies: 266
-- Data for Name: estado_actual_sistema; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estado_actual_sistema (id_estado, id_invernadero, clima_descripcion, clima_icono, riego_activo, riego_intensidad, indice_calor, fecha_actualizacion) FROM stdin;
1	1	Cielo Despejado	☀️	t	15	4	2026-05-03 22:51:07.795521
\.


--
-- TOC entry 5315 (class 0 OID 57518)
-- Dependencies: 238
-- Data for Name: estado_alerta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estado_alerta (id_estado, nombre) FROM stdin;
\.


--
-- TOC entry 5307 (class 0 OID 57461)
-- Dependencies: 230
-- Data for Name: historial_ambiente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_ambiente (id_historial, id_invernadero, temperatura, humedad, luz, fecha_hora) FROM stdin;
\.


--
-- TOC entry 5311 (class 0 OID 57488)
-- Dependencies: 234
-- Data for Name: imagen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.imagen (id_imagen, id_camara, ruta_imagen, fecha_hora) FROM stdin;
\.


--
-- TOC entry 5297 (class 0 OID 57388)
-- Dependencies: 220
-- Data for Name: invernadero; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invernadero (id_invernadero, nombre, ubicacion, descripcion, id_usuario) FROM stdin;
1	Invernadero A	Central	tomates - lechugas	1
3	Invernadero B	Zona Sur 	Papas, Cebollas	1
4	Invernadero C	Zona Sur 	lechuga - tomate	1
15	Achocalla	calle 2	["tomate","lechuuga","frutilla","papa"]	1
16	Invernadero Mallasa	Calle 23	["Lechuga","Tomate","Rabanos"]	1
\.


--
-- TOC entry 5350 (class 0 OID 90182)
-- Dependencies: 274
-- Data for Name: kpi_diario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kpi_diario (id_kpi, fecha, id_invernadero, energia_kwh, productividad, uptime_pct, alertas_conteo) FROM stdin;
\.


--
-- TOC entry 5305 (class 0 OID 57447)
-- Dependencies: 228
-- Data for Name: lectura; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lectura (id_lectura, id_sensor, valor, fecha_hora) FROM stdin;
\.


--
-- TOC entry 5354 (class 0 OID 98367)
-- Dependencies: 278
-- Data for Name: lectura_esp32; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lectura_esp32 (id, id_dispositivo, temperatura, humedad, luz_adc, simulado, recibido_en) FROM stdin;
2	26	25.8	47.6	2248	t	2026-10-04 16:18:18.174731-04
3	26	27.4	69.4	2937	t	2026-10-04 16:18:28.224581-04
4	26	23.5	54.1	571	t	2026-10-04 16:18:43.796038-04
5	26	\N	\N	0	f	2026-10-04 17:23:13.167386-04
6	26	\N	\N	0	f	2026-10-04 17:23:23.060597-04
7	26	\N	\N	0	f	2026-10-04 17:23:33.047928-04
8	26	\N	\N	0	f	2026-10-04 17:23:43.083605-04
9	26	\N	\N	0	f	2026-10-04 17:23:53.084778-04
10	26	\N	\N	0	f	2026-10-04 17:24:03.193437-04
11	26	\N	\N	0	f	2026-10-04 17:24:13.08664-04
12	26	\N	\N	0	f	2026-10-04 17:24:23.107865-04
13	26	\N	\N	0	f	2026-10-04 17:24:33.13365-04
14	26	\N	\N	0	f	2026-10-04 17:24:43.231293-04
15	26	\N	\N	0	f	2026-10-04 17:24:53.147931-04
16	26	\N	\N	0	f	2026-10-04 17:25:03.179433-04
17	26	\N	\N	0	f	2026-10-04 17:25:13.435769-04
18	26	\N	\N	0	f	2026-10-04 17:25:23.30661-04
19	26	\N	\N	0	f	2026-10-04 17:25:33.515499-04
20	26	\N	\N	0	f	2026-10-04 17:25:43.199573-04
21	26	\N	\N	0	f	2026-10-04 17:25:53.998588-04
22	26	\N	\N	0	f	2026-10-04 17:26:04.665661-04
23	26	\N	\N	0	f	2026-10-04 17:26:13.243711-04
24	26	\N	\N	0	f	2026-10-04 17:26:23.278988-04
25	26	\N	\N	0	f	2026-10-04 17:26:33.261884-04
26	26	\N	\N	0	f	2026-10-04 17:26:43.318942-04
27	26	\N	\N	1	f	2026-10-04 17:26:53.48983-04
28	26	\N	\N	0	f	2026-10-04 17:27:03.323173-04
29	26	\N	\N	0	f	2026-10-04 17:27:13.463128-04
30	26	\N	\N	0	f	2026-10-04 17:27:23.597137-04
31	26	\N	\N	0	f	2026-10-04 17:27:33.323978-04
32	26	\N	\N	0	f	2026-10-04 17:27:43.565468-04
33	26	\N	\N	0	f	2026-10-04 17:27:53.392744-04
34	26	\N	\N	0	f	2026-10-04 17:28:03.510735-04
35	26	\N	\N	0	f	2026-10-04 17:28:13.364083-04
36	26	\N	\N	0	f	2026-10-04 17:28:23.349925-04
37	26	\N	\N	0	f	2026-10-04 17:28:33.423241-04
38	26	\N	\N	0	f	2026-10-04 17:28:43.67489-04
39	26	\N	\N	0	f	2026-10-04 17:28:53.399569-04
40	26	\N	\N	0	f	2026-10-04 17:29:03.435337-04
41	26	\N	\N	0	f	2026-10-04 17:29:13.408822-04
42	26	\N	\N	0	f	2026-10-04 17:29:23.422851-04
43	26	\N	\N	1	f	2026-10-04 17:29:33.446278-04
44	26	\N	\N	0	f	2026-10-04 17:29:43.589784-04
45	26	\N	\N	0	f	2026-10-04 17:29:53.470492-04
46	26	\N	\N	0	f	2026-10-04 17:30:03.646358-04
47	26	\N	\N	0	f	2026-10-04 17:30:13.477463-04
48	26	\N	\N	0	f	2026-10-04 17:30:23.71961-04
49	26	\N	\N	0	f	2026-10-04 17:30:33.479386-04
50	26	\N	\N	0	f	2026-10-04 17:30:43.49868-04
51	26	\N	\N	0	f	2026-10-04 17:30:53.51751-04
52	26	\N	\N	0	f	2026-10-04 17:31:03.491764-04
53	26	\N	\N	0	f	2026-10-04 17:31:13.999321-04
54	26	\N	\N	0	f	2026-10-04 17:31:23.593767-04
55	26	\N	\N	0	f	2026-10-04 17:31:33.546766-04
56	26	\N	\N	0	f	2026-10-04 17:31:44.320322-04
57	26	\N	\N	0	f	2026-10-04 17:31:54.427578-04
58	26	\N	\N	0	f	2026-10-04 17:32:04.313361-04
59	26	\N	\N	0	f	2026-10-04 17:32:13.961892-04
60	26	\N	\N	0	f	2026-10-04 17:32:23.592299-04
61	26	\N	\N	0	f	2026-10-04 17:32:33.583768-04
62	26	\N	\N	0	f	2026-10-04 17:32:43.69843-04
63	26	\N	\N	0	f	2026-10-04 17:32:54.446548-04
64	26	\N	\N	0	f	2026-10-04 17:33:03.666309-04
65	26	\N	\N	0	f	2026-10-04 17:33:13.640982-04
66	26	\N	\N	0	f	2026-10-04 18:12:46.379379-04
67	26	\N	\N	0	f	2026-10-04 18:12:46.456202-04
68	26	\N	\N	0	f	2026-10-04 18:12:46.456869-04
69	26	\N	\N	0	f	2026-10-04 18:12:46.45741-04
70	26	\N	\N	0	f	2026-10-04 18:12:46.458095-04
71	26	\N	\N	0	f	2026-10-04 18:12:46.543455-04
72	26	\N	\N	0	f	2026-10-04 18:12:47.158037-04
73	26	\N	\N	0	f	2026-10-04 18:13:00.879936-04
74	26	\N	\N	0	f	2026-10-04 18:13:07.087623-04
75	26	\N	\N	0	f	2026-10-04 18:13:17.087431-04
76	26	\N	\N	0	f	2026-10-04 18:13:27.219685-04
77	26	\N	\N	158	f	2026-10-04 18:13:37.033693-04
78	26	\N	\N	0	f	2026-10-04 18:13:47.181371-04
79	26	\N	\N	0	f	2026-10-04 18:13:57.0632-04
80	26	\N	\N	0	f	2026-10-04 18:14:07.154808-04
81	26	\N	\N	0	f	2026-10-04 18:14:17.187199-04
82	26	\N	\N	0	f	2026-10-04 18:14:27.130597-04
83	26	\N	\N	0	f	2026-10-04 18:14:37.115331-04
84	26	\N	\N	0	f	2026-10-04 18:14:47.97925-04
85	26	\N	\N	1	f	2026-10-04 18:14:56.506319-04
86	26	\N	\N	0	f	2026-10-04 18:15:06.54141-04
87	26	\N	\N	29	f	2026-10-04 18:15:16.46191-04
88	26	\N	\N	22	f	2026-10-04 18:15:26.521541-04
89	26	\N	\N	0	f	2026-10-04 18:15:36.572267-04
90	26	\N	\N	107	f	2026-10-04 18:15:46.481125-04
91	26	\N	\N	99	f	2026-10-04 18:15:56.780076-04
92	26	\N	\N	199	f	2026-10-04 18:16:06.572135-04
93	26	\N	\N	5	f	2026-10-04 18:16:16.695931-04
94	26	\N	\N	0	f	2026-10-04 18:16:26.624632-04
95	26	\N	\N	34	f	2026-10-04 18:16:39.396746-04
96	26	\N	\N	2	f	2026-10-04 18:16:46.589117-04
97	26	\N	\N	0	f	2026-10-04 18:16:56.669119-04
98	26	\N	\N	39	f	2026-10-04 18:17:06.761746-04
99	26	\N	\N	23	f	2026-10-04 18:17:16.712209-04
100	26	\N	\N	0	f	2026-10-04 18:17:26.838313-04
101	26	\N	\N	1	f	2026-10-04 18:17:36.600837-04
102	26	\N	\N	0	f	2026-10-04 18:17:46.600715-04
103	26	\N	\N	0	f	2026-10-04 18:17:56.751021-04
104	26	\N	\N	1	f	2026-10-04 18:18:06.678896-04
105	26	\N	\N	1	f	2026-10-04 18:18:16.613243-04
106	26	\N	\N	1	f	2026-10-04 18:18:26.645285-04
107	26	\N	\N	1	f	2026-10-04 18:18:36.666204-04
108	26	\N	\N	1	f	2026-10-04 18:18:46.656142-04
109	26	\N	\N	1	f	2026-10-04 18:18:56.92066-04
110	26	\N	\N	0	f	2026-10-04 18:19:06.880091-04
111	26	\N	\N	2	f	2026-10-04 18:19:16.71416-04
112	26	\N	\N	2	f	2026-10-04 18:19:26.672393-04
113	26	\N	\N	1	f	2026-10-04 18:19:36.693466-04
114	26	\N	\N	1	f	2026-10-04 18:19:46.736519-04
115	26	\N	\N	1	f	2026-10-04 18:19:56.854064-04
116	26	\N	\N	2	f	2026-10-04 18:20:08.192277-04
117	26	\N	\N	0	f	2026-10-04 18:20:16.821014-04
118	26	\N	\N	1	f	2026-10-04 18:20:27.06294-04
119	26	\N	\N	2	f	2026-10-04 18:20:40.242831-04
120	26	\N	\N	1	f	2026-10-04 18:20:46.828546-04
121	26	\N	\N	0	f	2026-10-04 18:20:56.877218-04
122	26	\N	\N	0	f	2026-10-04 18:21:07.057488-04
123	26	\N	\N	2	f	2026-10-04 18:21:17.364134-04
124	26	\N	\N	0	f	2026-10-04 18:21:26.979376-04
125	26	\N	\N	0	f	2026-10-04 18:21:36.945705-04
126	26	\N	\N	2	f	2026-10-04 18:21:47.048368-04
127	26	\N	\N	1	f	2026-10-04 18:21:56.921847-04
128	26	\N	\N	0	f	2026-10-04 18:22:06.906929-04
129	26	\N	\N	2	f	2026-10-04 18:22:17.001506-04
130	26	\N	\N	2	f	2026-10-04 18:22:26.883004-04
131	26	\N	\N	1	f	2026-10-04 18:22:37.035371-04
132	26	\N	\N	0	f	2026-10-04 18:22:46.938515-04
133	26	\N	\N	1	f	2026-10-04 18:22:56.831032-04
134	26	\N	\N	0	f	2026-10-04 18:23:06.985234-04
135	26	\N	\N	0	f	2026-10-04 18:23:24.227477-04
136	26	\N	\N	1	f	2026-10-04 18:23:36.912512-04
137	26	\N	\N	0	f	2026-10-04 18:23:47.173094-04
138	26	\N	\N	0	f	2026-10-04 18:23:56.984808-04
139	26	\N	\N	0	f	2026-10-04 18:24:09.987834-04
140	26	\N	\N	1	f	2026-10-04 18:24:16.943361-04
141	26	\N	\N	1	f	2026-10-04 18:24:26.989311-04
142	26	\N	\N	0	f	2026-10-04 18:24:37.146869-04
143	26	\N	\N	1	f	2026-10-04 18:24:47.069907-04
144	26	\N	\N	0	f	2026-10-04 18:24:56.927657-04
145	26	\N	\N	0	f	2026-10-04 18:25:07.130489-04
146	26	\N	\N	1	f	2026-10-04 18:25:16.961992-04
147	26	\N	\N	1	f	2026-10-04 18:25:26.966642-04
148	26	\N	\N	0	f	2026-10-04 18:25:37.531269-04
149	26	\N	\N	0	f	2026-10-04 18:25:57.012112-04
150	26	\N	\N	1	f	2026-10-04 18:26:08.012576-04
151	26	\N	\N	0	f	2026-10-04 18:26:17.11127-04
152	26	\N	\N	2	f	2026-10-04 18:26:27.307119-04
153	26	\N	\N	1	f	2026-10-04 18:26:37.157156-04
154	26	\N	\N	1	f	2026-10-04 18:26:47.044883-04
155	26	\N	\N	1	f	2026-10-04 18:26:57.118788-04
156	26	\N	\N	1	f	2026-10-04 18:27:07.142321-04
161	26	\N	\N	0	f	2026-10-04 18:27:57.216202-04
166	26	\N	\N	1	f	2026-10-04 18:28:47.516367-04
171	26	\N	\N	0	f	2026-10-04 18:40:02.342413-04
176	26	\N	\N	2	f	2026-10-04 18:40:56.873574-04
181	26	\N	\N	2	f	2026-10-04 18:41:43.190987-04
157	26	\N	\N	1	f	2026-10-04 18:27:17.243016-04
162	26	\N	\N	1	f	2026-10-04 18:28:07.264174-04
167	26	\N	\N	0	f	2026-10-04 18:29:22.893596-04
172	26	\N	\N	2	f	2026-10-04 18:40:15.237995-04
177	26	\N	\N	3	f	2026-10-04 18:41:05.794842-04
182	26	\N	\N	2	f	2026-10-04 18:41:52.717065-04
158	26	\N	\N	1	f	2026-10-04 18:27:27.315604-04
163	26	\N	\N	0	f	2026-10-04 18:28:17.392337-04
168	26	\N	\N	1	f	2026-10-04 18:37:36.188025-04
173	26	\N	\N	1	f	2026-10-04 18:40:22.614114-04
178	26	\N	\N	5	f	2026-10-04 18:41:16.543494-04
159	26	\N	\N	1	f	2026-10-04 18:27:37.249686-04
164	26	\N	\N	1	f	2026-10-04 18:28:27.221842-04
169	26	\N	\N	2	f	2026-10-04 18:37:56.190107-04
174	26	\N	\N	8	f	2026-10-04 18:40:32.489772-04
179	26	\N	\N	2	f	2026-10-04 18:41:22.519564-04
160	26	\N	\N	2	f	2026-10-04 18:27:47.385467-04
165	26	\N	\N	1	f	2026-10-04 18:28:37.277516-04
170	26	\N	\N	3	f	2026-10-04 18:39:52.480831-04
175	26	\N	\N	6	f	2026-10-04 18:40:42.690291-04
180	26	\N	\N	2	f	2026-10-04 18:41:32.444057-04
183	26	\N	\N	3	f	2026-10-04 18:42:02.55094-04
184	26	\N	\N	2	f	2026-10-04 18:42:13.351492-04
185	26	\N	\N	3	f	2026-10-04 18:42:24.282758-04
186	26	\N	\N	4	f	2026-10-04 18:42:33.631849-04
187	26	\N	\N	2	f	2026-10-04 18:42:42.588587-04
188	26	\N	\N	4	f	2026-10-04 18:42:52.559203-04
189	26	\N	\N	1	f	2026-10-04 18:43:02.712297-04
190	26	\N	\N	2	f	2026-10-04 18:43:12.709854-04
191	26	\N	\N	1	f	2026-10-04 18:43:23.697912-04
\.


--
-- TOC entry 5352 (class 0 OID 98357)
-- Dependencies: 276
-- Data for Name: lectura_sensor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lectura_sensor (id_lectura, id_invernadero, temperatura, humedad, luminosidad, fecha_hora) FROM stdin;
\.


--
-- TOC entry 5328 (class 0 OID 73872)
-- Dependencies: 252
-- Data for Name: log_actuador; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.log_actuador (id_log, id_dispositivo, accion, valor_ajuste, fecha_hora) FROM stdin;
\.


--
-- TOC entry 5340 (class 0 OID 81988)
-- Dependencies: 264
-- Data for Name: prediccion_climatica; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prediccion_climatica (id_prediccion, id_invernadero, fecha, temperatura_estimada, humedad_estimada, probabilidad_lluvia, fecha_generacion) FROM stdin;
\.


--
-- TOC entry 5346 (class 0 OID 90145)
-- Dependencies: 270
-- Data for Name: protocolo_resolucion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.protocolo_resolucion (id_protocolo, id_especie, instrucciones, nivel_severidad_sugerido, fecha_actualizacion) FROM stdin;
\.


--
-- TOC entry 5330 (class 0 OID 73886)
-- Dependencies: 254
-- Data for Name: registro_nutrientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registro_nutrientes (id_registro, id_invernadero, mezcla_nombre, cantidad_ml, fecha_hora) FROM stdin;
\.


--
-- TOC entry 5334 (class 0 OID 81942)
-- Dependencies: 258
-- Data for Name: relato; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.relato (id_relato, nombre, mensaje, foto, id_usuario) FROM stdin;
1	Jorge Calderon	Uno de los mejores huertos que tuve significa lo mejor verduras frescas, fruta fresca, que mas puedo desear?	data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMVFhUWGCAaGBgYFxgYGhoaGhoZHx0dHRodHyggGxomGx8YIjEiJSkrLi4uFyAzODMtNygtLisBCgoKDg0OGxAQGzUmHyUtLS0tLy0tLS0tLS0vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLf/AABEIAMkA+wMBIgACEQEDEQH/xAAcAAACAwEBAQEAAAAAAAAAAAAFBgMEBwIBAAj/xABHEAABAgMFBQUGAwUECgMAAAABAhEAAyEEBRIxQQYiUWFxEzKBkbEjQqHB0fAHFOEzUnKCwmKSsvEVFiRDRFNzoqPSNFRj/8QAGgEAAwEBAQEAAAAAAAAAAAAAAQIDBAAFBv/EACsRAAICAgICAQQBAwUAAAAAAAABAhEDIRIxBEFREyJhcQUygbFCkcHh8f/aAAwDAQACEQMRAD8A2+FPblUt5OM91y3EU+YhsjHfxIvUm2LS9JYCB5An4mJZv6aGgrY3WO/EzfZqYBm/QReVYpKwQMNKaaRjlkvtSXrUkt99B8YK2DaAks9DnXSMcov2al+B+tGzac00rwoRwI1EBdorhXJKZksgoJZiQkILN0L6dOkeWDadWqqfoG9ILIvETkqlrLBSWGKldM+dYlKHJCZcfJbE42qrTGCAWC1L3lF+YYKcDzEcWuYWMqZvIWghw2vEcfrFK8brtVoIUZZSge8VIqySePe5sKEaxzZ5s0JKqdoVAlywBqzYcxhoRzia8aVIwcWgFs2fZz5ZIBCHGJ85bgjPMvrE1hPsgXZgwDau5bz+MV727RE1cwJCO2SSyQyWUGU3J4K3TdmIy94AFiQRk4fjwMejx7fyVHz8PtmkzZOOcFYSXQAWD6kNXlDkvZeylOHsgzNQqB+Bipdl4S0hMtL7oAHIAUg3KtAKXiiSSoZIWb22PSJajZ3xAOEK3narBRqDCFZLb2cwqwhJqGUnIk6aOBGyqmxmO2thCLQogUWMXjr8fWA9hcAcmYmhUwYg1AYgM/8AE2fnAe8ZiUl8KVBiHIq51AbP70iyEsSHLNk5bXTjBC07LSl94rO4Fje17JavLE32YlHFXsWhYKzMUyUqDB3SOKGc8M8+nARzYipKC6VEvqg89Wc6+fOHKXs5Z0ElIV3sNVPRM1CP8JVEFqu6WhmDJZy//Tf1Ih3BVQOIuqknEmijkG0B8a+kMFw3vNlleLtEjApKQojMpoRioC4HgIHzkpegIGMgcWdIHkTFy7bOhSVhYJITQqJNcadDqzwqggJAi3dqqY65hWHLqKu8fMMnIU4DhF60WWTMlKPbS0WlDLlzQVKVljwEksAmYEpGgJLOIZlXVIEu07iXQQEljTcct4x7aLDJSEskD2orhxU7NPmHq2sPoehVuaxLTJVaZyFTrTMWpYeoFA6i1CToMhBi7tpJoYrUTwAf4QO2Tv0oSEzVqMuZUmu4oEssDTmNRDGqwSZtQGUDVUtQMtYPvCtDyLRlyQt7NUftQyXHtHjDKD9K+cXp0ntsb0GHdzcKzBFMwQIAS7sTiASuVMOYwlBfql3B55dIIWW2JlYgS5AfCwDc2+ZhHKUaT6O4p7RatSnCVmmP14RRUoff8v8A7Dzi7Z7Sicks7JqG6/5wLmT0pzUKB68hLJ8mrF8bU42SlcXR6dDo/oAfQx7a7yaUtA94EOaaHXwbxEV5lpQoFAPdoepQunwHhAS8LWkKJHMgVq5lkH/Fp5Q/H4JykwJe9qnrIA9nho4UNSC7AO9WfkMorGfMpiWh2Gizpxesc2ueVJqxL5uCcuPB0+bwTu+wFUsFzmRkTkoj5R0sSl2SezZSqMh/E24lItRnkeymtvaBYABB4ZAw/fmllL41E4csmPZBbUHFK/OB21N0G1WeZIxnETuEkkBSZzA9MK0g8otLaKRdMxRUhiA4rk/BvVo6RLw5PWjffNonTYFspJAKpZOFjq9QDk1KdYnXYVJrTGQwFO8WbPhEqvRr0lZeuC0pM0ILbuZJpifyMFF3dMWtUyaTUshOJmD6jp5QiWS09mCRUgn6QRu+/CiYkqUVca0H6xRQrozuV9jEq3zZGJIOJBcMXYE0LDpFQzwHSQxFX0qkD5QTK5U9JUkPRyHYv55QKs7HEAe8pg/o+v6CO0BxTPL2sZWhGEFRSohwCWThAZg7VS/jBm7rJgs6Vqo4CUvR2zLfCOrulKkkJU2EkHCXY9SMjFrbS1oWmWUJIJNeAplFJY2oKUdr3+AwUW6ZTlbSqlLaWkKKiMRU5AB0A4trDGrbBKQThLEMAIztR3nj5VobNyOpMRLuKdGlXPfBNVqz+AiLbm0S1CWxdVX6Rn9jWs5KOEVzgktZOZhccWuxczXSPFd4dPmIc5Ut0SjUlUmvhhR6H4wkLWyk9D8od7rnvJs/HslA+M2XFGZyG0uBMUxOFSlf+RSv6YVbfeXaAUZjh/8AHhf4ZQ9WqaOzm17yfVEz6jzjNU6/9Qf4Uxy2dR2mfiYigUSc+Bf5fGLN3XipEtK2BKksX5qDnrFCSjCEDgVD/FHUg/7OjoP8QhqQA9OvtbTBhT7RQfOlGpHBvha82SEqJpWqUhIPkkFucC7Qcv4hHdlzPVf9UCkcARaFIQhg7OG8f1gnYplGUGCqFjodfnA93ACRUAl+QNfgRE8heruIjNG3HtF5VmVLCcKiVYgxxZcweFI0G6LfjkKKziUg4MWqkqFK61jNbVbFYMAUeAY8YfbosjyhKAYqMs+SAT6Rmy1RQP3NYFSSxPeDAcRT78YGXtJKVLSxbCtv5iv6CDWzs4zJaUrG+hw7vkoh38Ikvu6VqONIxd0Eas5c86H4Q3ixdGfM7YqoLKnKf/erPgAhPoqANslOsPV2SxOoQn4QctCsKJhNCTMoaGq5TehgPalVB6q8pbeojVRnoCIsRxJBBqQ3ipX/ALQbTbFJoEuDvAsPeOL5x7ZpgxAf/oEvyAUfnHYSlQBcCgp0DQRWjTZN1HEVEhncAclTP6Vt4QmbZyLQglPaKCDkRuuCAKt/CH6RpMVLzsCZ0tSFDMUOoOhHjF4ujmjCUmjZEfKBe0FpJTLWnOWov0IIhg2pu5ciYXFXY/I9CIXlJxApbvUiLjxma0+UBSQsu3PTXpBo3BOKcQYkZjFvDkRm7QPW6FFqHiPrE9zrmGYAlakp94jQaw70Z4q3QSuWcHwleFwxUX8QBx6/GCgmykzQQokCoD/baU5eEUrzswWfYSRLCDhB3io094kkFWtGgpZ9lFdh2xUHAxFNST9iJOce2X+lK6GVFplzJaRmqjkPQ9eUUNpJqhJpkVAHkR9iKEq1Kky0zAnE4xMaUyIHwPnwgqwmAKGFSJgAUFO39lVNRl5cI9jxsPHG79mSb2Kkqe45xfsl2LmDEwbQanw0irY09naSF0KSQAMsWgr7sM8y0KEtkghJZ27wq2XVm8I8PzJSxz4xRqhk0B02fs1rQdG9B9YmiG1q9sasToeGEN6R24oa1dqRTHbimyUnsjtKhil8yRT74tDNYLaAiSMQpid1MwKnHR2ELU0jdz3Tw/WJkKAALFiW161OUM0KMVovFDNiFUgVJLbqeWu95Qp2X2i1pSR3wXq1MLh/AxJa5rpUBmAA7vVtOg9IZ9lDJly0kgBxVJGf1hJy4IvhxcxbttlVLUhKtSSPELMU7Kf9nT9+8IK7TKeeqY4wtupyIpkBwz01gRJm+ySQmhOVHFRwDQ8Jco2Tyw4SotWk0/nEW7mKe0BWHTjXiHEb0UJ0w1dL7wbmWFeVaeEd2e0FxRnUoHgDvPlxNPGGJnOzCErm4SHCpS0jqrCkV6keUU1WOYltw1D+EWNmpoVNCEpCHlllOokjdpRiOvKGyybQ2gyE9oQCwEtIHd3cLnjQkAeMBw5MpDI4CTLSMQK3DMcs4ZLHfE4zEy5YJUvdHINpA+9pboxaAjycJg5sJdZSuXNOa1U4hI+sI/GuVMu8322Pdy3eqyyHLdoQ5BybQPyDkwcsVrxpSogAqyDv8hC7tLeTLUkaBvr8x4x1sdMKsSlq/spBOZNS3g3xjSsajHRkcrdsN3vdEq0IKVjPJQooePyjNL7umbJmKR2M1YZWFSHIViNDRNKHLiDGtAwM2jskyZIWJSyiYA6COI06HLxhGgoyiVZ5wL/lpxOJSu6vkAO7yNf7XKCMmw2gJATJmAaApUf6dTXxgBM2gto/4hfkn6RB/rFbf/sr8k/SE4s43546itZbQJktK05KDiJ0qeKAE78Rbn7SWJozG6f6T5+sZ9cNyrnTUqCThSalqOxYPG03khBlqEzukV/TnChdQ7JRxAYB3WGfNQdjrXOucHT2PGVJoRr+/DmaxMkiYQS6QGI119PKFmRYzZxVBCv7QIyPPnSP0FNXKxib2hywjCaDU9SW14QsbU7L/myZ0uahRGYYKOFgWb97MeOcLJWhoy4uxTkLQpIWDQpyYbvIn3izV4Uiuu8VlXZy2cuPBophCcAMtRoTjQXBlkOW5pYZ5ioPE92IvMxNn8miGDx+eVRfRqnn+zkiwUAySlqyyyh98Q8fXGGkYTXApSfAGnwi9OQywtqKGFXTjFawobtE6pVUcQwHyj6NRUaR5bd7B+0csFcqaPe73VJEE1BSEnEgkHCxKkuAciUu7E+9XKO12MTZOE0ILgtlEN4JUEySWZueaaH4t48Mo8P+Wx7jL+xTG9UCbZNxTEKfkOLEKzOv6xbI0+8opXgoJViYhIUGcMWGL0dvCLijUdPlGfD/AEIcitKmAPP+kwctCB+UlEjEO0UMJoNdc9IX7etpb/2h8aRMu8VFpb7qS4GlSAo9RiB6CDOVI2eF4rzzrpLsH229JaFYMAd2NSw+pz84nsVswmWrtSgKoQlTlNfeCnYHlCZPWXclyc+MErgJnTRKUpIBqVKoyQHJ50frCy2jQsUYy4xHi8MM4JYgFC6qYKJZLM+tTm2cBp9kXLlAOKHQOCCoccouWFdFBKSE4nBJqQdW8o8K3JQajE3hhf1aJwyOOvR62T+Kx5cVrUqKc2Wpg6yWVXdTV9cqNy4R5YiUqVMWs4UlY0DmpJcDPIeBiS2kJHfTixhg/MRDZDKMspXNQkb7l3Z30Gecar0fLTi4ycX2e7IWgpnSyK+yLtShDO4YwemJdXQUindV2IkSwpwVKSAFd3dzFDk+flwi5ItCFrISoEpzHCNeOCS/ZJs+t1hMyX2Y1KR4BSSfg8OWzqQD2jbslFOuQiPZxEgy1YwFKDkvoACaRH+dCJKUJIeZvqIrRyEj1MUaT6EspXjNxKJPvGCtzp9tIRw3z419GgIgYpgH2wzg7sxM7S1qVoBTkGYfBoWelQ6G6VOaapB1Dj5xbgNb1MsKGaTBeWsEAjWM7Qxl1uu+VjX7NPeOnMxX/Iyv+WnyEaHbrhlTCSxSTV00r6QGmbKrekwNzBeJthot7LW4myqaqkAsONIjuDaSZMSozJSSyyAZTmgfNJcguDqc3pFHYTdcGp18YL35MRJSrCkJUrUABxq7Zn6xWS2c2uilelvM1XBIyHrFRMC1W0vlHwvIa0MA4KzJYUGP0IOhB0MQXbcycRSCULKnC0EIcO7HnmA1PSK357nEwmkhq14QAps9vrY9S8S5JHbYa4yCTVsRwiqikEBWeheM9u6UtE1SVAggsQaRolivdWIomrKFgbk5IfEkFylQyPMc3gNtTZwmfLq5Uogq4hSHRXKhCx5RbFlUHbO48tHPZYkQMVdyUzFTlnEQAAlJ1oHPEfZg/szcc2biUqfhSDQFKVE+jRPatk5ibQChajKUXxipQWNMP7p484bN5qmk4Oq7sDwuLpkd13WtctRU4U9AQz5a/CkBrwssszAlSVBTOToDnk+cWv8ASBs9p7FU0LQFM5O8VKNVEB2D08OcXdpkvICkKCsSnxZgNQh86EVEeV5GTLllU3rtCwg7FfaxaTLlgF2SXLNXEl/iYhTXCeQj2/JZ7JKjhY4mDF3dJNXjy7RjQgjh5kA0+BfkIrHSKtEdplkoyLYhUZDVzyo3OBdpJSyhqVp/vJp/3AQ52+5ldnuLKtSMLBRGFIA0av6vWFy9rvXLkqM2XMQkEEEpIYghs/KISnyZ9H/Fxxxwvf3WKyLCVrUkAuxPwcA82g7d12CWnuhaiQVOCzfu4uEV7othyogHJ6CvByB8YZEWdw5WVHnl5QJSb0eh4/j419/siTPSA5HrSo5xVWv2tMjXxASPnFq1SCBQuDRjz+/s5wTbqnLMtclLgLUhQoGdIU6jQAMD5QhrnljBcpdHU66xNVjCSSlL0Bo1XLREm6ZUtSe1SUuQog+82R/hJEG0W+XZgrCe0WUFJbuBxXOqutMoWLdalLUVLLkxpxyao+R86OLJnlKD0/8AIat01wSA76gx9d1jSnfD71SDxIr4QuWeROmYuylzF4aqwBRZ8nbjDTZpakJCCCShIxOGIZgXGlY3QyqTtnmzg4qkSWqYsSpol95UtSQOOJJEDtmbutcpI7buMwTiSSnC2gNBnlBWSqKtkvdRtOAAYMWFm4Zl+ukGU5RlcReKkthOzrLqUxG6WLcoM7GzwF4j7z+g/WIZ/cPIRTuW0BBw0dJdusK5t9jqGtGgzVBSuIi9ZgwbTMffWAVhvdK6FAHSDipiUpxKISBqSAPOA+hPwdzUxF2fMwt35tXJ3BInjtArIPhUNQTlm0Sy9qKDFKrqxYRnlVjUwFs3eRJRugUZRGZIo7cW4Rc2xteKaEA91I+NfpAFElUmctGRSot1SfmID7R36sT5iwlwkh+hAHk8apAC0xJKXGbRQmzuMfXdf0olNWxZPkeIfjBO1WJK6jWJnA6VO8RyiYW4oIBJSDx+sVJ9hXKOJsSDzZucWbNMTMHZzE9I4J3a7elJSmcFIeqJgqkn0Hg0cX9aD2CVu6pa05VdIxEV4Z/3o5RYMDod0H3FbyfjElzWwWVRKd6WQdwl8JFWrmNQ/OFl0PDsr2O+1KUBZySohihi56iGe2X8uzISlYHbEd191I0xKyD8BC3bdrVOtctCUqUc2FBoMorbP35MVOImstMwMoKarD9IxNUbm+SGa5ZdltrzDKSmZKVhUocsj+6aVq8HpdxyRZ1yCpagtZWFKYlKj00pFSXZZUiT7NKZaVVIFc8yX5QAvS/5yJiGUkoWHwgbyG0JPvNXzgRm7oR4kwPf9nIT2JDKCzVizEED4geYju5bJLSkICnVhLUUcLgkig73PnyhivSyJtEv2hAbfxjJhXlTUOcxAC+rdMscsuzTkHCcRM5Ev3lkMwJDhnpWGtyjXslOHBhLae2KRJSJCVLUQUnClZKO6rEzM7pA8YE3Zf1qUgyrRZZsxCgxeUpiOYIhPmW+2S6S5wUDrRSg4pQgsRqPKKipNpmrSJhWtaizpWWFM6Fkh24COWJ9Ojo5HHaTNClXZJUrdlTpeLTASn0HrFyTs6jC4mlNcjL+TiAB/DlCbMJs22zEzFJcIQXS/ByXPWkLkvZ+WgvNnTF8sakjxq5gLFf+o3x/kvISpDvfF1GSBimJmJVw5ZuG+cBFzwgFKaA5hzXM15VNIFTb1SkBMtDAUFGHmc4pWmXaFjdwh+JNPhDqCXYM3nZssOD/APS9abwSIO3RdchfZqnC0oW4fdQZZJLAVqDlm8JQsNpYJKZD8SlKieuLwpFi7kLs6wpcmQSCCnDKCSFAihIDMeUPJWvtezz3KXwbbd91SygS0rWliXAUXUa1VXFw1akD7ddMtMvEmemWtKwVKVVRCSdzEWbE7OrQjrHthtyChE4LDTSA43RkKYuoo+phat13kT5/bbyJizgJqyVF0kNkxAFOA4x5viynOXGT2Z8c3ewvc9ru60FYK1ylvQKUAOooxDvR47l7FiXNEwLCsZOEhgxIJyPEPrCjaLmQQwKkeLsfHKK1jve0oV7QrmBJICVYqNQH4mPUnHIkk2XTTtxW/hmm/wCr88pIGGoYEq+jxRkbFTwvGZqE55AqJfyhflbZWiWABL3DUBzrnm5i5L/ERXvIVCSyTWhoQbVukzu+bPbbI5BSse7MCTT+JLwPuix2y2KHbzFmWn3j3RySnJ4KDb1KtG6xyNrkv3hyoYk8k2qo0KMVsFbXWREuemWgMlMsdSSVVPOKkq2TUgATFADKsXdr7OtNoBX78tKh0IZvAgwMSqNMI1FWY8jTkzRdqrEFYLXLDpUBi+R8qeEZvaloVPWleSiUq6Elj4GNssEgIxyVAFBJKHywqqU+BfwaMUvZIXMmzEpwFCzu8EE08qeZjQ2RQuW2yKkKVJmjdNUq9FD5wY2e2lwASpxLjuq0PIxevFEybJCkyxOlgVSKqTzAz8oR5hDkeucKE1RV5YQCFJI0BOcUJ18y1UCSDyhSuHaDsfZzUiZKOiqt0hrl3dZrQMdnmBCtUKy6coAxEraGYdyXKMxteHjHE4TUo7dUtCTiBUEkksaOat5QXRYJqAAZZYfuhx8ImQgndKSQaEMdfCOOBN2bM9s5K8KX3WYkjTpBZOzsuWuUmWkkqUQpblxQkdK8I7lWtMgMtQADVd6ZZcdPOGG67SxxKGpw9NCecZ5KT6KxZxfkrEBKSqrNxr9tGPptMxigqUwIJD0xBw/XONd/NpVaCmhWA4TqAdT4esZ/szZ0zLTaJaw6S4KWcFpmXHyrE8EO7K5sm1RHYr9nyUhRlrVJLFSi5eWDXC9EJIIFHzd4q3pOXa5kxYUAJndzUAjJg/AfOC+2V4qE78shXskEJ7NHcSpI3U821agLZtAa9bKuUe0khQCAErxUQo8i9FEvyhouK389E5ScmWfyaAwLpYNXgOHH9IpW69UyU45OFSwWUQ5CCWDnNiS1IE228VLA7MK7RTslqjiTxbSIrkkmUCVOSquE6MDUj96p6UgrFSuQ/wBa3SJboVaDidS3d6vhTxHWCcyz09osqPIM3QEfGOJpmJAKk1Idh3gB+8PdD8eEBr0VNWQxYNxaOrkwckl8hpU9NHBHAvUfdYqW+3qT3SrCA3zrrkIWVSZj5LcdfgY4nzZjAKKmqzvFFiQjzMP2jaINhSnESGJUSxy0+cU7PeK1E9pNwo97U1pupZ1K+zAaQA4BOEHMsS3NtYY7vsiJa0TZc/tqKoiUpJYYUnvEF9+hb3TBcYxWiUssn7NBuhcgSBKlzCcOHcXUgYSwIpv0DsPnBCey0JGKpSpQAD1cMBwcg+QgXZ7WlEsKVKTQOyAlKklnS7UVRs6UML9yW5Qm94qU2fFiGPWPKxYpzm5x9GeMZO5IZZq3JPEP46/F4hSKx2sqJKikgEqwlmBAOnHXzj0CPbjcoqyqZRtIJMRdkYvBOZiWXLEd9Nsbme7O3f2loloIoVB+j1+Dxrv+hrO4PYSnSXB7NND5QobBXd7RU0jKg6l/l6w/RzVaF5Nme/izZaSJo0KkHxYj0PnGfBca7+Illx2GYdUEL8jX4ExjjwrQy6N7ticQCxpWnD7r4Rg98yJ8mfNWlBWgrXo4KSo8Mo3a3TuyQtWmEkdeHQxji5ysasbpJLs7Z8G0h/QgFui+0Sz7ElCzmibMSlPgoxU2jlzF+2NnS3vTJKhMT/NhfCedIPTboxnHLXLxfuzpaV/92frHKPzUo+0ky8GXsVpluOYYP4wowgGYOYi5Y7SRkS4gteF2SluZBU+ZlqqR0VlABSCkuM444ZrDe1qYtNUlIzP3rBWwTJ84+1mzMH7rkFQ4ngIX7n7WYAmXLVMCaqCQ/nDH2xksZ+4+SHGM9AHYcSYAw0Is0paZaSmiGwjJiAfNn84u4ykZuPvjCvZL0UouaFQ3E/up4nwr4wWsVsQtaEqUwUadU4n+AEBulYUrdDDZEhCCrCyyHUWryD6sIzTZi0KkSZ1uPemEos4Oq6la+iX8+kahPsy5gIBGFtOesKu0myU2YkdgpIRIlhEqSc2Ge87Y1GuVYxvInr5K/SkK1osK7KZcycU4pm8kVUWOayrJ66EnOLc+am04JKFMFhSkpIG5M3iyiBvJOiuBrkYXLxty1dmleN0PLwqBGEg13dCxDnVhEBBq3Qh+Y+g9I76d7fYFD/ct3ndC7PLCpYxkslagzpWSp0rbuhIZIZ35QG/Mz5ZDpCzoc4PXeqapRAWEsCpZURhIpixAghVNKvHc+RLGL8uoLnABWFIUWZQxFBqFAB3FSHOejrI06exHHiULxvOdMSlIllKwgLmFTAGWkAVJZmW7fxJGkB/9LvnLp1r6QxfnsUsghI3SyACylFTA+Ac1NMVA9IGm71LcJlqbXCk5s7OB1PhDQpLaoKi0gVMvOYshMsNwADkxJbLSgoBWh1OwBLKw8258WhlOz0qRJRhXLXOmMVKWAyHFEJJIANQ5qaQBt1jTktRDEuW3q6FWteMGGSM+hE5MCTLQlmTLAcZmp8OES3Fa1ypoXLmiUWIKixDEag0I5RVtAYkO7dfnELxetCsarJtEqW0sLc7qXainBrw1HOsQXZfTWgEBwFGhyJrAGxllpVmxc+EcS5hCnq+b88384RYoq6XYFo1yz2rEyUrJll1BL0SToBlyyi8mU+sKNw25lIJ7q8uR1HSHSXFcbqKo6qPpVnA59YspsqlFISPeY0ozGPpIBIGXOHu5rPLVIlhGQWCqlSQ+cU50K0FLssoly0oAZhXrF2KlrtGBJVw+28nixJmBQCgXBDiJv5GIL0s3ayZks++hSfMER+fSGoXcR+iyY/P17lPbzcBdHaKwkajEYA0TaNp5+CV/ERRnfiPERj1qvNAmKlzZeOW7hsw/CH/8QrywmWlKh3STUalvlGdIO+S7O2XQQ3pCoI2a7LNMGKWucn+Y084I2OzzZeU3tEcF0UPECsULPNA6xeBhRkXpoSoVSl+IAzhfvbZSTN3kHAvXUHqPpBpKXiSYnDnAOoya12edZphAUpC+KVZg8xmIgTaFqOJZKi+Zckj6Q9bXXd2qO0SN5HxTr5ZwjqRAZyDtnvRTYAN5ZZSuX7o6w8XRdspaTJmoTjcqSFZsS7pPFyXbIxntzAGfLfILHwP1jXLskS1ArmpGCTvudCK0PSI5Z8VspFAi/bcu7AhXaTJgXUS3dSUjMnQj455wPvG+l29InWCa0yUl5kohlrDe6DSlaa/CKF7Xp+ZnzJ8x2yljJkjLo2fUmBdy2qTJtcuaWlFyykhqsWdswaVbXSM6iq/JpjOVWxu2ku6UqxfnLRJCLUpIQoOQoF2dgzq06GMylymVQAD5a0z5xoH4gX5LndmiSpwd+ZUd4gN1DFR8YSJ7J3mcByp9OmfLhHeOpKL5eySt3JjBd8oCzyzKsqrRNmrUFK3jLEuWd5Bw91RZ34VeIlypdktKu2lYZakKYJUVlJzGEsCd4MQdFEVeCH4e7RKZVnCZnYkGYHSoDdUMbKFMNXNcw2sd7RSZFrQq12a0BSkpZciYQghIcvLdgoZnV/hCfUl9Xi1r5/wTbuVCcuYH3e7mDr0bSkOlzWNdosJEpWFYxJADb6t44S+TpVnTLlCeLHgGIJZ6kvllDvcFzXjZJRPZS1rm78sJmDCGR7xIDFi8HyKcVT3YcmkrE23TSVH3VUCkkihFDFyZbJarPLUFDtgFBdAQ4IwF9HTiFP3Q8IykTJhUslzich6uok5ecTSZM2WSUh3oaFQPERq+mtbEX6Ll43aZhdLBQFX1HLjA43cn/mp5u46NxglK7cgMJaGerszgaaZDz5xTXd61KPaKD5MM3+Ghiif5DJfCDmxdySZ65gMxxgKe6RVbjEOQzhWtlm7OYtD4ghak4mZ8JIdtHz8YbtgZv5adMWuqVIKaBy4ch/i45nhHdruxJV2qpO4tTg0BINXLZKIcl9XiKm45Hb06oVY22VtjLNMtGKQhOJSRjABDtR2c8fWHm67S6QFZgNCPd1t/J22RaJQHZuykjMBt5JbXCS3GNFviyiXaSUt2c0dog6b2fxr4iElmlHJXp9f8lYw9P0Tobl5w47LWxKZRD5Gvx8yeEKUrLTygvciXNS1aD9OMasUrEyRobZh7UEcMh9YH7HXhjQqWc0ZdD+sdWC1IlgmZMSCVFh7x4UFfWM92vv2bYps1EndTaJe6o95KcRcp4E1HLOLvokivtttlaJs6bISvBJQooZHvAFt5WZq9BSFLHFJCosBUSGGi3SAoMRA8kJwjgIN2xFIXbYsjwgnNhGUrI5wXkrpACzz3HrBiQaRwC/KmGkX5a9DUQMs04HJuYyLxbQz5+GcAJbEhBrnCttZs9j9pIljEO8lIbE+rcfvSGQlqj/OOkGOOZmezkpX5yWgJdXaM3P79I0PbK29mhNilmpGKaRwz+/5Yp7L3emy/mLwnJ3jMmIkJNH31VHXIHgCdYW7beKsS1KUO1WXUS5q+Q5RgyS55NdL/AD/0aMcdBiTs0tXYicDLkzQcJcH3SpOIZgn5+ELN43BNs6yZgATQY3JGIuwHgDloc4Yrn2hmTEIlzZh9mWl03cqg6hqMS9Ca0j7a69wsIQkh2ClOxyoMiKM8RjPLHJxrQG5OdPoVBZUpJwkt0IA8qGLd2TZcqbKmTJYXLSoEofvs9N6mbFjm0QrmAjJzygJedlmrOEI3U5VcudCdf0jWly0yk6S6NotG00mfKX2MpQ3DurZLFO8264agPNhwjKLFd4GJc5WJTkoDUSVGrnmeHGIbjta5SFJxr30lBGjEGlRTq2sWEFLVJJzY/LwiWPB9Jyp9k8cEtkhWoF9017uRbQCvhGxycCky+zUpMooBQxJwhVKPqzirxhduSSoTJdFILoVkoENV8iQcn4Q6J2xUqy4CCiaQlJYhmriUng9OjmJ+Tgc+LQMi5uhHtdl7GbNSkhSQtSArJwFEAtxoK84LXKjGVJC6ChBCnIHE8dHisLMMSlABTgEgtoRkPOL0kY91aAAKggMzilfDlrGqT0UhGmWZtlAostw66afbxCEPulIKRUUHDQxLMZmKsTPU7r8BnUjmDlEEuY5CSMTg5Hg2R1OdIkrLOgjsghUu2yFZjEQx7v7NVeVPWDV8SkKRMTiTLY/tFGhLkncFVO53Q/g0Kd2S/wAvOTMC5hwqxGWs0LuKnOJkWOZMn4STjmKoCQGxF9RQB+dInPGpTU2+iEoXK2CNo7vaWFpUglBCt2jhvlD5s3bBa7rBFZlmpzwEfIU/khZXYFKE1CxjQhWAqS5S4UzE5/OOvw1vP8vbjIUGlTnQxBAcmmfNh/MYbKnLHa7jsLpStdMcJEykX5AAI3sR/dDn9BFC2yOymqlnIGnQ5ffKC1zlIVuqalWoY14GnFNeyWT8jVdVjQuQSJYCiVYaBx4jpGUfiuCLTKSc0yA46rmRr1026W/ZEnGz195311jG/wAVLUFXlMTohKEf9r/1RoZFClLicGIAKxKBCHGgzkuIWLxdKnyho0gBfUurwwSG71JLgFjw08Dp8R0g1Y5lGNCNPn0hYsSEmYgLVhQVDEXZhqX6RyjaOZIWUKAmpSWCgcJI0OoqIBw3nC+gOsWUzKO8KiNuJHvSZngEfUR3/r3Zx/w8zyR9Y44bU2tIHPSCV02czVgMQMyeX10jPU7dTJisNmsjq5q+SR84eLzt06yWJKJhSLTPFSmgS/eHRI3XepMZ/IyOEaXb6HhG2Bttr6TMnYEn2coFKQMirIkceA6QsWOwTZpPZS1LIqSB6nSK9oW4yHX5+kMf4ez19spCCClLGal6sSwLa1oWyxCMs7xYm4+i85cY6F/CEjCUkLSS+YbOhHWJ7VVCWq9XIfl4Qf8AxFsaBNQtKQ68QWeIDVbMmufIQty1oSAMJws2r6ccoOOfOKkHHLlE5s9jXNUEJZ1d16ORo+n+UOGzWyak9qq0pUFCWWTRQSkpd2yKvR4ULNeHYT5c9GJ0EhSXdKkkEEMdWOcG7028tHbdtZyU1cJKQcaWJwkPlpSuRhskZyVREnfoWlllEYSCQXYeobPrHRkk1bWlCBpny+sGdpNqbNeKUTBL7GezKOFSnIBpjAZn1z4wPl2gkbpST7z1AUKE8xQHz1h1J10NCXI5kz2GiTqBxEcqk4iMICuQz8qNENpmYsQPe/ujWnpE11KSqdKlqVhBWCp27jjFU1y+JEc9KxnJLs+7JRNXG6+gp456xJKsqTkoc3Pzyh2/ECRK7OWslAwrwpYOyFp3W5UrweESxS8RIC0NyBDmvIE6ERPHPnHkdCVqz2akpJSanl8j95xIm1ISxCA55kF+QyHxzjq1WJSmUKgc2NdOEcKkgJONTNkDroH0/wA4fTH2T2O0TFTZaUJJL0DAgsQWU/EPGoXzLTNP5xIZpaSFAOopqa0o28/8MJ123Td+CVP/ADqZa2BfeKgSlilSMLEZjPR4aLo2nklPYqKFzVFeISlPuVGNOu84LCoKjwjP5GNSSvr2Zcrcu+hG2gv7tgEy0CXJSSUgJZzxPOrwo3jPVLCVvkoKSXL5+rRpm1mzKUWMTZPsUy3UqWtyVFSkDCFGrZ1rRozS12wUlrSN6go55DnFfG48ftWgxknHRq9vni1WWRa01JSAvrkfJT/3hFS7Z+FaVcDFD8LbYCLRYFn+2joc28GP8pi8qRhUUKoQWPgYfxPtlLF8bX6Z09qxqv0FM2UpJZ5YIPME/URk34l2tK7xmKGqJYV/F2aY3e8bq7WVLZsSAGfUEMR6Hwj85bXLx2y0Fv8AeqH904fQCN7eiCI7NMfqIsQMsKyD95QYSBwibOHpRaB16SwUxPd07HJQdQGPgW9GjqclwRDtBFKYmkV59l7ROW8KeUXpkveaLCJCGVVlhmByUKv/ADZHoDHLqwdipKs4xsoGnrzgjdcmX2hThSScnbXrziO/gQQQO9n4fYj7Z27JlotcuWgEKJBJ/dSM1eH6QzmoK30hOLbo0rYe6kJKrVNATLlvhegKuPh6kcIDbRXj261TC7EEJBfdSDlWrnM9eQgptTeakf7JQIBBYCoGgVm5Ud4nnAS6rMm0TFSDM7NSgcBLKSpbBgS9HGv+ceVKbyTeV/2/RuxxWOIBFhUuqUqUGJLPugCppUga9IhQm1Wa1InJJBCUqAJ9xaQcKhqFJb1jXNl7mXJs0solIEwKWmeVhlUmEDCa7uEZZF+cJG2+JU9UzBupEtCi4ZKsLBPIsHpHQz8puFaI8uUqKd+37MtJClpSgJ0JdRoGyoMviamBCVOdRTjSn6GJRhIGZPD9c44lSgKEGv2axeKjFUiyVaR0izleSeZL8+GvnHpu/GxKFBSO7VvJ/wBYc7psclSZLofHLUk9QVMsEHi3lAK9JaZZWgTl9oigHZgPSpBxEjyyGkQh5CnJxXoEZxbaBP5NhiSmpzJFDzL6kR4JBSDvCpenHL6RHMlrYneJNCXB+xFi7wVAY2biQ32NOsXd1Y6SsjXUhTu9Fan7+sGbvviwCyoWApVpSFIKMASQskkKUsiqe6G5ZZxTtKUpOfRtIoFncBLHPC2utNc6wjSmti5Md9nqrfOVgBWs9mAEvp05mLNsmrQB2gIWmu8lTtx/tBtXgrcWy/aIVOOJCcSAgAftCTmXHdZzSDH4g9kAhi6paRKA8cR5UAav70SeeH1FjRNZKlxQqWe9XJTm43QRnr5xxOtJAMtt096hq2XxJrFYzglt18wRm3l+kWMIIdJfg+YA+MXpLZe3VFZU2XLAxFIDMBlQZ9eMNn4dSZMy1hZUcUuWVpCT3gMxTMPhLa6wo3jYTMBqCoUBI6c6R5sx2lktUu0JV3DVIfeSoEEfF+oEFxUoslk5dUax+JU8zLMiVLqp8ayMky0njTNTU1w8oySbdpUtlUKS4yanXLpzhjvW/wCbaVuWSioRLZ6B8+J184oLQp8hwLpag0fl84liThGhoY0o7KUi3mx22RPcZgKAGaSGPWjiNavuQjtJcwd2YzK0dqeYbyMZXfdlKpdQnIkZ0UwL8nDZ+MP2xFr/ADl3dkovMk7vlVJ9UwJy4SjlX6f6YGtuPyavJ7qeg9I/Mm1TKtdoUMlTl/4zH6HsduIl76Vhk94pYAAan5x+dbWMRJzcu/F49FmZA5CGLxeSqkQhMcueMA6hu2ftHel/zD0PygotVawAuH9qOh9IN2nOKR6FYPtlmAJWKvpAe1q3VK4V8jB+b3YBWv8AZr6fOBfoLRKmSm0Sq0PL3VffrDrstdKLssky0zi82YKcQPdQOpqfDhCVsxr/ABj+mNE/FL/40v8A6ifQxh86TfHH6fZTEttmb261KUtSlqda6rb08BAu0zF4gtC8Dccur5gxatWY++MVLVmr+AekNFJFpfBpmy34hKEkItRSqYCAJgoCniumnEZwvbZ2+XPP+zqSUqUZqqM6iWqDkQkN4iFKx/sxHdi9/wDh+cT+iovkhIpWSAkNkWGVatpT7pENqK6dmQC9X4dIsjveXpHPvefoIqOw1+Hm0RlqVJnDEpG9LJNQCWUBxDl/Ex7tpbO0tCpksJYoSCARiDCoJGR5GFmwd9P8/wA4syMlfesS+lGORzXsnjWyWXam1PFgNRrWn+cdi1Y6sMmA4Np984HLzHj8oks/ePX6xXiiqkyymY7OVCpauQ+kfTlrCVFOFSmoS3HnFZPfPh6Rbke91gMPYe2K2vVLl9janGBWKWojRi6TwbQ8FchEG1V6CetIQxRhcHJ1qLqP90JDnhygPaO6Ov8A6xFO7g6j5xJYILI8i7ZNQSbZ7NcCoOehypElnmgFnoDkOeeXSOJnu/ekVz73X5qi1Wh7plida1Y8DZpBenEimnhzi0ZQUyjTV9C4zHDn0ihaO8rp84LSv2H3whZaQY7ZGZWEpqRkWOZHy6x3JtFHdurfGCNs/bq6xX/e/hhB+iRORIASWBIzBB5+HCLmxVuMi2gEBKJwwqGgVofNvMwOGSP4PnEaM5XVMI1cWmLL5NU22v7srIpA760lDvknUtxq0YwsRpn4lfspfU/0xmk3OL+NkcsUWyE4pSZWWYiJjudEUaCTP//Z	1
2	Claudia Balboa	Lo mejor es pasarla en familia una de las mejores oportunidades	data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4T/+RXhpZgAATU0AKgAAAAgACwEPAAIAAAAGAAAAkgEQAAIAAAAJAAAAmAESAAMAAAABAAEAAAEaAAUAAAABAAAAogEbAAUAAAABAAAAqgEoAAMAAAABAAIAAAExAAIAAAAHAAAAsgEyAAIAAAAUAAAAugITAAMAAAABAAEAAIdpAAQAAAABAAAAzoglAAQAAAABAAAGdgAAB6xBcHBsZQBpUGhvbmUgNgAAAAAASAAAAAEAAABIAAAAATExLjIuMgAAMjAxODowNzoxMCAyMDo0Mjo1NwAAIYKaAAUAAAABAAACYIKdAAUAAAABAAACaIgiAAMAAAABAAIAAIgnAAMAAAABACAAAJAAAAcAAAAEMDIyMZADAAIAAAAUAAACcJAEAAIAAAAUAAAChJEBAAcAAAAEAQIDAJIBAAoAAAABAAACmJICAAUAAAABAAACoJIDAAoAAAABAAACqJIEAAoAAAABAAACsJIHAAMAAAABAAUAAJIJAAMAAAABABAAAJIKAAUAAAABAAACuJIUAAMAAAAEAAACwJJ8AAcAAANeAAACyJKRAAIAAAAEMjMxAJKSAAIAAAAEMjMxAKAAAAcAAAAEMDEwMKABAAMAAAABAAEAAKACAAQAAAABAAAMwKADAAQAAAABAAAJkKIXAAMAAAABAAIAAKMBAAcAAAABAQAAAKQCAAMAAAABAAAAAKQDAAMAAAABAAAAAKQEAAUAAAABAAAGJqQFAAMAAAABADwAAKQGAAMAAAABAAAAAKQyAAUAAAAEAAAGLqQzAAIAAAAGAAAGTqQ0AAIAAAAiAAAGVAAAAAAAAAABAAACYAAAAAsAAAAFMjAxODowNzoxMCAyMDo0Mjo1NwAyMDE4OjA3OjEwIDIwOjQyOjU3AAAAH68AAANtAAAfLwAADbUAAB9bAAADtwAAAAAAAAABAAAAUwAAABQGXATGBwMEN0FwcGxlIGlPUwAAAU1NAA0AAQAJAAAAAQAAAAkAAgAHAAACLgAAALAAAwAHAAAAaAAAAt4ABAAJAAAAAQAAAAEABQAJAAAAAQAAAIAABgAJAAAAAQAAAI8ABwAJAAAAAQAAAAEACAAKAAAAAwAAA0YADgAJAAAAAQAAAAQAFAAJAAAAAQAAAAEAFwAJAAAAAQAAAAAAGQAJAAAAAQAAAAAAHwAJAAAAAQAAAAAAAAAAYnBsaXN0MDBPEQIAQgE3AYgAggCTAEwANwAxAEkASQBoAE4AWwB/AIQAagBuAVACnwFqAGsASgAtACwAOABFAGcAXwCMAIIApgBXAKYBhALaAroBTQBeAE8AUABLAF8AbQBZAG4AhACMAHIA6AFVAscCWQJIAHkAcQBxAH8AhABoAEgAawB1AI0AawDPAQQCSwKiApoAdwARAWwBmgB0AFsAZwB5AKYArQBXAKkB3AHHAaICogBEAHEBsgHnAEUANgBMAGkAfQB0AGgAwQEsArsBiQL1ACwAAQGkACgARgA5ADoASgBFAFYAYADdATsC5gHOAp4BNACRAEIAJwA9AEEAKgBhACEAUQBQANMBVwLoAX4BuQBtAF0ASwA5AC8ALgA5AEUALwA0ADsAmgFgAi8C3ADyAFsAWQBjAEYAKgAoAEIARgBUAE0AVgBoAR0CrQL9APMAQwBKAFgAPwArACQAKQBDAC8AOgCRAIYBGQJUAjkB8wBMADkAKAA1ADgALAAoAC4ALwAsAGcAdACfAA4B/QC7ADYAKQA/AHgAgACzAGsAWQAqAC4ARwBZAHUAhAB0AG0AWQBCAEAAUgBXAIQAZwBKAC8AIAA0AEcAYAByAGsAQQCJAEsAWwBGADEASgA9ADMAKgAjAEkAOABIAGEAYQAzAGcAOQAzADwAMwA0ACgAHQAgACYAPgAACAAAAAAAAAIBAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAIMYnBsaXN0MDDUAQIDBAUGBwhVZmxhZ3NVdmFsdWVZdGltZXNjYWxlVWVwb2NoEAETAAAkh9slbuASO5rKABAACBEXHSctLzg9AAAAAAAAAQEAAAAAAAAACQAAAAAAAAAAAAAAAAAAAD////c1AAAI6f///lUAAFY0///7nwAAGBAAAAGYAAAAxQAAAFMAAAAUAAAAUwAAABQAAAALAAAABQAAAAsAAAAFQXBwbGUAaVBob25lIDYgYmFjayBjYW1lcmEgNC4xNW1tIGYvMi4yAAAPAAEAAgAAAAJOAAAAAAIABQAAAAMAAAcwAAMAAgAAAAJXAAAAAAQABQAAAAMAAAdIAAUAAQAAAAEAAAAAAAYABQAAAAEAAAdgAAcABQAAAAMAAAdoAAwAAgAAAAJLAAAAAA0ABQAAAAEAAAeAABAAAgAAAAJUAAAAABEABQAAAAEAAAeIABcAAgAAAAJUAAAAABgABQAAAAEAAAeQAB0AAgAAAAsAAAeYAB8ABQAAAAEAAAekAAAAAAAAACgAAAABAAAAGAAAAAEAAAxjAAAAZAAAAAMAAAABAAAAKQAAAAEAAAIjAAAAZAAGRQ0AAAJxAAAAEgAAAAEAAAAqAAAAAQAAFd0AAABkAAAAAAAAAAEAAO1lAAAAqQAA7WUAAACpMjAxODowNzoxMAAAAAAACgAAAAEABgEDAAMAAAABAAYAAAEaAAUAAAABAAAH+gEbAAUAAAABAAAIAgEoAAMAAAABAAIAAAIBAAQAAAABAAAICgICAAQAAAABAAAxMwAAAAAAAABIAAAAAQAAAEgAAAAB/9j/2wCEAAEBAQEBAQIBAQIDAgICAwQDAwMDBAUEBAQEBAUGBQUFBQUFBgYGBgYGBgYHBwcHBwcICAgICAkJCQkJCQkJCQkBAQEBAgICBAICBAkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCf/dAAQACv/AABEIAHgAoAMBIgACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP5R9c+FXiLQdct9LnRnS8KiF9pBYM20HBHXPXGR71+w/wCyN/wSh074tWkmq/EnWZLa13Ytfsi4ZuOS5bPGfSvq3wp+zZr/AIw8N6DovxHgW91DSZpJmuRmSUhySsZkwCQoPT1r9PPBENv8J/AbeIfEcZ0fRNNQeZdTKYolUdPmOMk9gMk9hX8/cWcYZg8F7LCPlq3aulfTuvU/sngHw8ytZhKvmEb0eib2b6PvY+RtT/4I4fsveHPCQFw+oy3AdWMxnyflGSoXHRsfWvxf8b/Av4e+GPiVe/Dfw1pEutXVretamRrn7PDE+49XIw2ARnDADBHWv6tvDbfFX9pj4c6hJ8EvCut3Fpc20o07Wb2JLKzll2kI0bTyLIyZ6OEI71+K/wAV/gR8V/2XtBn1v47+BtU0a6iuFxdMPtVs+T88izRloictxk55J618Jwdjs9o1KlbNJTqRdkltq+vofWeJy4cp4KCyvkpyjvJLm07W11PgnwR8I/APg/xJOty0euaosc+LCMLcRwxqM7mZc5k/uqucA5Jr6Z/Zcig8I6BNoNhaTFjdu6SyfKHYKC0eeANvGfrXl1r+0x8LtG1LdpGmyS3ky7JJ0SNFCnnAKkYLN97JOQK+gvAPxz8AyeCL3xB8QI2tJln8q3jt8TKZ0DExt12krg56EdDXo8U5njZ4aVKthp2nZXvtZ6JR6n5dwLmOEnjaU6VVLk5nrHV3Vm7309LaGP8AtYWsl/p9lrs1rPLLHEVWeAh4o03ZImJU9c/JggdetfKPhVk1CVbfwq02lTxrEt1NJKknmmR1VFVDGcFmOQBnjr7+r/FX42x/Eqzj0VLR47a3YvEC+0HIx+8G3G3uF9e9fFnxEl1XSPDa61oEdxbyCfy5ZMDySNpIVGCkhxjd9BxX0XCeVYr+z1hpe7K9lfVa9128jbi3N8F/arxMfegld20em9n38ztdb8OeLrd3msrTT4FYod8slsxw8hjUD9x1JBI9AM1zPhrVdR8PeIbbUtQ1OzsILVjmWKTMqAozbkEca56dM8kgV80aVc+H5mX+1NMm1acsCrPeyRIc87SNoJyfRh+tQwL4Q1PXYpf7ChsYZsKP9LldUORliC289fu5HH0NfaRyDGcrp1pQ+UL/AJ/5HzWJ4sy26qYSnUXrU/yt+Z+tfiqw+MGv+A7X4paH4ysIdD1D93DJPJLE0jpGWIVOPmcqSRnj3rnfAem2sN24+I/xDtGWUhozbX3lxgCLzMNuYklydqdOQc4r4q1X4n3Vx4MsPhZceF7DVtD0uVp7dLi8uWVp3Xb5oAlUgANwhzjB561J8O9W+EGjXh1L4haHp1vcqSIIINPkuY8Y4kJNwo3K2QVIIPftXxFHIMwhRqwUoQjd25aMHJro773+R93LjLJ51KXLTnUnZX5q84xUuqte1vnqfq7aeHfD3hzwDrA8Paoniud7Q3G5tlzzNECsce8E4jBIfA5YV8G+AdY8U+HvGlrqXhW3a+1GMlIYVGQ5KlcBUGc4PQd6+pv2efiDD4p8FavqPgvT7KG90xZYY47a2e3R2ZCYy264dnZwPm5VV4AHNfFVvdazF4gzozyxagsuEMLbWEpJGE+bg54rzuGMLWhiMVhsQ+Z6Xb0vddlsjDjHG0amGweLw8eVXdknzWs9+Z7s634o/sreN/iFqWpfFjxJqcNhqWpA3Dab5REolVMeVhmGM7Rg479K8U1vSrq8+HmjfDrxnpDxarodwrLcnJmFlcNu2MFyNm4MOehI/H6Qtf2UfFWl30Hxe8Q62Z9WmjluW0W/RmE8iKwMDSCTneAMfXpxXuf7PGpRah8QGOteHY/DTvo8tzNp5jjUO0JHMbKPMZABkEnIbj0r3804snhcNBRqqcaS5koq3K0rct27tW0vZo/IOI8BBynXnQmm38Ta69ZLp6HiXwZ0XxZpnjuPVNf0x9Il1a9mbSdQRyZLa+aLyxH5WTnfBJ5eOCFx1Iruf2jfER+D3hGf4V6XpwnfTJLG3W6k3mJonV5JP3SsFcSSHagIOGQnq1er+ANJ8UXvj62tbq/iuvC1xEl9aQznzGs51RZNsUagSF0bDMZCSRzu7HwD4teDPEVrpvjSCzvd0L6xouL9woeCT965iAdtwLHaVIyrAbhX53WzWljMdTddp6J7vul6prW6+47cgwuFp4erUqVHTknFxTjzcyu+Z+VtPX5Hz2t1o6+Fr7w38RNJ1HR7uxjNxZXN3Zm5tII7qM5BjbmJZTyHBIHWviu10dzpw0+8lEcd1iRc43OF+6yseSABwR2r708bftP+Pf8AhLTo/h26TWLS4jWOQalAzQuu352ZHIDJkE9AuO1fKtvpv/C3PGbyRPa6ZEZytusS7QqvwIokyQAQCRnhfWv1HIKlaNKU5RcIy13vt5b6m2X1KKq+ynUcoRvroo2dr2vra3R/I//Q/b1PFOn+G7SXV7m2sbKCJS8jiJAqqo5JJ6ADnNfnz4O0TxB+3b8YYfi58UyZPhn4bvDH4c0U/LFfyRnDXs6DhkJHyg9QAOmc/GP7YP7Rfin4+/Fq0/ZD+Dtw6aes6Jr15Ceqg5eHcOiqPvercetfsn+z7pmmeGfCWl+FdLjEdtp8KQxKB0CjArwFl6s69kkvI/YlinzKk2235n6PeF7+KG0ggjQJFGgVFAAVVAwAB0AA6AdK9Hht7HWrSbT9UgjntpFw8Mqh43X/AGkYFSPqK+etF1SPyFCtho2KsPoAR+hzXuOkava+VHcSMFzGysD3GP8AE1+f5hjZRbknY+3wmEjK0bep+VP/AAUK/wCCPvwA/aW8Bah47+EOiW3hTx9p8D3EEmmRrBBqPlqW8i4hXCb3xiOUAMGODkGv5D9A+KFp8DdAhtte8PG6sZJGSKOSJEKTxkrIz/eO8DK4Pb6V/pE20ibAUOcY/QV/AD/wVO+BUvwe/bR+Jnge1t2NjrV0up6VGsRfYL4i4JjIOEIdnXoQQeleRh8RHHXw2Kk2t97fczPMKE8FNYrBRSl1ur/geN6xqPhLxdFD4xtrYJDeW7S/Z9PxIySA4zMWXC9eRivn+70LxLqCO9jpFxqFqCWVBC0sQbB+YLjbuHb0qx8Bfhd8VvDPxIs9OsrltLa8QvIJztWWJcM0bIc5D9OmRnNfsHYeJ9ANkba0hliliAjlsoYyxhk752kDB7How5ryM8zdZUlQpr2l9tdlf5/ee3w7kjzef1mv+7s9bx0k7fJW7r8z8EW+HEc160Gs+GtXByT8sDvyfQAqOK7/AE3wd8ItKMa6j4A8QXsysrHzIm2sM8jYHxz681+kPib4kfFW58RTWHhrwwr21vMUAZSX9Mlt2Mn0ycV6LpifFTV2jF7oVlpRH3/tFyXKg4Pyohz+Zrycw4izF0lOopRXlVS/S59lkmX5ZSrShRp05yTt71FtfnY/K2V/ha0zzN8KtTjkLMMRxyooU8IQN+AwHJ4wTX0f8L7O/g0zb4O8AXGm2shxHJeSxIzOcKzujsX5wOgr78i0HTCcXsqGXK7zEW2gn0Jet5dG0yGNHYoDuz94EjkDj5u/TPavz/MuJXOHs489/Oo2v0P1DLcPKlNVfZUdO1GCf6nlHhi31PwN4TvJ7TSI7d7RJbnyrbaPNlI3EfuwuSx69TX5bXfiW8h8av4lliSORLv7SYAGAVt27by2eD7V+sPxj8X/APCLeBLvVvCN6IbtUAhdCJDncAdoLHJ9TjivyJ8Qz6vNqs+oak0r3Mrec7FDksxyW44yTzX1XhlRlJ1q9XW+l23f0PyXxpzZSnRpUklbW0UlHtfTb0P098QfGDT9f+C9uPFGnmDw/wCIYY21K6ksILjVNPmhz5q6TPK4CrOq5Xz1JibJTOcV4n4b+PmifEvwbZ6PoHh+dX8L3DvJrJsRDf6nYSYWMXNwGby5EBBkjhIR1y3tXnU37Ti+J7LSvCXjbS7jV7V0hF75iCONHjJDPGsWHztxy2VPpXr9t4S1T4o+IPDOleDmutP07RHMz2iAmKeafMcUm8EeYbdTvZPQ5AODWcsvpUlKGJiqbu2nfRJd+rbWltup/PuZ8UYrFSqU3HWSs2r6/pvqSaxZeHNI1rTPE2majcBL+6iWzhtj5ksIZcHzEB/1b4wwHI969Z+LfxW8IeEfB174K8dQ7NPuLm0sbrVLWGOZoJWSSSOR8qzIYUXDqPnAbg4NfJMniT+3/HNrqOsPeaF4b0MSy6eq2D/bZ9WjODtTKNHEgGHkbcjZwFY16p8Sp/BEfjV9RnnfTtetri2TU5ZYpMC/lsjPErLu2Y8kMskjDCjhsg14GaZbTpV6UqknJWvpvvdXff8AW3c8bJ8qxEprlflvZK+muu2v3HwFo+g+P9e8RrpHg/RZLDTr6YmHW75HWB4UJ3ExNlSjqOdoBOT1rP8AjZ4M+JnwmkgvPFInMF5EVhudKkSO3JKkDerRlhnPryOhr3342ftc/DvSPCcXh3wJr11favDcBLgfZyLFoQDu2hwTKN2MHgegIr4Z8QfEXwnrls0t/rOpvdTys81tIGS3AOCNiAnGT2wAPev1DhvM8bWlGpClyQ21Tbfn/Sse3mfDNTLcX9WryjNWT9yaa16XXVH/0fRv2VP2YdK/Z+8EQ2+tFLzxPer52q3u7eWuZjtEKOeSkSliT/Ex3Gv0i+HGrLo97PZzHASVgPwNfCmhx6hdWPh6a5c/adS1J7iQBs9SSQPZQAK+yvAVhLdS3jL1W8eP6HAIr5XOsz9jhZUvW/rpf8T9nynCupXVS21rH1RbeJXiuXuEUkTptHbMkYJX/vtSQPfFeuaR440258Oz3Syf6q2E4I7Bl4z+NeG6HpN3cxLp06krdjETHjEq8hc9iex9RVfxZbtofgyfVom+zo8MlrPGeNrhwxT/AL75Uej47V+B5/mMpe4mfr2SwUNZI+7vAPiY6lpcEkhyWRCfrivxr/4Kl+D7O3+NWieLpIYWOpaVsDOBuMls7DqewVhmv0o+BOqvc+H7XfncEUH64618mf8ABXPRYo/gNo3xJW3WafQ9QEayHGYxcqVB5yDllAIPBryMRzScqD3PWq4mGFlHFtaLf0P5svi5L4XTxXp+qJMbG9tonaKUowxKjgoGIOCrcjjsam0b4z+E/EPi7RNG0BJH8S65cRWEFhDkJK8jBWjkYuCAhO4OeB2zkivlv4lfEGcaZNrniy8dhGZECRhVB+XeAMcHJ4r5Z/ZO+Nf/AAg37Wng74iapEk0dvqkZ2MMqplBjUjP90sCD61+icI+HtLHqMMTJqMNHbz6X/qx+bZ54tOjVqSwMU79+62dr7o/uQ+D3/BNfwJ4i0WIeJfEV0lyy7zHaIqxKx6hTIWJ+pAz6UnxQ/4Jo6RDLMvwu8SpPq0BMcVhqirC077d3lwTBlDMQM4wfqK+rv2O/irH8VfCUWq6Q0cBsotk4mJ3K6kbjgcEc9c1+I//AAVv/wCCmmmeAfiZHpPw3xrDeFpYo3uo3+zoupsWkV4pI9zgxIgBIPPTpXqcV8C5RhpywtCjzTsrJSd9Xa7bZ1cJ8f5riXGtiMRyw1bbiraK9rL7jx/xJ4c1z4f3d94Z8f6VcaJqdrKIpbW4XLx4IA2jdgo3UN6HrXyD8c/ixo/gXw6mlatGLVrmGQLNG24KNwXaoDEkMOCQfl5rxb9pT/gsV8W/2s/BkehfEvwzoun3kbxCDVtMNzFdhFx5kUxaR1mSTrjC7DyvBIPxJ481zxD4t8JxXAWa7dtyRghiu04/1WWOeevua/MJ+G86GLvXn7l9O59PmPjLT+pWpxtNrfpc9y1L49+F1t7fSnVvs6fJGWOWhOPvr6hwccjI4r1HT/ir4Z8beA7i6u42t9YgHlKcYGVJ5YDdnd79/rX5U6VqGsWlyIdVj/fJG+I5FGQDkMGB65xxzXo3hLxfY2t010VkRZIkD7W2FGVuFf5TyQcg9+M12Y/haFOFqbd99H/W5+SUPFLFe0s4qSta1v623Pu74dePrC98WDT/ABBsEtxCS7qFGGj/AIuQN2PT1OOlfZ3gDwRqHjAaX4f8YQEaYb+GaGSOXEknOQUWPlG2E71z05Fflb4d8R+C7jULa9OmW91Kg2oDOwfDZyzjkEnOSOe9eweH/wBqCe08OXVt4VtrvR/7Hu2e1nvFQmVv+esJwPkDAgAjpjsa+Pzjh7F1n/ssXfTV3svM7sv4qjVw01mc3yWellr1va179nc/QnUvDHgG0vY9KS1A8790s7KFwA3G53AI/LBweea+fv2ltX8NeMfD/iPwn8RvMtLa91SZ7XV9Mh8+NoLaMLGbvaN6hhkFe6gE8dfiR/iB4y8dXVx4hvNTmmvJWMjsTkkn0H3f+A/lWroHxO1icNoutSKX2kMD9yVfUA9QR1B71vhuBMTQnCvWrczh07a7/h2sfneP4vwkm6OCouEW73vre1tOy8tT5nuvhhrN/FbWvhTxDBquplZD9mjjVlWKJSybZGTj5M/KRweOtfNug6LYXviy3m8RBpopJh55yQxUkAjOPvelfojrPgj4feJg1ybf+y7nnE9odoz7x52n8MV4Vr/7PvinRrj+1NDmi1WzALs0QCMoHzZdWYdupBNfr+TZpT96NSer20s/8jPDYqjLZ2f9fI//0vqnwhZ21z8RvDWh2J8yHT7IyZByMynAOfcLX2j8L9O3674h0JuH3x3Mf/Alxx+Ir5E+DlvBB8SZbidkkzENjxnKBQAqKPYCvsrw7eLofxKt9YXiO6j8mX8DxX5JxZOVPloTfvOLb9W7n9J8NctS9SGykkvRKx9LeC5rW503yL4ZQvtfPBVgevsQaj+P+lWcvwu1S9nKo6G3a5PZwsihZh6MfutXR2dha6LrXmXA3afqIBYgfdb+8D/Otb4keGzrHw51XwpqS+e01lMlrIOkylCVjJ/vAgFT6gV/P2Z4xxqKXZo/X8LQjKFjE/Zv0y9udIQXjCLB+6eWx247fjXtf7T/AMCrX47fs2eJ/hhHDHNd3tkXsjKTgXUJEkJ4PGWG38a/M79mf9rzw5pXh23hmhnu9RlUCVGGxRKn7t9zMc8Mp6A16r8df2ivjv4t+Guu6V8NdZXw/qUlnI1lJaxr5iSKNygO+45bGN3UZyK3zvOaOGxj9o9/1HR4DzbNMI/q1P3Endt2v5Luz+HT9pjS722j1CK2XYtpM0M0JUq8cqMRKCvbawIIB4r88bfWbvRdWiv7f5XglWRQDj5kYMPpyK/SHxz8SdV1XXNR1PXpmvbi+lme7FySzSTTMfOdzn75bJ3dc8817T+0F+zN8PdX+CGi/GbwjpsEPkJaG/eBQvmW87KjSOAMB4yfvDgg81/Q/DGfU8LhY06vV2v8tLn8g4LKamJnVVJfBrZ72v8Aoft/+xJ+1hFY/sa/Ev4y+HmuJLe18P3WpQlc8XAtmikhyD94SH5h9D6V/LP8V7fxl4j8CXGqXsoubgTR3DJG7PJlk+YMDg5GecZ5+tfpV+yNe3UHwb+JXwd+GM8klpqnh+6mhsxMXWWT5lb5RgMflz0618JajqWi6P4aluLoGe4eKMyRea0bIxZgZBx8rLlcjnINfF4riacs1xeJgteamreVn06ao+74oyutleS5fOLTU1Uv8ntf5nw74Z1afVrmLQot7T7uB02gcsWz0Cjk192WviLUdO8PWmn2DSSwyx7BEnz7FU4wWA4Kj5jxxn8a8m8FaNpf/CUC60P90lzbsJQcNIvJzlsc5PIJzkda57XLhvhp41FvfXbyJdRHzIZFZdoYEBjkqC+3kFeO1dXEsljXCEV3du7PzPOFOWGpVOjv+B64tzcXGnz317FvjtAAS+OA3JPPO3jA/wDr15PqF9pfha11S9O2RZpd8SbT8rg5U5JOfl79D70mnfHSN4v7LtY4/KiwquOMEDnJPUHgHNR6rpMfxE0xtN8I28+6OQQzgqXkhd1BEsfbyXbhsnjtxXjZdQrUay9vFqF19x4WW2UnrqWvhr4ku/iD4htLLSbV5Lp2CwxW685JxsUDvnmvSv2y/wDhO/hN8MfC3hPxbAtjfX1/d6hAoZWl+zbEj+dkJwryAkL7Z71nfsreNPCX7M3jGbx/49jEsVgI0e3bBdfNbHmKCQxx3CgnFc1+138WfCP7WnxE0e1+GMQ07QdLtpy108PkGe4fDHZEWyQFVVHTOCQK9vG5nVq5vSo0qbdFayl0Vloj+icuyLL6XCuJzPF4mKquPLCCavK7Sd1vZK5Z+AfxAtte0sWt4ypcKvzEdGHrjsau+NrfVNH16N9OJFtPc7HYPtbZIm8Luz03g4xXyto+h+MPgvrMNxqkDyWV2geGdFYK6HgEZ6Ddxz3Hevco/HEniieG1vLmGC9RoZI4XwUUAtkyE/xKhz2xWuMwz+sutRs4M/nqdCDhp0PYtNvbu6tkjllKxKMtk5JA9SegHfua3V+K8GkzxaTpytLL1dg20AHgdjx9evavmi++Kem6hq0vhzwSBdSKxT7QoPkpzy/PLY7V7x8M7Tw/pMMOmXwK3dxcrLPczREvscqOA4IPBLe/HavIrZZNUnWqwduitv5nW8PK1on/0+j8H6ld/DvUYr7R4H+zxnElsjlzGvrGHxIB/sNnHYmv0Z+Gvi/SvidZR33hi7jvJoyCYlbEqsOqshwwP1FeZX9jq9tdmKeyWfZgMSmQfxx6Ve03wVoGoalb69caVDZTxNlbiJmilZvbyypx67vyr8m4hwzrv2k3aXlr96P6AyLGuj7kdUfpz8L/ABJpviHTT4S8Qt5F1F/q/NG1gR2INe1RWx0+0fTLnZPHj7oO4Z9cdjXzL8PpPFcVtG1zcJqcYUMv2uNZGA9N4w3HuTX1d4e8a3HkJDc2aZx/BI2PyYHH0zX4TnOV1W3eJ+s4LOYJLl18j+bv4t2DfDT9pDxL4R8HXqCK1vhcpFJ8zJHdgSMpxgja5YDPOK+xfhV4qvPEUUtn4igRLiIjBXPzDHBwemfbiuz/AOCmXgvwjaaPpvx90+xFhqNjcJZ6jKiD99azcI0jL1MbgYY9jjNeC/DbWH1DT7PxBYlWZV2tjuPpXwvFtH2mHhWetvdfqj+l/CXPo1aE8LLRrVeh/M9+3D8NLrwL+014w8GaZHi3S+e7t1UAZjnHnqB3x8xx9K+0f2IPFfhr4m/Bt/hL4mTzjEktlPE7bi0MmSGGTngHr2Irk/8AgrtoNna/HPTfEz27Omt6OF8xW2lHt3MbHOcY2suc9BXkH7HFhrnh21/4TxSbeDS2nuZniIKOkUbHaWGQQQv41+u4LOPaZAqvXlVvVaH8lLgz2HH9XL27U5SbdltGWv6nhH7It9rngz9pHUNL+Hl152p6Lc3H2aBjgXkUMrJLA4OApkTlevzCt3/goJ4R03T/ABZ/wvLwdpwl8L+J4Y4QYxs+xXkXFxazqOUZsZXPUZwcivjTwv8AGjxrofxXl+LnhkR2N/HcvOg25R1ldmIcHrlTg4/CvrD4YftR2niDxp4n8KfFOO1l8MeL5DLdW1658mKR8HKuem0jO7qOor0syyvMI42nmcYXSgudX1fdeq3XzXUeVYrIsZkFTh/GVHGftpeyk1dLflfkpW5ZJd0+h5d+xD8Vbfwv+0b4eZrGM2mpObW5idfMVo5CBtCseWI/CvBvi9Y6HJ8XvEGm+J91kLXVb61gbbyI4p3ESlGPykDC59K7bWr/AOF3hz4yHxf8E2luNDsrlLi2hvJMyrsAZl3jBZN4IU4zt65PJ8s+IOs2fxk8d+IPHvlR6bquq3jXQswXaHfIcMsZYkgZ6buvrzX1lLB05YyONppqLhbXdO+mh+G55mMKOTTyarKLnSqtq2uji1Kz7XscJdW+iaLcW2ZWljijLOsibd8rHCrtPYD1yDj3r6B+FPxcttOh1TWtQ/cTrGirBboIjIsJ8wnduADEDAGMfXNeOP4Cmub97m0uA72hCSMSDukI5AU8AKR/hXluoCC51RkBZyj4LIejDgsQOy/yr6yhRhO1Ru8kfkyq62gz9Bby1+GXxq8Npqvjq4uoPMiki0mJYfNuLi7f5Y1C78IruV3Mx4HSue8Oan8M7b4bXngix0mCLXYLWCKHUJiI3ieInz4kUhslnY88cDrXoFnr/gfwp+zBpvi3VLJTqmnzXEVkygB57l0AhkdicCOFhuCd2OfWvibXFbW/EAgFpJbapbRpKY4AWjOYwWB6n5j824ngmvjsRiKmYVKtFtqKfok49ratPqfrvFuTUcvy/CQppc848zerbUu/az0Vj6n8U+ENI1PwA3ha21tdalt441kkaYx+S7kkqitxJGCfl5yCCcdK9u/Yz+DXgSCK90S8tbHW/Euqi/sbq4vR5sFnAbdlaVCCcZVx8+CQ3TpX5q3njCLRYTa3yxtLhdzRswZ8DjcvQOCTk9/SvpH9m/x9PNcavG0x0JLmAQS3WcTLHjcFjDcAs2CT1wMCvNx2R42GBq06M9ZO+mn5dPQ9DwojhKGaU62aQTgr6Pf1S2utlc8++Gfwxn8Ea3qGg3joZ7K5kt3kUgqwiYqGB7hgMj619meH/C2p+I9TtnvZC08pi8qa53dBxEVIIO3jGeQB7V90+Dtd+EX7Nn7HWlfF7xD4a0Pxhe6jrE8EUNxHH5zOEKou5lZ2TP72Q9jgfX8kfE3xR+KPxG+MD/EHWriObzPKijt7UCK2gjjwwhiiB2oic/Xk966lxXVxk54alD4Pdc3s5JK6S3+8rjPI6GU0Y1nUXNV96MN2otuzk9vuP//U+Gvh/wD8FOf2nfD0Mem+KtRtvE1qrBiL6ICQ/wDbSPbyfcGvszwj/wAFVvDuozRL4r8GtG6Lz9knDKe3RtpH51/Pjb6oFh4Pp+ldNpOvlZwA38IA596+MqwT1Z9/hsfUWlz+q74Y/wDBWrwRZeKtP0iXwZdto11G/wBpvWmAlhYcLtiBYMD35z6Cv0l8E/t6/steI7fzG1r7Ax523BMZ/wDH1HP41/G14H151toUeU4we2ehr6G8Oa/lhuf5cZ5Nfl3EFOU5Pldj9YyKpHlTkf17eIvHHwG+OHgi+8IxaxZajaalA8EkJdJCBIpU8KTxznp1r+fD4NfEO5+EPxm1v9njxNMDcaLdNao24lZEHMZBPXdGQa+WP+Eolhi3WjlWH8S/L+o5r88Pib4w8R/C342RfFTTrh5nJDTB3Zi5j+YZJJ6pkCvg6XDbxTqYab0ktP8AEtv8j9Qybit5TWp4yOqTSl/he/3bn6F/8FoNHuLr4V+FviDYKMafqEtnKwBK+Vcx7lBxzgulfm18G/2lJ/hx+zrrPhZbAXF1q9s9uJ5GxHCjcEqgGWbsMnbjtX7G/HfXvAH7Vv8AwT48SeK4rv8A0aDTf7RR1GZILq0AkRWX3OUPsc1/Np4f0DxJqfgS40XR7Z5pVkZFUEHLEBioyR+Vex4f5bSxGVzy/FR1pz1W3n+YeN2aVMt4ipZzgZq1alo9HsrP8GjnvD+m6lrOoDStNXzWYDZzgY5yST6V2vh34b6XqUV9Nr19IZbefyWt4Ey2ANxJJzwO/ArZ0j4MfFXQ7C1udas30y41AMtnHcjY8r9AqdQc59eM5NdvPqPin9nbxTd+HvHc0dlqaxql5CrrIxWeMOMuuQSFbGQeuRX7LgsRQrL3ZJt3tZ723+4/iviPF4qNGNKzVtXfR3e2/R9D6d/Zu/Yx+GHxG+Eev+LPFHiiyh8Qzs9rpkCkqlqkeHlurnof9WCI1A5OOtYvwW/Ym+FXxN+PsPhTXNdvbnSIZFSM2+Ipb1VkUOsTnhcoSxJztA6V9AeAPj/8K/in+z63wie7g0rUdOkhNi+n23lM4b5ALjblplkbZubqCAfqz9kP4m+EfC+reI18b6adUlsNI1WS2tpSy/Y7xcRMxwRg/LknvgCvznE59iqf1tvmTjtGyul0a7o8erSk3Sira7v9GN/aK/4JO+DvDEF146+AXjxdQt9MCTXljOjTS2kcrPli9vy6IFUFnA3FuuOv52ap+wj+01omjWXjXT/D82o6Dfw3F0l9ZRFoFihLLM7O+0oFAJ+b86/fr4c/ty+NfiP8KtU+H3g/StKjSLSo7LU75rFI7i8guzsFvuViV8nLMrnljgkACuH/AGyvC3xF/Z//AGZYfhD4W8QHUPDmqNDHK91sVhablMlujqRgySOScA7gMcDNfH5V4gZrh6qwWKUXUcko82l49Xps1ur7nqrLaM0q8G+SzvZbPotd/wBD8D9R+GMvxG0uy8AeF9S8m+kVb02rlvLmcYSIdNq5DHaxOOecdT0/jD4cfET9nXWR4P8AjR4cuPD9xfJH9qvjIk0SxqxRghjLAlwOBu3cZUEV6R8QPBPxP07xBYeNbuE6Ut/BFKJ7Eq8QhhxtUBT8pUYJU4yR3pfi1471T4sfD+1h8WamdRuNQv508uZ3kul8hMQysxZsxksTkqCo4ziv1OrOpKcFSacG3d9U/Lv6MrLOLKsaqrVvelFWV9Vb9PI/P+/Gj6x4ou9Z8NpJ9njnMmGy3lQk/LuLc9O59ea6cy30esQ6rGgSxvJDbDBGQ0fzDeB0yDwe/avLJr2TQdUmukWWNpl8t2jGVYjHY9hWr/wkU08KwwzAopDcEY3J0HHce9fQunNKK3RNTNpTxaxNrXey2V+x+nOtGwu/gvY+HPEl+La5tRHf6f5LrcIqXLhJjKFbMbMFyVPIwOmecy8sNL1vX5pPh9o/2az22zCGaVS5TBXzGlYgLvbLGMDOOCeMn428Oah4q1+S9m0RJbmS3g81xGm4feVVLgcAbiOo5OBXotnpHizw0UhmLo8kpi2+YcG4XJKuu4kEEsQuAfavisflcoTlaau7u3m/LqfU8Y42GInSmo7RUfN28z//1f5e21WS3tXlZvkj+8c9K3NN1KVCs65KkZyPzritX0trW3kmsCZLaZCHQ9cEdq5D4b+JmW7Oi3rEmMHyye6ngj8K+Qg+dPyPtJR5HFM++Ph543sXWG3km2SKxG1uOMdjX1BoPia2Zcq44x0NfmbpmrNp80EqnDLOuPXivsvSdRYQB1P3gCO3UV8fnOCS95dT7bJMwa919D6mh18SxKAflYZr4r/ac1TbcxR4yjOjv6Efd/rX0Fp93KbKLB7V8i/tQ6h5MaFzzIqIPrvz/IV87l2GtiYn1WYY7mwsrs/UP/gmVrngb4i/DXxh8DNQVfPuraVZIXJZJYpV2glM446HFfPVn8EPEPwo8TWE/wAQ9EjbQ9SvjYRiSTa63BB2cKcxrIQdjYPTn38l/YWk1Pwd8adN8RaTeGNIp7mfUcKVjislhAXc+QCZGJwp6YzzXCfGn9orx3qPi5GsNVku4bHVbjU7AStuRNzMqrkgknaflBOF7DmvjeJsNmUMfOnlklaprK900rNXi11va19D7h5rw3j8nwWNz5S/cycYKKTjOzi3zptPktdPl1udn40+P2vxfE5vDmoNN9lsrhrKMTsBhFkGB8wyGA6t8u4c17B4k0e08BahL8UEtLbxzoc0CxvrdxCjwxB2K/Z548tloyQvX05FfBa+N/FvxR1DWvHrB73UtRZxc25QsiWsKKC5wPuDOGYnOeTXGeD/AIkfETwz4FvfhlBeSR6HqTF7m0LLsZQ3JBIyBuAIwQD3rw/9T8Z9XpUMI4wlFKNSN/iUtZNSWqad2mtJPRnz+d+I2WV87xeZ46pOreblQmoL3eRWhF05e64ONoNN3ilfVn1P428G2XiGa2+PPwLtT4d1GxlzdT2xVNPmkG0obWMjj/bAPDdAcV4Avi7XfEviXW/GXia5kF5qC3HnBU2ia6Kkvu2EKP7xwDuNbGl/tAeN/B/wzf4LJLHc6ZKFEeV4hUOXwpDYBJIOce2TXELr9ndRwS7CJIAVZnB2MXY5bP04zX6Tw3gcWoVKeMimovlhK924ab/Pp0P5+8RZ5R/s9bJ6spOcOaqmrKFRt+7HukuvmfR/wF/artPgzoOqi601r2TUWiljgZtkbSQghDJj5yo3Z2ggE10Hxy/aG+IH7UF3pOpeKX/srSNCgSG2sg5ZPNOS8gQdCwwBnoBgGvl66m8MvaRWkFqYLgymRruJyN0ZH3HRt6ttPIOARyO+a848T3/iH4b6tdQafJFqOyMTRsCYxJGwDKyE5DdeVI7V6K4YwdTGrFyh+96X8tLrpsfALMq31b6vCXu9f+Cex+IPjn8R2f8A4Qlr5IrWxBEUEpUKyHIWSQbvmcrwFY4AxxzXjureLf8AhGLuKWK8aS4RjJm327d0g2sMe/AI9uteKXU0PiMjWtHuWmvbjmWCUkNvbg4buB61xmuNqXhzUYbHV5FaTargRtkAZ4zjv7V9vgMsVOPJFW/zOONC71PQ9TtL+00pr/ek/muJH53SKeVyc8hTnGPUU7wX4PfxfqAhhhjhjtisk2G2s6lgCoHcnoccgciun8C+Hf8AhYnhzxAglZLnTbBr23UFVU+U2XVieSWGcCq3w28B+LvGF0P7IsL6VU++LWB2kICliqdATxkjrgE4wKurUceeEJJNfgfQ4CnPSS6n2T8M2i+Gd5rlrZ2psLHXrd9LliWV5psZWRDHIq5Eife5PPcDGK+j9L+E/wAP9V8W6Lc+HYjJLpcn9oXiyl7h4bbaJA7PgM/mO2GyGbg4Pr8XWfiHxL8MsaV4gtTJfeY5EjMJP3bjkuhyTIVPJ4xX0L8JPE9zqeh+I7C+WYXVxaxW9hKuExF8xPzBg2Az5BHOBz6V+U59hK8JSxFOWtt979F91z7XLMTB4mMa20ddfvX3s//W/lptHuLKdtLuW+VumfWvE/G2mv4W1mDWbJiEeTcFHYg5I+hr27Vv+Q5H9RXlXxg/49LP/ff+Qr42E2q8bddz7a3Nh5J/Z2O70HX4te1SzMH3FUOfqTX3ZYXiKsFvnGUXH8q/OH4W/wDHzbf7i/zr9BbX/j7tP+ua/wA683PqSioxXmelkNVylKT8j33S5DJEsQ6oAD9cZ/rXivxR8K6R4r19I9XBeLT4DcFQcbivQH2r2bQ/9Y/+8P8A0EV5z4q/5D2p/wDXg39a+FjUcanNHc+6naVLllsWPhv8ZPgFD8DvEfhLxTC58SXEKGE2peHzZAw8vDoRyi/f3AqfXmvh7xJr80Ws31ukcUhv7RoVe94MDDJWaNs4DfL15ySBXE+Hf+Qyf90/0qz8Sf8AkKx/9ey/+hGvCwGRxo5hiajqSl7Rp2k7qNltHsjweIeMq+JwuBoeyhH2MGk4xs5Xb1ldtN/JFbwp4sbw0q6bYS3Vk91H+9MhBRwHVyuAejbRuB4NdLaSal8UdZ0/w3pMtrZSwpJBFNPIqJJ5paQo7EgAEk4YnAwK8r1n/kJ2f+6f6103wo/5Gux/67r/ACr6vM8LTpQnior3lG/3JnwOW1KlWvTwkpPklJRa8m1exz0d/regrLbX8bToikKw5Gc5HHcenfFTReO/Ed94Xk0aCdzBJOiiPORlAcHnpgHpWr4k/wBVL9R/6CK868M/8eSf9fX/ALLX1GDoU6lOFSUdWk/mfI5rH2depCPRtfie428F1Y2No11ckSOnzKDlUzyME9wOWrlfiDr2s3sEN7LdSTXRwqsQDtjTphmznjsOK6nWP+POD/gX/oArhPFf/Hnbf9cj/wCg16sacW02tjw8JBSrKL2PnaS7v/Cmom4MhIc7gfTPPY1Prw1LUbmPV5zuE4+R1GQcDj9Kr+O/uR/7i/yFdBL/AMi1pX0X+VexB7M9qpBJpoytKtfECXJMe54pF2uyE52nrkDkV9b+Ffjj8VPB/wANo/AXhvxJNp0X24aggiJS481YzEA0oxxsYgDPQ4714D4Z+5N/1z/9mFXZ/wDj7j/3h/SvDzTCUsRHkrRTW/3bHfg604xfI7H1f4Q8Z+JtY1yHwxPYpd6hqSJB50iocPN8gYDBywyCT165HNWfil4jtND8WFLYz2qWGy2hHl/I0MQ8vcRxkMQWz+FVvhN/yWnw5/192v8AMVi/tDf8jA/+4P8A0a9fD18HThioUoqyab/Gx68fdy2dRbuaXytf8z//2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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	1
\.


--
-- TOC entry 5319 (class 0 OID 65558)
-- Dependencies: 242
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rol (id_rol, nombre_rol) FROM stdin;
1	admin
2	user
3	supervisor
\.


--
-- TOC entry 5303 (class 0 OID 57429)
-- Dependencies: 226
-- Data for Name: sensor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sensor (id_sensor, id_dispositivo, id_tipo_sensor) FROM stdin;
\.


--
-- TOC entry 5348 (class 0 OID 90165)
-- Dependencies: 272
-- Data for Name: telemetria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.telemetria (id_telemetria, id_dispositivo, metrica, valor, unidad, fecha_registro) FROM stdin;
\.


--
-- TOC entry 5301 (class 0 OID 57420)
-- Dependencies: 224
-- Data for Name: tipo_sensor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_sensor (id_tipo_sensor, nombre, unidad_medida) FROM stdin;
1	Temp. Aire	°C
2	Humedad	%
3	VPD Suelo	kPa
5	Consumo de Energía	kWh
4	Luz	lx
\.


--
-- TOC entry 5322 (class 0 OID 65587)
-- Dependencies: 245
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id_usuario, nombres, apellidos, correo, celular, password) FROM stdin;
1	Marco	Calderon	ac8858715@gmail.com	77777777	$2b$12$95TryWe63lX7UN9PmI5e3ulDjANgLh6jUtsaULtGwvPkUrHIuh6Lm
2	Jorge Luis	Perez Castillo	jorgelsluis53495@gmail.com	65428722	$2b$12$VziNHPAPy7/HgCmkkv3j8eqO5wrMebPoczoOPM8ZXCie93q2EcPjS
3	carla	perez	carla@bls.com	62345678	$2b$12$99ozOhyYVT5Tdm53Hk/UteQbYlZEjAXUUQ4VXaHMib.3z3G.ZJogS
4	Claudia	Mendoza	claustar6532872@gmail.com	78425164	$2b$12$pEg66FWvi3rtNy2D2C/ztuJoN6IdQmX926YKMhzpdp16Xir9/3iiW
\.


--
-- TOC entry 5320 (class 0 OID 65568)
-- Dependencies: 243
-- Data for Name: usuario_rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario_rol (id_usuario, id_rol, fecha_asignacion) FROM stdin;
1	1	2026-04-20 01:23:03.873528
2	2	2026-04-27 19:55:17.988545
3	2	2026-05-18 18:50:10.860931
4	1	2026-06-01 17:13:02.39623
\.


--
-- TOC entry 5390 (class 0 OID 0)
-- Dependencies: 239
-- Name: alerta_id_alerta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alerta_id_alerta_seq', 1, false);


--
-- TOC entry 5391 (class 0 OID 0)
-- Dependencies: 259
-- Name: analisis_suelo_id_analisis_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analisis_suelo_id_analisis_seq', 1, false);


--
-- TOC entry 5392 (class 0 OID 0)
-- Dependencies: 231
-- Name: camara_id_camara_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.camara_id_camara_seq', 1, false);


--
-- TOC entry 5393 (class 0 OID 0)
-- Dependencies: 249
-- Name: ciclo_cultivo_id_ciclo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ciclo_cultivo_id_ciclo_seq', 1, false);


--
-- TOC entry 5394 (class 0 OID 0)
-- Dependencies: 261
-- Name: configuracion_confort_id_config_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuracion_confort_id_config_seq', 1, false);


--
-- TOC entry 5395 (class 0 OID 0)
-- Dependencies: 255
-- Name: consumo_energetico_id_consumo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumo_energetico_id_consumo_seq', 1, false);


--
-- TOC entry 5396 (class 0 OID 0)
-- Dependencies: 235
-- Name: deteccion_plaga_id_deteccion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deteccion_plaga_id_deteccion_seq', 1, false);


--
-- TOC entry 5397 (class 0 OID 0)
-- Dependencies: 221
-- Name: dispositivo_id_dispositivo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dispositivo_id_dispositivo_seq', 26, true);


--
-- TOC entry 5398 (class 0 OID 0)
-- Dependencies: 267
-- Name: especie_plaga_id_especie_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.especie_plaga_id_especie_seq', 1, false);


--
-- TOC entry 5399 (class 0 OID 0)
-- Dependencies: 247
-- Name: especie_planta_id_especie_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.especie_planta_id_especie_seq', 1, false);


--
-- TOC entry 5400 (class 0 OID 0)
-- Dependencies: 265
-- Name: estado_actual_sistema_id_estado_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estado_actual_sistema_id_estado_seq', 1, true);


--
-- TOC entry 5401 (class 0 OID 0)
-- Dependencies: 237
-- Name: estado_alerta_id_estado_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estado_alerta_id_estado_seq', 1, false);


--
-- TOC entry 5402 (class 0 OID 0)
-- Dependencies: 229
-- Name: historial_ambiente_id_historial_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_ambiente_id_historial_seq', 1, false);


--
-- TOC entry 5403 (class 0 OID 0)
-- Dependencies: 233
-- Name: imagen_id_imagen_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.imagen_id_imagen_seq', 1, false);


--
-- TOC entry 5404 (class 0 OID 0)
-- Dependencies: 219
-- Name: invernadero_id_invernadero_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invernadero_id_invernadero_seq', 16, true);


--
-- TOC entry 5405 (class 0 OID 0)
-- Dependencies: 273
-- Name: kpi_diario_id_kpi_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kpi_diario_id_kpi_seq', 1, false);


--
-- TOC entry 5406 (class 0 OID 0)
-- Dependencies: 277
-- Name: lectura_esp32_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lectura_esp32_id_seq', 191, true);


--
-- TOC entry 5407 (class 0 OID 0)
-- Dependencies: 227
-- Name: lectura_id_lectura_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lectura_id_lectura_seq', 8, true);


--
-- TOC entry 5408 (class 0 OID 0)
-- Dependencies: 275
-- Name: lectura_sensor_id_lectura_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lectura_sensor_id_lectura_seq', 1, false);


--
-- TOC entry 5409 (class 0 OID 0)
-- Dependencies: 251
-- Name: log_actuador_id_log_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.log_actuador_id_log_seq', 1, false);


--
-- TOC entry 5410 (class 0 OID 0)
-- Dependencies: 263
-- Name: prediccion_climatica_id_prediccion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prediccion_climatica_id_prediccion_seq', 1, false);


--
-- TOC entry 5411 (class 0 OID 0)
-- Dependencies: 269
-- Name: protocolo_resolucion_id_protocolo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.protocolo_resolucion_id_protocolo_seq', 1, false);


--
-- TOC entry 5412 (class 0 OID 0)
-- Dependencies: 253
-- Name: registro_nutrientes_id_registro_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registro_nutrientes_id_registro_seq', 1, false);


--
-- TOC entry 5413 (class 0 OID 0)
-- Dependencies: 257
-- Name: relato_id_relato_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.relato_id_relato_seq', 2, true);


--
-- TOC entry 5414 (class 0 OID 0)
-- Dependencies: 241
-- Name: rol_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rol_id_rol_seq', 3, true);


--
-- TOC entry 5415 (class 0 OID 0)
-- Dependencies: 225
-- Name: sensor_id_sensor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sensor_id_sensor_seq', 1, false);


--
-- TOC entry 5416 (class 0 OID 0)
-- Dependencies: 271
-- Name: telemetria_id_telemetria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.telemetria_id_telemetria_seq', 1, false);


--
-- TOC entry 5417 (class 0 OID 0)
-- Dependencies: 223
-- Name: tipo_sensor_id_tipo_sensor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_sensor_id_tipo_sensor_seq', 1, false);


--
-- TOC entry 5418 (class 0 OID 0)
-- Dependencies: 244
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 4, true);


--
-- TOC entry 5072 (class 2606 OID 57536)
-- Name: alerta alerta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_pkey PRIMARY KEY (id_alerta);


--
-- TOC entry 5098 (class 2606 OID 81967)
-- Name: analisis_suelo analisis_suelo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_suelo
    ADD CONSTRAINT analisis_suelo_pkey PRIMARY KEY (id_analisis);


--
-- TOC entry 5064 (class 2606 OID 57481)
-- Name: camara camara_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camara
    ADD CONSTRAINT camara_pkey PRIMARY KEY (id_camara);


--
-- TOC entry 5086 (class 2606 OID 73860)
-- Name: ciclo_cultivo ciclo_cultivo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ciclo_cultivo
    ADD CONSTRAINT ciclo_cultivo_pkey PRIMARY KEY (id_ciclo);


--
-- TOC entry 5100 (class 2606 OID 81981)
-- Name: configuracion_confort configuracion_confort_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_confort
    ADD CONSTRAINT configuracion_confort_pkey PRIMARY KEY (id_config);


--
-- TOC entry 5092 (class 2606 OID 73907)
-- Name: consumo_energetico consumo_energetico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumo_energetico
    ADD CONSTRAINT consumo_energetico_pkey PRIMARY KEY (id_consumo);


--
-- TOC entry 5068 (class 2606 OID 57511)
-- Name: deteccion_plaga deteccion_plaga_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deteccion_plaga
    ADD CONSTRAINT deteccion_plaga_pkey PRIMARY KEY (id_deteccion);


--
-- TOC entry 5054 (class 2606 OID 57413)
-- Name: dispositivo dispositivo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivo
    ADD CONSTRAINT dispositivo_pkey PRIMARY KEY (id_dispositivo);


--
-- TOC entry 5106 (class 2606 OID 90143)
-- Name: especie_plaga especie_plaga_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.especie_plaga
    ADD CONSTRAINT especie_plaga_pkey PRIMARY KEY (id_especie);


--
-- TOC entry 5084 (class 2606 OID 73850)
-- Name: especie_planta especie_planta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.especie_planta
    ADD CONSTRAINT especie_planta_pkey PRIMARY KEY (id_especie);


--
-- TOC entry 5104 (class 2606 OID 82011)
-- Name: estado_actual_sistema estado_actual_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_actual_sistema
    ADD CONSTRAINT estado_actual_sistema_pkey PRIMARY KEY (id_estado);


--
-- TOC entry 5070 (class 2606 OID 57524)
-- Name: estado_alerta estado_alerta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_alerta
    ADD CONSTRAINT estado_alerta_pkey PRIMARY KEY (id_estado);


--
-- TOC entry 5062 (class 2606 OID 57468)
-- Name: historial_ambiente historial_ambiente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_ambiente
    ADD CONSTRAINT historial_ambiente_pkey PRIMARY KEY (id_historial);


--
-- TOC entry 5066 (class 2606 OID 57497)
-- Name: imagen imagen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagen
    ADD CONSTRAINT imagen_pkey PRIMARY KEY (id_imagen);


--
-- TOC entry 5052 (class 2606 OID 57398)
-- Name: invernadero invernadero_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invernadero
    ADD CONSTRAINT invernadero_pkey PRIMARY KEY (id_invernadero);


--
-- TOC entry 5116 (class 2606 OID 90188)
-- Name: kpi_diario kpi_diario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kpi_diario
    ADD CONSTRAINT kpi_diario_pkey PRIMARY KEY (id_kpi);


--
-- TOC entry 5121 (class 2606 OID 98379)
-- Name: lectura_esp32 lectura_esp32_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectura_esp32
    ADD CONSTRAINT lectura_esp32_pkey PRIMARY KEY (id);


--
-- TOC entry 5060 (class 2606 OID 57454)
-- Name: lectura lectura_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectura
    ADD CONSTRAINT lectura_pkey PRIMARY KEY (id_lectura);


--
-- TOC entry 5118 (class 2606 OID 98365)
-- Name: lectura_sensor lectura_sensor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectura_sensor
    ADD CONSTRAINT lectura_sensor_pkey PRIMARY KEY (id_lectura);


--
-- TOC entry 5088 (class 2606 OID 73879)
-- Name: log_actuador log_actuador_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_actuador
    ADD CONSTRAINT log_actuador_pkey PRIMARY KEY (id_log);


--
-- TOC entry 5102 (class 2606 OID 81996)
-- Name: prediccion_climatica prediccion_climatica_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prediccion_climatica
    ADD CONSTRAINT prediccion_climatica_pkey PRIMARY KEY (id_prediccion);


--
-- TOC entry 5108 (class 2606 OID 90155)
-- Name: protocolo_resolucion protocolo_resolucion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocolo_resolucion
    ADD CONSTRAINT protocolo_resolucion_pkey PRIMARY KEY (id_protocolo);


--
-- TOC entry 5090 (class 2606 OID 73893)
-- Name: registro_nutrientes registro_nutrientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_nutrientes
    ADD CONSTRAINT registro_nutrientes_pkey PRIMARY KEY (id_registro);


--
-- TOC entry 5096 (class 2606 OID 81952)
-- Name: relato relato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relato
    ADD CONSTRAINT relato_pkey PRIMARY KEY (id_relato);


--
-- TOC entry 5074 (class 2606 OID 65567)
-- Name: rol rol_nombre_rol_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_nombre_rol_key UNIQUE (nombre_rol);


--
-- TOC entry 5076 (class 2606 OID 65565)
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 5058 (class 2606 OID 57435)
-- Name: sensor sensor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_pkey PRIMARY KEY (id_sensor);


--
-- TOC entry 5112 (class 2606 OID 90173)
-- Name: telemetria telemetria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telemetria
    ADD CONSTRAINT telemetria_pkey PRIMARY KEY (id_telemetria);


--
-- TOC entry 5056 (class 2606 OID 57427)
-- Name: tipo_sensor tipo_sensor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_sensor
    ADD CONSTRAINT tipo_sensor_pkey PRIMARY KEY (id_tipo_sensor);


--
-- TOC entry 5082 (class 2606 OID 65595)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 5078 (class 2606 OID 65575)
-- Name: usuario_rol usuario_rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_pkey PRIMARY KEY (id_usuario, id_rol);


--
-- TOC entry 5119 (class 1259 OID 98385)
-- Name: ix_esp32_dispositivo_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_esp32_dispositivo_id ON public.lectura_esp32 USING btree (id_dispositivo, id);


--
-- TOC entry 5113 (class 1259 OID 90195)
-- Name: ix_kpi_diario_id_invernadero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_kpi_diario_id_invernadero ON public.kpi_diario USING btree (id_invernadero);


--
-- TOC entry 5114 (class 1259 OID 90194)
-- Name: ix_kpi_diario_id_kpi; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_kpi_diario_id_kpi ON public.kpi_diario USING btree (id_kpi);


--
-- TOC entry 5093 (class 1259 OID 81954)
-- Name: ix_relato_id_relato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_relato_id_relato ON public.relato USING btree (id_relato);


--
-- TOC entry 5094 (class 1259 OID 81953)
-- Name: ix_relato_id_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_relato_id_usuario ON public.relato USING btree (id_usuario);


--
-- TOC entry 5109 (class 1259 OID 90179)
-- Name: ix_telemetria_id_dispositivo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_telemetria_id_dispositivo ON public.telemetria USING btree (id_dispositivo);


--
-- TOC entry 5110 (class 1259 OID 90180)
-- Name: ix_telemetria_id_telemetria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_telemetria_id_telemetria ON public.telemetria USING btree (id_telemetria);


--
-- TOC entry 5079 (class 1259 OID 65597)
-- Name: ix_usuario_correo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_usuario_correo ON public.usuario USING btree (correo);


--
-- TOC entry 5080 (class 1259 OID 65596)
-- Name: ix_usuario_id_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_usuario_id_usuario ON public.usuario USING btree (id_usuario);


--
-- TOC entry 5131 (class 2606 OID 57542)
-- Name: alerta alerta_id_estado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES public.estado_alerta(id_estado);


--
-- TOC entry 5132 (class 2606 OID 57537)
-- Name: alerta alerta_id_invernadero_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_id_invernadero_fkey FOREIGN KEY (id_invernadero) REFERENCES public.invernadero(id_invernadero);


--
-- TOC entry 5140 (class 2606 OID 81968)
-- Name: analisis_suelo analisis_suelo_id_invernadero_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_suelo
    ADD CONSTRAINT analisis_suelo_id_invernadero_fkey FOREIGN KEY (id_invernadero) REFERENCES public.invernadero(id_invernadero) ON DELETE CASCADE;


--
-- TOC entry 5128 (class 2606 OID 57482)
-- Name: camara camara_id_dispositivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camara
    ADD CONSTRAINT camara_id_dispositivo_fkey FOREIGN KEY (id_dispositivo) REFERENCES public.dispositivo(id_dispositivo);


--
-- TOC entry 5135 (class 2606 OID 73866)
-- Name: ciclo_cultivo ciclo_cultivo_id_especie_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ciclo_cultivo
    ADD CONSTRAINT ciclo_cultivo_id_especie_fkey FOREIGN KEY (id_especie) REFERENCES public.especie_planta(id_especie);


--
-- TOC entry 5136 (class 2606 OID 73861)
-- Name: ciclo_cultivo ciclo_cultivo_id_invernadero_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ciclo_cultivo
    ADD CONSTRAINT ciclo_cultivo_id_invernadero_fkey FOREIGN KEY (id_invernadero) REFERENCES public.invernadero(id_invernadero);


--
-- TOC entry 5141 (class 2606 OID 81982)
-- Name: configuracion_confort configuracion_confort_id_tipo_sensor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_confort
    ADD CONSTRAINT configuracion_confort_id_tipo_sensor_fkey FOREIGN KEY (id_tipo_sensor) REFERENCES public.tipo_sensor(id_tipo_sensor);


--
-- TOC entry 5139 (class 2606 OID 73908)
-- Name: consumo_energetico consumo_energetico_id_dispositivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumo_energetico
    ADD CONSTRAINT consumo_energetico_id_dispositivo_fkey FOREIGN KEY (id_dispositivo) REFERENCES public.dispositivo(id_dispositivo);


--
-- TOC entry 5130 (class 2606 OID 57512)
-- Name: deteccion_plaga deteccion_plaga_id_imagen_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deteccion_plaga
    ADD CONSTRAINT deteccion_plaga_id_imagen_fkey FOREIGN KEY (id_imagen) REFERENCES public.imagen(id_imagen);


--
-- TOC entry 5123 (class 2606 OID 74087)
-- Name: dispositivo dispositivo_id_invernadero_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivo
    ADD CONSTRAINT dispositivo_id_invernadero_fkey FOREIGN KEY (id_invernadero) REFERENCES public.invernadero(id_invernadero) ON DELETE CASCADE;


--
-- TOC entry 5143 (class 2606 OID 82012)
-- Name: estado_actual_sistema estado_actual_sistema_id_invernadero_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_actual_sistema
    ADD CONSTRAINT estado_actual_sistema_id_invernadero_fkey FOREIGN KEY (id_invernadero) REFERENCES public.invernadero(id_invernadero) ON DELETE CASCADE;


--
-- TOC entry 5122 (class 2606 OID 65598)
-- Name: invernadero fk_dueño_invernadero; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invernadero
    ADD CONSTRAINT "fk_dueño_invernadero" FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 5133 (class 2606 OID 65581)
-- Name: usuario_rol fk_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT fk_rol FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol) ON DELETE CASCADE;


--
-- TOC entry 5134 (class 2606 OID 65604)
-- Name: usuario_rol fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 5127 (class 2606 OID 57469)
-- Name: historial_ambiente historial_ambiente_id_invernadero_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_ambiente
    ADD CONSTRAINT historial_ambiente_id_invernadero_fkey FOREIGN KEY (id_invernadero) REFERENCES public.invernadero(id_invernadero);


--
-- TOC entry 5129 (class 2606 OID 57498)
-- Name: imagen imagen_id_camara_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagen
    ADD CONSTRAINT imagen_id_camara_fkey FOREIGN KEY (id_camara) REFERENCES public.camara(id_camara);


--
-- TOC entry 5146 (class 2606 OID 90189)
-- Name: kpi_diario kpi_diario_id_invernadero_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kpi_diario
    ADD CONSTRAINT kpi_diario_id_invernadero_fkey FOREIGN KEY (id_invernadero) REFERENCES public.invernadero(id_invernadero);


--
-- TOC entry 5147 (class 2606 OID 98380)
-- Name: lectura_esp32 lectura_esp32_id_dispositivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectura_esp32
    ADD CONSTRAINT lectura_esp32_id_dispositivo_fkey FOREIGN KEY (id_dispositivo) REFERENCES public.dispositivo(id_dispositivo);


--
-- TOC entry 5126 (class 2606 OID 74097)
-- Name: lectura lectura_id_sensor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectura
    ADD CONSTRAINT lectura_id_sensor_fkey FOREIGN KEY (id_sensor) REFERENCES public.sensor(id_sensor) ON DELETE CASCADE;


--
-- TOC entry 5137 (class 2606 OID 73880)
-- Name: log_actuador log_actuador_id_dispositivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_actuador
    ADD CONSTRAINT log_actuador_id_dispositivo_fkey FOREIGN KEY (id_dispositivo) REFERENCES public.dispositivo(id_dispositivo);


--
-- TOC entry 5142 (class 2606 OID 81997)
-- Name: prediccion_climatica prediccion_climatica_id_invernadero_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prediccion_climatica
    ADD CONSTRAINT prediccion_climatica_id_invernadero_fkey FOREIGN KEY (id_invernadero) REFERENCES public.invernadero(id_invernadero);


--
-- TOC entry 5144 (class 2606 OID 90156)
-- Name: protocolo_resolucion protocolo_resolucion_id_especie_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocolo_resolucion
    ADD CONSTRAINT protocolo_resolucion_id_especie_fkey FOREIGN KEY (id_especie) REFERENCES public.especie_plaga(id_especie) ON DELETE CASCADE;


--
-- TOC entry 5138 (class 2606 OID 73894)
-- Name: registro_nutrientes registro_nutrientes_id_invernadero_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_nutrientes
    ADD CONSTRAINT registro_nutrientes_id_invernadero_fkey FOREIGN KEY (id_invernadero) REFERENCES public.invernadero(id_invernadero);


--
-- TOC entry 5124 (class 2606 OID 74092)
-- Name: sensor sensor_id_dispositivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_id_dispositivo_fkey FOREIGN KEY (id_dispositivo) REFERENCES public.dispositivo(id_dispositivo) ON DELETE CASCADE;


--
-- TOC entry 5125 (class 2606 OID 57441)
-- Name: sensor sensor_id_tipo_sensor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_id_tipo_sensor_fkey FOREIGN KEY (id_tipo_sensor) REFERENCES public.tipo_sensor(id_tipo_sensor);


--
-- TOC entry 5145 (class 2606 OID 90174)
-- Name: telemetria telemetria_id_dispositivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telemetria
    ADD CONSTRAINT telemetria_id_dispositivo_fkey FOREIGN KEY (id_dispositivo) REFERENCES public.dispositivo(id_dispositivo);


-- Completed on 2026-10-06 22:33:49

--
-- PostgreSQL database dump complete
--

\unrestrict Z74BFURpnzKy72ChCoK2a3SK9kqedykdEjl7kh7rivW1hNILswdwMAtH6R735g4

