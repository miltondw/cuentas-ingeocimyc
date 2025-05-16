import { Box, TextField, styled } from "@mui/material";
import { BlowData } from "./profileTypes";

interface BlowDataTableProps {
  blowsData: BlowData[];
  handleBlowChange: (
    index: number,
    field: keyof BlowData,
    value: string | number
  ) => void;
}

const StyledTable = styled("table")(({ theme }) => ({
  width: "100%",
  borderCollapse: "collapse",
  "& thead tr": {
    backgroundColor: theme.palette.grey[100],
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  "& th, & td": {
    padding: theme.spacing(1),
    textAlign: "left",
  },
  "& tbody tr": {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const BlowDataTable = ({ blowsData, handleBlowChange }: BlowDataTableProps) => {
  return (
    <Box
      sx={{
        maxHeight: "500px",
        overflowY: "auto",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
      }}
    >
      <StyledTable aria-label="Tabla de datos de golpes">
        <thead>
          <tr>
            <th>Profundidad (m)</th>
            <th style={{ textAlign: "center" }}>6"</th>
            <th style={{ textAlign: "center" }}>12"</th>
            <th style={{ textAlign: "center" }}>18"</th>
            <th style={{ textAlign: "center" }}>N</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {blowsData.map((row, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: Number(row.n) > 0 ? "#f5f9ff" : undefined,
              }}
            >
              <td>{row.depth}</td>
              <td>
                <TextField
                  type="number"
                  value={row.blows6}
                  onChange={(e) =>
                    handleBlowChange(index, "blows6", e.target.value)
                  }
                  size="small"
                  fullWidth
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  aria-label={`Golpes a 6 pulgadas para profundidad ${row.depth}`}
                />
              </td>
              <td>
                <TextField
                  type="number"
                  value={row.blows12}
                  onChange={(e) =>
                    handleBlowChange(index, "blows12", e.target.value)
                  }
                  size="small"
                  fullWidth
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  aria-label={`Golpes a 12 pulgadas para profundidad ${row.depth}`}
                />
              </td>
              <td>
                <TextField
                  type="number"
                  value={row.blows18}
                  onChange={(e) =>
                    handleBlowChange(index, "blows18", e.target.value)
                  }
                  size="small"
                  fullWidth
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  aria-label={`Golpes a 18 pulgadas para profundidad ${row.depth}`}
                />
              </td>
              <td
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  color: Number(row.n) > 0 ? "#1976d2" : "inherit",
                }}
              >
                {row.n}
              </td>
              <td>
                <TextField
                  value={row.observation || ""}
                  onChange={(e) =>
                    handleBlowChange(index, "observation", e.target.value)
                  }
                  size="small"
                  fullWidth
                  placeholder="Ingresa descripción del suelo"
                  inputProps={{
                    "aria-label": `Observación para profundidad ${row.depth}`,
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </Box>
  );
};

export default BlowDataTable;
