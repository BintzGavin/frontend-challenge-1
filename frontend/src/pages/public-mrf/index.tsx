import { Container, Title, Card, Text, Group, Button, Modal } from "@mantine/core";
import { IconDownload, IconEye } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { api } from "~/services/api";

interface MrfFile {
  id: number;
  name: string;
  createdAt: string;
  size: string;
  claims: any[];
}

export default function PublicMrfPage() {
  const [mrfFiles, setMrfFiles] = useState<MrfFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MrfFile | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    loadMrfFiles();
  }, []);

  const loadMrfFiles = async () => {
    try {
      const files = await api.getMrfFiles();
      setMrfFiles(files);
    } catch (error) {
      console.error('Failed to load MRF files:', error);
    }
  };

  const handleView = async (file: MrfFile) => {
    try {
      const mrfData = await api.getMrfFile(file.id);
      setSelectedFile(mrfData);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Failed to load MRF file:', error);
    }
  };

  const handleDownload = (file: MrfFile) => {
    const dataStr = JSON.stringify(file.claims, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="lg">Public MRF Files</Title>
      
      <div className="grid gap-4">
        {mrfFiles.map((file) => (
          <Card key={file.id} withBorder>
            <Group justify="space-between" align="center">
              <div>
                <Text fw={500}>{file.name}</Text>
                <Text size="sm" c="dimmed">Created: {file.createdAt}</Text>
                <Text size="sm" c="dimmed">Size: {file.size}</Text>
              </div>
              
              <Group>
                <Button 
                  variant="light" 
                  leftSection={<IconEye size={16} />}
                  onClick={() => handleView(file)}
                >
                  View
                </Button>
                <Button
                  variant="light"
                  leftSection={<IconDownload size={16} />}
                  onClick={() => handleDownload(file)}
                >
                  Download
                </Button>
              </Group>
            </Group>
          </Card>
        ))}
      </div>

      <Modal
        opened={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedFile?.name}
        size="xl"
      >
        <pre className="whitespace-pre-wrap overflow-auto max-h-[600px]">
          {selectedFile ? JSON.stringify(selectedFile.claims, null, 2) : ''}
        </pre>
      </Modal>
    </Container>
  );
} 