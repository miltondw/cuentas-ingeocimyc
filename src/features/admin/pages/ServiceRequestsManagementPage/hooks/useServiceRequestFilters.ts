import { useState } from "react";
import type { AdminServiceRequestFilters } from "@/types/serviceRequests";

export function useServiceRequestFilters(initial: AdminServiceRequestFilters) {
  const [filters, setFilters] = useState<AdminServiceRequestFilters>(initial);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  return {
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
  };
}
