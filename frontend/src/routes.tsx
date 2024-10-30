import { createBrowserRouter } from "react-router-dom";
import BasicLayout from "./layout/BasicLayout";
import NotFoundPage from "./pages/error/NotFound";
import MainPage from "./pages/index";
import UploadPage from "./pages/upload";
import ApprovalPage from "./pages/approval";
import PublicMrfPage from "./pages/public-mrf";

const router = createBrowserRouter([
  {
    element: <BasicLayout />,
    children: [
      {
        path: "/",
        element: <MainPage />,
      },
      {
        path: "/upload",
        element: <UploadPage />,
      },
      {
        path: "/approval",
        element: <ApprovalPage />,
      },
      {
        path: "/public-mrf",
        element: <PublicMrfPage />,
      }
    ],
    errorElement: <NotFoundPage />,
  },
]);

export default router;
