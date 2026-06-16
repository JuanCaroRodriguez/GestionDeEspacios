import { Request, Response } from "express";
import { DepartamentoService } from "../../services/departamentos.service";
import { IDepartamento } from "../models/Departamento.model";

export class DepartamentoController {
  private departamentoService: DepartamentoService;

  constructor() {
    this.departamentoService = new DepartamentoService();
  }

  createDepartamento = async (req: Request, res: Response) => {
    try {
      const { nombre, id_empresa } = req.body;

      if (!nombre || !id_empresa) {
        return res.status(400).json({
          success: false,
          message: "El nombre y el id_empresa son requeridos",
        });
      }

      const departamento = await this.departamentoService.createDepartamento({
        nombre,
        id_empresa,
      });

      res.status(201).json({
        success: true,
        message: "Departamento creado exitosamente",
        data: departamento,
      });
    } catch (error: any) {
      console.error("Error al crear departamento:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error al crear el departamento",
      });
    }
  };

  getDepartamentoById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "El ID del departamento es requerido",
        });
      }

      const departamento =
        await this.departamentoService.getDepartamentoById(id);

      if (!departamento) {
        return res.status(404).json({
          success: false,
          message: "Departamento no encontrado",
        });
      }

      res.status(200).json({
        success: true,
        data: departamento,
      });
    } catch (error: any) {
      console.error("Error al obtener departamento:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el departamento",
      });
    }
  };

  getDepartamentosByEmpresa = async (req: Request, res: Response) => {
    try {
      const { id_empresa } = req.params;

      if (!id_empresa) {
        return res.status(400).json({
          success: false,
          message: "El ID de la empresa es requerido",
        });
      }

      const departamentos =
        await this.departamentoService.getDepartamentosByEmpresa(id_empresa);

      res.status(200).json({
        success: true,
        data: departamentos,
      });
    } catch (error: any) {
      console.error("Error al obtener departamentos:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error al obtener los departamentos",
      });
    }
  };

  updateDepartamento = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nombre, id_empresa } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "El ID del departamento es requerido",
        });
      }

      const updateData: any = {};
      if (nombre) updateData.nombre = nombre;
      if (id_empresa) updateData.id_empresa = id_empresa;

      const departamento = await this.departamentoService.updateDepartamento(
        id,
        updateData,
      );

      if (!departamento) {
        return res.status(404).json({
          success: false,
          message: "Departamento no encontrado",
        });
      }

      res.status(200).json({
        success: true,
        message: "Departamento actualizado exitosamente",
        data: departamento,
      });
    } catch (error: any) {
      console.error("Error al actualizar departamento:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error al actualizar el departamento",
      });
    }
  };

  deleteDepartamento = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "El ID del departamento es requerido",
        });
      }

      const deleted = await this.departamentoService.deleteDepartamento(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Departamento no encontrado",
        });
      }

      res.status(200).json({
        success: true,
        message: "Departamento eliminado exitosamente",
      });
    } catch (error: any) {
      console.error("Error al eliminar departamento:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error al eliminar el departamento",
      });
    }
  };

  updateDepartamentosByEmpresa = async (req: Request, res: Response) => {
    try {
      console.log("Body recibido:", req.body);
      const { tempId, realId } = req.body;

      console.log("tempId:", tempId, "realId:", realId);

      if (!tempId || !realId) {
        console.log("Faltan parámetros");
        return res.status(400).json({
          success: false,
          message: "Se requieren tempId y realId",
        });
      }

      await this.departamentoService.updateDepartamentosEmpresa(tempId, realId);

      res.status(200).json({
        success: true,
        message: "Departamentos actualizados exitosamente",
      });
    } catch (error: any) {
      console.error("Error al actualizar departamentos:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error al actualizar los departamentos",
      });
    }
  };
}
