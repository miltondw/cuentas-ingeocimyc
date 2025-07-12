import { useState, useEffect, useCallback, useRef } from "react";
import { labService } from "@/services/api/labService";
import type { AssaysByCategory, AssayFormItem } from "../types";

export const useAssays = () => {
  const [loading, setLoading] = useState(false);
  const [assaysByCategory, setAssaysByCategory] = useState<AssaysByCategory[]>(
    []
  );
  const [selectedAssays, setSelectedAssays] = useState<AssayFormItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar categorías y ensayos
  useEffect(() => {
    const fetchAssays = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await labService.getAssaysByCategoryGroup();
        setAssaysByCategory(data);
      } catch (err) {
        console.error("Error cargando ensayos:", err);
        setError("Error al cargar los ensayos disponibles");
      } finally {
        setLoading(false);
      }
    };

    fetchAssays();
  }, []);

  // Añadir un ensayo a los seleccionados
  const addAssay = useCallback((assay: AssayFormItem) => {
    // Si el ensayo fue eliminado manualmente antes, lo eliminamos de esa lista
    if (removedAssaysRef.current.has(assay.id)) {
      console.info(`Eliminando ensayo ${assay.id} de la lista de removidos`);
      removedAssaysRef.current.delete(assay.id);
    }

    setSelectedAssays((prev) => {
      // Verificar si el ensayo ya existe
      if (prev.some((a) => a.id === assay.id)) {
        console.info(`Ensayo ya existe, no se añade: ${assay.name}`);
        return prev;
      }
      const newAssays = [...prev, assay];
      console.info(`Añadido ensayo: ${assay.name} (ID: ${assay.id})`);
      return newAssays;
    });
  }, []);

  // Remover un ensayo de los seleccionados
  const removeAssay = useCallback((assayId: number) => {
    // Añadir a la lista de ensayos específicamente eliminados
    removedAssaysRef.current.add(assayId);

    setSelectedAssays((prev) => {
      const assayToRemove = prev.find((a) => a.id === assayId);
      if (!assayToRemove) {
        console.info(
          `Intento de remover ensayo que no existe (ID: ${assayId})`
        );
        return prev;
      }
      console.info(`Removido ensayo: ${assayToRemove.name} (ID: ${assayId})`);
      return prev.filter((a) => a.id !== assayId);
    });
  }, []);

  // Limpiar todos los ensayos seleccionados
  const clearAssays = useCallback(() => {
    setSelectedAssays([]);
  }, []);

  // Mantenemos un registro de los ensayos específicamente eliminados
  const removedAssaysRef = useRef<Set<number>>(new Set());

  // Establecer ensayos desde una fuente externa (ej: solicitud de servicio)
  const setAssaysFromSource = useCallback(
    (assays: AssayFormItem[], respectRemoved = true) => {
      console.info(
        `Estableciendo ${assays.length} ensayos desde fuente externa (respectRemoved: ${respectRemoved})`
      );

      // Si assays está vacío, no hacemos nada
      if (!assays || assays.length === 0) {
        console.warn("No hay ensayos para establecer desde fuente externa");
        return;
      }

      // No sobrescribir, sino actualizar el array existente (a menos que sea una carga inicial o completa)
      setSelectedAssays((currentAssays) => {
        // Si respectRemoved es false, es una carga inicial o completa,
        // simplemente reemplazamos todo (pero mantenemos un log)
        if (!respectRemoved) {
          console.info(
            `Reemplazando todos los ensayos con ${assays.length} ensayos nuevos`
          );
          return [...assays];
        }

        // Crear un mapa con los ensayos actuales para verificación rápida
        const currentAssaysMap = new Map(
          currentAssays.map((assay) => [assay.id, assay])
        );

        // Fusionar los nuevos ensayos con los actuales
        const mergedAssays: AssayFormItem[] = [...currentAssays];

        // Agregar nuevos ensayos que no estén presentes y que no hayan sido explícitamente eliminados
        assays.forEach((newAssay) => {
          const isManuallyRemoved = removedAssaysRef.current.has(newAssay.id);

          if (!currentAssaysMap.has(newAssay.id) && !isManuallyRemoved) {
            mergedAssays.push(newAssay);
            console.info(
              `Añadiendo ensayo desde fuente externa: ${newAssay.name} (ID: ${newAssay.id})`
            );
          } else if (isManuallyRemoved) {
            console.info(
              `Ignorando ensayo removido manualmente: ${newAssay.name} (ID: ${newAssay.id})`
            );
          } else {
            console.info(
              `Ensayo ya existe: ${newAssay.name} (ID: ${newAssay.id})`
            );
          }
        });

        // Log detallado para depuración
        console.info(
          `Total de ensayos después de fusionar: ${mergedAssays.length}`
        );
        console.info(
          `IDs de ensayos después de fusionar: [${mergedAssays
            .map((a) => a.id)
            .join(", ")}]`
        );
        return mergedAssays;
      });
    },
    []
  );

  return {
    loading,
    assaysByCategory,
    selectedAssays,
    error,
    addAssay,
    removeAssay,
    clearAssays,
    setAssaysFromSource,
    removedAssaysRef, // Exponemos esta referencia para operaciones especiales
  };
};
