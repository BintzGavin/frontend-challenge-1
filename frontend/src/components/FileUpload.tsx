import { FileInput, Text, Stack, Button, Group, Alert } from "@mantine/core";
import { IconUpload, IconFile, IconX, IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import { parseAndValidateCsv } from "~/services/csvService";
import type { Claim } from "~/utils/schemas";
import { appStore } from "~/stores/AppStore";
import { useNavigate } from "react-router-dom";

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<{ total: number; valid: number }>({ total: 0, valid: 0 });
  const navigate = useNavigate();

  const handleFileChange = (selectedFile: File | null) => {
    setError(null);
    setValidationErrors([]);
    setClaims([]);
    setStats({ total: 0, valid: 0 });
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setValidationErrors([]);
    setClaims([]);

    try {
      const { data, errors, totalRows } = await parseAndValidateCsv(file);
      
      if (errors.length > 0) {
        setValidationErrors(errors);
      }

      setClaims(data);
      setStats({
        total: totalRows,
        valid: data.length
      });

      appStore.setClaims(data);
      
      if (data.length > 0) {
        setTimeout(() => {
          navigate("/approval");
        }, 1500);
      }
      
    } catch (err) {
      setError('Failed to process the file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Stack>
      <FileInput
        label="Upload Claims CSV File"
        placeholder="Click to select file"
        accept=".csv"
        value={file}
        onChange={handleFileChange}
        error={error}
        leftSection={<IconFile size={16} />}
        clearable
        disabled={isProcessing}
      />
      
      {file && (
        <Group justify="flex-end">
          <Button
            leftSection={<IconUpload size={16} />}
            onClick={handleUpload}
            loading={isProcessing}
          >
            Process File
          </Button>
        </Group>
      )}

      {error && (
        <Text c="red" size="sm">
          <IconX size={16} style={{ display: 'inline', marginRight: '4px' }} />
          {error}
        </Text>
      )}

      {validationErrors.length > 0 && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Validation Errors">
          <Stack gap="xs">
            {validationErrors.map((err, index) => (
              <Text size="sm" key={index}>{err}</Text>
            ))}
          </Stack>
        </Alert>
      )}

      {claims.length > 0 && (
        <Alert color="green" title="Processing Results">
          <Stack gap="xs">
            <Text size="sm">Total rows: {stats.total}</Text>
            <Text size="sm">Valid claims: {stats.valid}</Text>
            {stats.total !== stats.valid && (
              <Text size="sm" c="red">
                Failed validation: {stats.total - stats.valid}
              </Text>
            )}
          </Stack>
        </Alert>
      )}
    </Stack>
  );
} 