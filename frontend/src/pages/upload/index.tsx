import { Container, Title } from "@mantine/core";
import { FileUpload } from "~/components/FileUpload";

export default function UploadPage() {
  return (
    <Container size="md" py="xl">
      <Title order={2} mb="lg">Upload Claims File</Title>
      <FileUpload />
    </Container>
  );
} 