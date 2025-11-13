import "@arcgis/map-components/components/arcgis-map";
import "./App.css";
import Shell from "./components/Shell/Shell";
import { MapProvider } from "./context/MapContext";

function App() {
  return (
    <MapProvider>
      <>
        <Shell></Shell>
      </>
    </MapProvider>
  );
}

export default App;
