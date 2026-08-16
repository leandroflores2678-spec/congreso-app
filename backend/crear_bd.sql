-- Crear base de datos CongresoBD
CREATE DATABASE CongresoBD;
GO
USE CongresoBD;
GO

-- Personas inscriptas
CREATE TABLE Personas (
  id INT IDENTITY(1,1) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NULL,
  tipo_persona VARCHAR(20) NOT NULL DEFAULT 'Hermano',
  fecha_registro DATETIME NOT NULL DEFAULT GETDATE()
);

-- Conferencias
CREATE TABLE Conferencias (
  id INT IDENTITY(1,1) PRIMARY KEY,
  nombre NVARCHAR(200) NOT NULL,
  lema NVARCHAR(300) NULL,
  fecha_inicio DATE NULL,
  fecha_fin DATE NULL
);

-- Inscripciones a conferencias
CREATE TABLE Inscripciones (
  id INT IDENTITY(1,1) PRIMARY KEY,
  persona_id INT NOT NULL REFERENCES Personas(id),
  conferencia_id INT NOT NULL REFERENCES Conferencias(id),
  fecha_inscripcion DATETIME NOT NULL DEFAULT GETDATE()
);

-- Cronograma de comidas (cupos por día/turno)
CREATE TABLE Cronograma_Comidas (
  id INT IDENTITY(1,1) PRIMARY KEY,
  dia DATE NOT NULL,
  turno VARCHAR(20) NOT NULL,
  tipo_persona VARCHAR(20) NOT NULL DEFAULT 'Todos',
  cupo INT NOT NULL DEFAULT 100
);

-- Reservas de comidas
CREATE TABLE Reserva_Comidas (
  id INT IDENTITY(1,1) PRIMARY KEY,
  persona_id INT NOT NULL REFERENCES Personas(id),
  cronograma_id INT NOT NULL REFERENCES Cronograma_Comidas(id),
  fecha_reserva DATETIME NOT NULL DEFAULT GETDATE(),
  CONSTRAINT UQ_Persona_Comida UNIQUE (persona_id, cronograma_id)
);

-- Insertar conferencia
INSERT INTO Conferencias (nombre, lema, fecha_inicio, fecha_fin)
VALUES ('Conferencia Septiembre 2025', 'Dios Envía Obreros a Tu Mies', '2025-09-10', '2025-09-14');

-- Insertar cronograma de comidas
-- Miércoles 10: solo reunión de apertura, no hay comidas

-- Jueves 11
INSERT INTO Cronograma_Comidas (conferencia_id, dia, turno, tipo_persona, cupo) VALUES (1, '2025-09-11', 'Desayuno', 'Todos', 100);
INSERT INTO Cronograma_Comidas (conferencia_id, dia, turno, tipo_persona, cupo) VALUES (1, '2025-09-11', 'Almuerzo', 'Todos', 100);
INSERT INTO Cronograma_Comidas (conferencia_id, dia, turno, tipo_persona, cupo) VALUES (1, '2025-09-11', 'Merienda', 'Todos', 100);

-- Viernes 12
INSERT INTO Cronograma_Comidas (conferencia_id, dia, turno, tipo_persona, cupo) VALUES (1, '2025-09-12', 'Desayuno', 'Todos', 100);
INSERT INTO Cronograma_Comidas (conferencia_id, dia, turno, tipo_persona, cupo) VALUES (1, '2025-09-12', 'Almuerzo', 'Todos', 100);
INSERT INTO Cronograma_Comidas (conferencia_id, dia, turno, tipo_persona, cupo) VALUES (1, '2025-09-12', 'Merienda', 'Todos', 100);

-- Sábado 13
INSERT INTO Cronograma_Comidas (conferencia_id, dia, turno, tipo_persona, cupo) VALUES (1, '2025-09-13', 'Desayuno', 'Todos', 100);
INSERT INTO Cronograma_Comidas (conferencia_id, dia, turno, tipo_persona, cupo) VALUES (1, '2025-09-13', 'Almuerzo', 'Todos', 100);
INSERT INTO Cronograma_Comidas (conferencia_id, dia, turno, tipo_persona, cupo) VALUES (1, '2025-09-13', 'Merienda', 'Todos', 100);

-- Domingo 14
INSERT INTO Cronograma_Comidas (conferencia_id, dia, turno, tipo_persona, cupo) VALUES (1, '2025-09-14', 'Desayuno', 'Todos', 100);
INSERT INTO Cronograma_Comidas (conferencia_id, dia, turno, tipo_persona, cupo) VALUES (1, '2025-09-14', 'Almuerzo', 'Todos', 100);
INSERT INTO Cronograma_Comidas (conferencia_id, dia, turno, tipo_persona, cupo) VALUES (1, '2025-09-14', 'Merienda', 'Todos', 100);
