// components/ApiquesDeSuelos/MobileLayersAccordion.tsx
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import TextField from "@mui/material/TextField";
import { Layer } from "./apiqueTypes";

interface MobileLayersAccordionProps {
  layers: Layer[];
  handleLayerChange: (
    index: number,
    field: keyof Layer,
    value: string | number
  ) => void;
  removeLayer: (index: number) => void;
}

const MobileLayersAccordion = ({
  layers,
  handleLayerChange,
  removeLayer,
}: MobileLayersAccordionProps) => {
  return (
    <div style={{ marginTop: "20px" }}>
      {layers.map((layer, index) => (
        <Accordion key={index} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Capa {layer.layer_number}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              label="Espesor (m)"
              type="number"
              value={layer.thickness}
              onChange={(e) =>
                handleLayerChange(index, "thickness", e.target.value)
              }
              fullWidth
              margin="normal"
              inputProps={{ step: "0.01", min: 0 }}
            />
            <TextField
              label="Identificación de Muestra"
              value={layer.sample_id}
              onChange={(e) =>
                handleLayerChange(index, "sample_id", e.target.value)
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Observación"
              value={layer.observation}
              onChange={(e) =>
                handleLayerChange(index, "observation", e.target.value)
              }
              fullWidth
              margin="normal"
            />
            <Button
              variant="outlined"
              color="error"
              onClick={() => removeLayer(index)}
              sx={{ mt: 2 }}
              startIcon={<DeleteIcon />}
            >
              Eliminar Capa
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default MobileLayersAccordion;
