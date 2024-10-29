import { AppShell, Button, Group } from "@mantine/core";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { IconHome, IconUpload, IconClipboardCheck, IconFiles } from "@tabler/icons-react";

export default function BasicLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Group gap="xs">
            <Button 
              variant={location.pathname === "/" ? "filled" : "light"}
              leftSection={<IconHome size={16} />}
              onClick={() => navigate("/")}
            >
              Home
            </Button>
            <Button
              variant={location.pathname === "/upload" ? "filled" : "light"}
              leftSection={<IconUpload size={16} />}
              onClick={() => navigate("/upload")}
            >
              Upload
            </Button>
            <Button
              variant={location.pathname === "/approval" ? "filled" : "light"}
              leftSection={<IconClipboardCheck size={16} />}
              onClick={() => navigate("/approval")}
            >
              Approval
            </Button>
            <Button
              variant={location.pathname === "/public-mrf" ? "filled" : "light"}
              leftSection={<IconFiles size={16} />}
              onClick={() => navigate("/public-mrf")}
            >
              MRF Files
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
