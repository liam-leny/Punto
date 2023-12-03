import { BrowserRouter, Route, Routes } from "react-router-dom";
import "primereact/resources/themes/vela-orange/theme.css";
import "./App.css";

import PlayerForm from "./PlayerForm";
import DataManagementTool from "./DataManagementTool";

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            {/*La route initiale est obligatoire et correspond au menu du site*/}
            <Route exact path="/" element={<PlayerForm />} />
            <Route exact path="/admin" element={<DataManagementTool />} />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
};

export default App;
