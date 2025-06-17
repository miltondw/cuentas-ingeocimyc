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
  "& th.centered": {
    textAlign: "center",
  },
  "& tbody tr": {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  "& td.highlighted-n": {
    textAlign: "center",
    fontWeight: "bold",
  },
  "& td.active-n": {
    color: theme.palette.primary.main,
  },
}));

const StyledBox = styled(Box)(({ theme }) => ({
  maxHeight: "500px",
  overflowY: "auto",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const StyledRow = styled("tr", {
  shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive?: boolean }>(({ theme, isActive }) => ({
  backgroundColor: isActive
    ? theme.palette.primary.light || "#f5f9ff"
    : "transparent",
}));

const BlowDataTable = ({ blowsData, handleBlowChange }: BlowDataTableProps) => {
  return (
    <StyledBox>
      <StyledTable aria-label="Tabla de datos de golpes">
        <thead>          <tr>
            <th>Profundidad (m)</th>
            <th className="centered">6&quot;</th>
            <th className="centered">12&quot;</th>
            <th className="centered">18&quot;</th>
            <th className="centered">N</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {blowsData.map((row, index) => (
            <StyledRow key={index} isActive={Number(row.n) > 0}>
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
                  sx={{ input: { textAlign: "center" } }}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    min: 0,
                  }}
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
                  sx={{ input: { textAlign: "center" } }}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    min: 0,
                  }}
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
                  sx={{ input: { textAlign: "center" } }}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    min: 0,
                  }}
                  aria-label={`Golpes a 18 pulgadas para profundidad ${row.depth}`}
                />
              </td>
              <td
                className={`highlighted-n ${
                  Number(row.n) > 0 ? "active-n" : ""
                }`}
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
            </StyledRow>
          ))}
        </tbody>
      </StyledTable>
    </StyledBox>
  );
};

export default BlowDataTable;
