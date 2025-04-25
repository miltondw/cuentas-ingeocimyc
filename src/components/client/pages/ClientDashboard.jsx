import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button,
    IconButton,
    CircularProgress,
    Alert,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api";

const ClientDashboard = () => {
    const [state, setState] = useState({
        requests: [],
        loading: false,
        error: null,
        currentPage: 1,
        totalPages: 1,
        deleteModal: { open: false, requestId: null },
    });

    const navigate = useNavigate();
    const rowsPerPage = 10;

    useEffect(() => {
        const fetchRequests = async () => {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            try {
                const response = await api.get("/service-requests", {
                    params: { page: state.currentPage, limit: rowsPerPage },
                });
                setState((prev) => ({
                    ...prev,
                    requests: response.data.requests,
                    totalPages: Math.ceil(response.data.total / rowsPerPage),
                    loading: false,
                }));
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    error: error.response?.data?.message || "Error al cargar solicitudes",
                    loading: false,
                }));
            }
        };
        fetchRequests();
    }, [state.currentPage]);

    const handlePageChange = (event, page) => {
        setState((prev) => ({ ...prev, currentPage: page }));
    };

    const handleDelete = async () => {
        setState((prev) => ({ ...prev, loading: true }));
        try {
            await api.delete(`/service-requests/${state.deleteModal.requestId}`);
            setState((prev) => ({
                ...prev,
                requests: prev.requests.filter(
                    (request) => request.id !== prev.deleteModal.requestId
                ),
                deleteModal: { open: false, requestId: null },
                loading: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: error.response?.data?.message || "Error al eliminar solicitud",
                loading: false,
            }));
        }
    };

    return (
        <TableContainer component={Paper} sx={{ m: 3, p: 2, width: "90vw" }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                Dashboard de Solicitudes
            </Typography>

            <Button
                variant="contained"
                component={Link}
                to="/cliente"
                sx={{ mb: 3 }}
            >
                Crear Nueva Solicitud
            </Button>

            {state.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {state.error}
                </Alert>
            )}

            {state.loading ? (
                <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
            ) : (
                <>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Proyecto</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {state.requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>{request.id}</TableCell>
                                    <TableCell>{request.name}</TableCell>
                                    <TableCell>{request.name_project}</TableCell>
                                    <TableCell>{request.status}</TableCell>
                                    <TableCell>
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() =>
                                                navigate(`/cliente/${request.id}`, {
                                                    state: { request },
                                                })
                                            }
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() =>
                                                setState((prev) => ({
                                                    ...prev,
                                                    deleteModal: { open: true, requestId: request.id },
                                                }))
                                            }
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination
                        count={state.totalPages}
                        page={state.currentPage}
                        onChange={handlePageChange}
                        sx={{ mt: 3, display: "flex", justifyContent: "center" }}
                    />
                </>
            )}

            <Dialog
                open={state.deleteModal.open}
                onClose={() =>
                    setState((prev) => ({
                        ...prev,
                        deleteModal: { open: false, requestId: null },
                    }))
                }
            >
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro de eliminar esta solicitud? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            setState((prev) => ({
                                ...prev,
                                deleteModal: { open: false, requestId: null },
                            }))
                        }
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        disabled={state.loading}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </TableContainer>
    );
};

export default ClientDashboard;