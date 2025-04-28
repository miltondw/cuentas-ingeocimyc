// components/ApiquesDeSuelos/LayersTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Layer } from "./apiqueTypes";
import TextField from "@mui/material/TextField";

interface LayersTableProps {
  layers: Layer[];
  handleLayerChange: (
    index: number,
    field: keyof Layer,
    value: string | number
  ) => void;
  removeLayer: (index: number) => void;
}

const LayersTable = ({
  layers,
  handleLayerChange,
  removeLayer,
}: LayersTableProps) => {
  return (
    <TableContainer sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Número de Capa</TableCell>
            <TableCell>Espesor (m)</TableCell>
            <TableCell>Identificación de Muestra</TableCell>
            <TableCell>Observación</TableCell>
            <TableCell>Acción</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {layers.map((layer, index) => (
            <TableRow key={index}>
              <TableCell>{layer.layer_number}</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={layer.thickness}
                  onChange={(e) =>
                    handleLayerChange(index, "thickness", e.target.value)
                  }
                  size="small"
                  fullWidth
                  inputProps={{ step: "0.01", min: 0 }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={layer.sample_id}
                  onChange={(e) =>
                    handleLayerChange(index, "sample_id", e.target.value)
                  }
                  size="small"
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={layer.observation}
                  onChange={(e) =>
                    handleLayerChange(index, "observation", e.target.value)
                  }
                  size="small"
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <IconButton
                  aria-label={`Eliminar capa ${layer.layer_number}`}
                  onClick={() => removeLayer(index)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LayersTable;
