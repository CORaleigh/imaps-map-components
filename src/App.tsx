import "@arcgis/map-components/components/arcgis-map";
import "./App.css";
import Shell from "./components/Shell";
import { MapProvider } from "./context/MapContext";
import AppAlert from "./components/AppAlert";

function App() {
  console.log("URL at App startup:", window.location.href);
  return (
    <MapProvider>
      <>
        <Shell></Shell>
        <AppAlert></AppAlert>
      </>
    </MapProvider>
  );
}

export default App;
