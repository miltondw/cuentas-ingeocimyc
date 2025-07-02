import type { RowAction } from "@/components/common/DataTable";
import type { ServiceCategory } from "@/types/admin";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

export const getCategoryRowActions = (
  handleOpenEditDialog: (category: ServiceCategory) => void,
  setDeletingCategory: (category: ServiceCategory) => void
): RowAction[] => [
  {
    key: "edit",
    label: "Editar",
    icon: <EditIcon />,
    action: (category) => handleOpenEditDialog(category as ServiceCategory),
  },
  {
    key: "delete",
    label: "Eliminar",
    icon: <DeleteIcon />,
    color: "error",
    action: (category) => {
      const cat = category as ServiceCategory;
      if (!cat.services?.length) {
        setDeletingCategory(cat);
      }
    },
  },
];
