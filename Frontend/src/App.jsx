import "./App.css";
import AppRoutes from "./AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="app">
      <AppRoutes />
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App;