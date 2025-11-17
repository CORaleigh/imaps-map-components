import "@arcgis/map-components/components/arcgis-map";
import "./App.css";
import Shell from "./components/Shell";
import { MapProvider } from "./context/MapContext";

function App() {
  console.log("URL at App startup:", window.location.href);
  return (
    <MapProvider>
      <>
        <Shell></Shell>
      </>
    </MapProvider>
  );
}

export default App;
