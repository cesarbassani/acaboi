// src/components/imports/UploadFileStep.tsx
import React, { useRef, useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface UploadFileStepProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const UploadFileStep: React.FC<UploadFileStepProps> = ({ onFileSelect, selectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Selecione um arquivo Excel ou CSV para importar
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Formatos suportados: .xlsx, .xls, .csv
      </Typography>
      
      <Paper 
        sx={{ 
          p: 5, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls,.csv"
        />
        
        <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Arraste e solte o arquivo aqui
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ou
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={(e) => {
            e.stopPropagation();
            handleBrowseClick();
          }}
        >
          Procurar Arquivo
        </Button>
      </Paper>
      
      {selectedFile && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Arquivo selecionado:
          </Typography>
          <Typography>{selectedFile.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {(selectedFile.size / 1024).toFixed(2)} KB
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UploadFileStep;