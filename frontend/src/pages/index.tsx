import { Container, Title, Button, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <Container size="sm" className="py-8">
      <Title order={2} mb="xl" className="text-center">Machine Readable Files Portal</Title>
      <Stack>
        <Button onClick={() => navigate("/upload")}>
          Upload Claims File
        </Button>
        <Button onClick={() => navigate("/approval")}>
          Review & Approve Claims
        </Button>
        <Button onClick={() => navigate("/public-mrf")}>
          View Public MRF Files
        </Button>
      </Stack>
    </Container>
  );
}
