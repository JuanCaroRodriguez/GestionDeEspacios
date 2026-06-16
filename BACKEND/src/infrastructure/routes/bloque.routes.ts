import { Router } from "express";
import { BloqueRepository } from "../repositories/Bloque.repository";
import { EspacioRepository } from "../repositories/Espacio.repository";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const bloqueRepository = new BloqueRepository();
const espacioRepository = new EspacioRepository();

// POST /api/bloques - Crear bloque
router.post("/", async (req, res) => {
  try {
    const { nombre, id_empresa, pisos, departamento } = req.body;

    // Validaciones
    if (!nombre || !id_empresa) {
      return res
        .status(400)
        .json({ error: "El nombre y id_empresa son obligatorios" });
    }

    // Generar ID único
    const id = `BLQ-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Crear bloque
    const { Bloque } = await import("../../domain/Bloque");
    const bloque = new Bloque(id, nombre.trim(), id_empresa);

    // Añadir pisos si se proporcionan
    if (pisos && Array.isArray(pisos)) {
      for (const pisoData of pisos) {
        bloque.addPiso(pisoData.numero, pisoData.cantidadSalones);
      }
    }

    const createdBloque = await bloqueRepository.create(bloque);

    // Crear espacios automáticamente para cada piso y salón
    const { Espacio } = await import("../../domain/Espacio");
    const espaciosCreados = [];

    if (pisos && Array.isArray(pisos)) {
      for (const pisoData of pisos) {
        const numeroPiso = pisoData.numero;
        const cantidadSalones = pisoData.cantidadSalones;
        const capacidadesSalones = pisoData.capacidadesSalones || [];

        // Crear espacios para este piso
        for (let salonNum = 1; salonNum <= cantidadSalones; salonNum++) {
          const espacioId = uuidv4();
          const nombreEspacio = `${nombre.trim()} - Piso ${numeroPiso} - Espacio ${salonNum}`;

          // Formato del salon: [numeropiso][0 si salon<10][numerosalon]
          const salonFormato =
            salonNum < 10
              ? `${numeroPiso}0${salonNum}`
              : `${numeroPiso}${salonNum}`;

          // Obtener capacidad para este espacio (individual o general)
          const capacidadEspacio =
            capacidadesSalones[salonNum - 1] || pisoData.capacidadSalones || 30;

          const espacio = new Espacio(
            espacioId,
            nombreEspacio,
            "Por asignar", // tipo
            capacidadEspacio, // capacidad 
            id, // id_bloque
            numeroPiso, // piso
            salonFormato, // salon (formato nuevo)
            id_empresa, // id_empresa
            departamento, // departamento (heredado del bloque)
          );

          const createdEspacio = await espacioRepository.create(espacio);
          espaciosCreados.push(createdEspacio);
        }
      }
    }

    res.status(201).json({
      bloque: createdBloque,
      espacios: espaciosCreados,
      totalEspacios: espaciosCreados.length,
    });
  } catch (error) {
    console.error("Error al crear bloque:", error);
    res.status(500).json({ error: "Error al crear bloque" });
  }
});

// GET /api/bloques - Obtener todos los bloques
router.get("/", async (req, res) => {
  try {
    const bloques = await bloqueRepository.findAll();
    res.json(bloques);
  } catch (error) {
    console.error("Error al obtener bloques:", error);
    res.status(500).json({ error: "Error al obtener bloques" });
  }
});

// GET /api/bloques/:id - Obtener bloque por ID
router.get("/:id", async (req, res) => {
  try {
    const bloque = await bloqueRepository.findById(req.params.id);
    if (!bloque) {
      return res.status(404).json({ error: "Bloque no encontrado" });
    }
    res.json(bloque);
  } catch (error) {
    console.error("Error al obtener bloque:", error);
    res.status(500).json({ error: "Error al obtener bloque" });
  }
});

// GET /api/bloques/empresa/:id_empresa - Obtener bloques por empresa
router.get("/empresa/:id_empresa", async (req, res) => {
  try {
    const bloques = await bloqueRepository.findByIdEmpresa(
      req.params.id_empresa,
    );
    res.json(bloques);
  } catch (error) {
    console.error("Error al obtener bloques de la empresa:", error);
    res.status(500).json({ error: "Error al obtener bloques de la empresa" });
  }
});

// PUT /api/bloques/:id - Actualizar bloque
router.put("/:id", async (req, res) => {
  try {
    const { nombre, pisos } = req.body;

    const bloque = await bloqueRepository.findById(req.params.id);
    if (!bloque) {
      return res.status(404).json({ error: "Bloque no encontrado" });
    }

    // Actualizar campos
    if (nombre) bloque.setNombre(nombre.trim());
    if (pisos && Array.isArray(pisos)) {
      // Reemplazar todos los pisos
      // Primero limpiar pisos existentes
      const pisosActuales = bloque.getPisos();
      for (const piso of pisosActuales) {
        bloque.removePiso(piso.numero);
      }

      // Añadir nuevos pisos
      for (const pisoData of pisos) {
        bloque.addPiso(pisoData.numero, pisoData.cantidadSalones);
      }
    }

    const updatedBloque = await bloqueRepository.update(req.params.id, bloque);
    res.json(updatedBloque);
  } catch (error) {
    console.error("Error al actualizar bloque:", error);
    res.status(500).json({ error: "Error al actualizar bloque" });
  }
});

// DELETE /api/bloques/:id - Eliminar bloque
router.delete("/:id", async (req, res) => {
  try {
    const exists = await bloqueRepository.existsById(req.params.id);
    if (!exists) {
      return res.status(404).json({ error: "Bloque no encontrado" });
    }

    const deleted = await bloqueRepository.delete(req.params.id);
    if (deleted) {
      res.json({ message: "Bloque eliminado correctamente" });
    } else {
      res.status(500).json({ error: "No se pudo eliminar el bloque" });
    }
  } catch (error) {
    console.error("Error al eliminar bloque:", error);
    res.status(500).json({ error: "Error al eliminar bloque" });
  }
});

// POST /api/bloques/:id/pisos - Añadir piso a un bloque
router.post("/:id/pisos", async (req, res) => {
  try {
    const {
      numero,
      cantidadSalones,
      capacidadSalones,
      capacidadesSalones,
      departamento,
    } = req.body;

    if (!numero || !cantidadSalones || !capacidadSalones) {
      return res.status(400).json({
        error: "El número, cantidad de salones y capacidad son obligatorios",
      });
    }

    const bloque = await bloqueRepository.findById(req.params.id);
    if (!bloque) {
      return res.status(404).json({ error: "Bloque no encontrado" });
    }

    bloque.addPiso(numero, cantidadSalones);
    const updatedBloque = await bloqueRepository.update(req.params.id, bloque);

    // Crear espacios para el nuevo piso con capacidad correcta
    const { Espacio } = await import("../../domain/Espacio");
    const espaciosCreados = [];

    for (let salonNum = 1; salonNum <= cantidadSalones; salonNum++) {
      const espacioId = uuidv4();
      const nombreEspacio = `${bloque.getNombre()} - Piso ${numero} - Espacio ${salonNum}`;

      // Formato del salon: [numeropiso][0 si salon<10][numerosalon]
      const salonFormato =
        salonNum < 10 ? `${numero}0${salonNum}` : `${numero}${salonNum}`;

      // Obtener capacidad para este espacio (individual o general)
      const capacidadEspacio =
        capacidadesSalones?.[salonNum - 1] || capacidadSalones || 30;

      const espacio = new Espacio(
        espacioId,
        nombreEspacio,
        "Por asignar", // tipo
        capacidadEspacio, // capacidad ✅ USAR CAPACIDAD CORRECTA
        bloque.getId(), // id_bloque
        numero, // piso
        salonFormato, // salon
        bloque.getIdEmpresa(), // id_empresa
        departamento, // departamento (heredado del bloque)
      );

      const createdEspacio = await espacioRepository.create(espacio);
      espaciosCreados.push(createdEspacio);
    }

    res.status(201).json({
      bloque: updatedBloque,
      espacios: espaciosCreados,
      totalEspacios: espaciosCreados.length,
    });
  } catch (error) {
    console.error("Error al añadir piso:", error);
    res.status(500).json({ error: "Error al añadir piso" });
  }
});

// DELETE /api/bloques/:id/pisos/:numeroPiso - Eliminar piso de un bloque
router.delete("/:id/pisos/:numeroPiso", async (req, res) => {
  try {
    const bloque = await bloqueRepository.findById(req.params.id);
    if (!bloque) {
      return res.status(404).json({ error: "Bloque no encontrado" });
    }

    bloque.removePiso(parseInt(req.params.numeroPiso));
    const updatedBloque = await bloqueRepository.update(req.params.id, bloque);
    res.json(updatedBloque);
  } catch (error) {
    console.error("Error al eliminar piso:", error);
    res.status(500).json({ error: "Error al eliminar piso" });
  }
});

// PUT /api/bloques/:id/pisos/:numeroPiso - Actualizar piso de un bloque
router.put("/:id/pisos/:numeroPiso", async (req, res) => {
  try {
    const { cantidadSalones } = req.body;

    if (!cantidadSalones) {
      return res
        .status(400)
        .json({ error: "La cantidad de salones es obligatoria" });
    }

    const bloque = await bloqueRepository.findById(req.params.id);
    if (!bloque) {
      return res.status(404).json({ error: "Bloque no encontrado" });
    }

    bloque.updatePiso(parseInt(req.params.numeroPiso), cantidadSalones);
    const updatedBloque = await bloqueRepository.update(req.params.id, bloque);
    res.json(updatedBloque);
  } catch (error) {
    console.error("Error al actualizar piso:", error);
    res.status(500).json({ error: "Error al actualizar piso" });
  }
});

export default router;
