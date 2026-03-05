import { Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Menu from "./components/Menu";

import '@fontsource-variable/lexend';


const App = () => {
  return (
    <>
      <div className="min-h-screen max-h-screen flex flex-col">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          <Menu />

          <Outlet />
        </div>
      </div>

    </>
  );
};

export default App;
