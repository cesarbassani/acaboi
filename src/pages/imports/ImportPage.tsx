// src/pages/imports/ImportPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Stepper, Step, StepLabel, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import UploadFileStep from '../../pages/imports/UploadFileStep';
import ColumnMappingStep from '../../pages/imports/ColumnMappingStep';
import DataPreviewStep from '../../pages/imports/DataPreviewStep';
import ImportSummaryStep from '../../pages/imports/ImportSummaryStep';
import { readFile, processData, validateData, importData, ImportAbateData, ColumnMapping, ValidationError } from '../../services/importService';
import { getProdutores } from '../../services/produtorService';
import { getFrigorificos } from '../../services/frigorificoService';
import { getCategorias } from '../../services/categoriaService';

const steps = ['Selecionar Arquivo', 'Mapear Colunas', 'Revisar Dados', 'Importar'];

const ImportPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [processedData, setProcessedData] = useState<ImportAbateData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);
  
  const [produtores, setProdutores] = useState<any[]>([]);
  const [frigorificos, setFrigorificos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [produtoresData, frigorificosData, categoriasData] = await Promise.all([
          getProdutores(),
          getFrigorificos(),
          getCategorias()
        ]);
        
        setProdutores(produtoresData);
        setFrigorificos(frigorificosData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao carregar dados de referência:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar dados necessários para importação. Tente novamente.',
          severity: 'error'
        });
      }
    };
    
    loadReferenceData();
  }, []);

  const handleNext = async () => {
    setIsLoading(true);
    try {
      if (activeStep === 0) {
        // Ler arquivo
        if (!file) {
          setSnackbar({
            open: true,
            message: 'Selecione um arquivo para continuar.',
            severity: 'error'
          });
          setIsLoading(false);
          return;
        }
        
        const data = await readFile(file);
        if (data.length < 2) {
          setSnackbar({
            open: true,
            message: 'O arquivo não contém dados suficientes para importação.',
            severity: 'error'
          });
          setIsLoading(false);
          return;
        }
        
        setFileData(data);
        
        // Iniciar o mapeamento automaticamente com colunas detectadas
        const headers = data[0];
        const initialMapping: ColumnMapping[] = [];
        
        // Mapeamento automático baseado em nomes de colunas comuns
        const columnMap: { [key: string]: keyof ImportAbateData } = {
          'data': 'data_abate',
          'data abate': 'data_abate',
          'data_abate': 'data_abate',
          'lote': 'nome_lote',
          'nome_lote': 'nome_lote',
          'nome do lote': 'nome_lote',
          'quantidade': 'quantidade',
          'qtd': 'quantidade',
          'arroba': 'valor_arroba_negociada',
          'valor_arroba': 'valor_arroba_negociada',
          'valor arroba': 'valor_arroba_negociada',
          'valor_arroba_negociada': 'valor_arroba_negociada',
          'total': 'valor_total_acerto',
          'valor_total': 'valor_total_acerto',
          'valor total': 'valor_total_acerto',
          'valor_total_acerto': 'valor_total_acerto',
          'produtor': 'id_produtor',
          'id_produtor': 'id_produtor',
          'frigorifico': 'id_frigorifico',
          'id_frigorifico': 'id_frigorifico',
          'categoria': 'id_categoria_animal',
          'id_categoria': 'id_categoria_animal',
          'id_categoria_animal': 'id_categoria_animal',
          'trace': 'trace',
          'hilton': 'hilton',
          'novilho_precoce': 'novilho_precoce',
          'novilho': 'novilho_precoce'
        };
        
        headers.forEach((header: string) => {
          const normalizedHeader = header.toLowerCase().trim();
          for (const [key, value] of Object.entries(columnMap)) {
            if (normalizedHeader.includes(key.toLowerCase())) {
              initialMapping.push({ sheetColumn: header, dbField: value });
              break;
            }
          }
        });
        
        setColumnMapping(initialMapping);
      } else if (activeStep === 1) {
        // Processar dados com mapeamento
        if (columnMapping.length === 0) {
          setSnackbar({
            open: true,
            message: 'Faça o mapeamento de pelo menos uma coluna para continuar.',
            severity: 'error'
          });
          setIsLoading(false);
          return;
        }
        
        const processed = processData(fileData, columnMapping);
        setProcessedData(processed);
        
        // Validar dados
        const errors = validateData(processed);
        setValidationErrors(errors);
      } else if (activeStep === 2) {
        // Verificar erros de validação
        if (validationErrors.length > 0) {
          setSnackbar({
            open: true,
            message: `Existem ${validationErrors.length} erros que precisam ser corrigidos antes de continuar.`,
            severity: 'error'
          });
          setIsLoading(false);
          return;
        }
        
        // Importar dados
        const result = await importData(processedData);
        setImportResult(result);
        
        setSnackbar({
          open: true,
          message: `Importação concluída: ${result.success} registros importados com sucesso, ${result.errors} erros.`,
          severity: result.errors === 0 ? 'success' : 'warning'
        });
      }
      
      setActiveStep((prev) => prev + 1);
    } catch (error) {
      console.error('Erro no processo de importação:', error);
      setSnackbar({
        open: true,
        message: 'Ocorreu um erro inesperado. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setFileData([]);
    setColumnMapping([]);
    setProcessedData([]);
    setValidationErrors([]);
    setImportResult(null);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleColumnMappingChange = (newMapping: ColumnMapping[]) => {
    setColumnMapping(newMapping);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>
          Importação de Abates
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <UploadFileStep
            onFileSelect={handleFileSelect}
            selectedFile={file}
          />
        )}

        {activeStep === 1 && (
          <ColumnMappingStep
            headers={fileData[0] || []}
            mapping={columnMapping}
            onMappingChange={handleColumnMappingChange}
          />
        )}

        {activeStep === 2 && (
          <DataPreviewStep
            data={processedData}
            validationErrors={validationErrors}
            produtores={produtores}
            frigorificos={frigorificos}
            categorias={categorias}
          />
        )}

        {activeStep === 3 && (
          <ImportSummaryStep
            result={importResult}
            onRestart={handleReset}
          />
        )}

        {activeStep < steps.length - 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                disabled={isLoading}
              >
                Voltar
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isLoading || (activeStep === 0 && !file)}
            >
              {isLoading ? <CircularProgress size={24} /> : activeStep === 2 ? 'Importar' : 'Próximo'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Snackbar para mensagens */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImportPage;