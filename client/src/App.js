import Layout from "./components/Layout";
import { Route, Routes } from "react-router-dom";
function App() {
  return (
    <div>
      <Routes>
        <Route index element={<Layout />} />
      </Routes>
    </div>
  );
}

export default App;
