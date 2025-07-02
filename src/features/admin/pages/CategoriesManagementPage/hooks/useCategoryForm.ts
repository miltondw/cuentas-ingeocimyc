import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { categorySchema } from "@/lib/validation/adminSchemas";
import type { CategoryFormData, ServiceCategory } from "../types";

export function useCategoryForm(editingCategory: ServiceCategory | null) {
  const form = useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema),
    defaultValues: editingCategory
      ? { code: editingCategory.code, name: editingCategory.name }
      : { code: "", name: "" },
  });

  return form;
}
