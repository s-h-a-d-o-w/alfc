import { createRoot } from "react-dom/client";
import "@csstools/normalize.css";
import "./index.css";
import { AppWrapper } from "./AppWrapper";

const root = createRoot(document.getElementById("root")!);
root.render(
  // <React.StrictMode>
  <AppWrapper />,
  // </React.StrictMode>,
);
