// src/components/DataTable.tsx
import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  getRowId: (row: T) => string | number;
  title?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  getRowId,
  title
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {title && (
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Box>
      )}
      
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{ fontWeight: 'bold' }}
                >
                  {column.label}
                </TableCell>
              ))}
              {(onView || onEdit || onDelete) && (
                <TableCell align="center" style={{ minWidth: 120 }}>
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} 
                  align="center"
                  sx={{ py: 5 }}
                >
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Carregando dados...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} 
                  align="center"
                  sx={{ py: 5 }}
                >
                  <Typography variant="body1">
                    Nenhum registro encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={getRowId(row)}>
                      {columns.map((column) => {
                        const value = (row as any)[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format ? column.format(value, row) : value}
                          </TableCell>
                        );
                      })}
                      {(onView || onEdit || onDelete) && (
                        <TableCell align="center">
                          {onView && (
                            <Tooltip title="Visualizar">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onView(row)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onEdit && (
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onEdit(row)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onDelete(row)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  );
}