import { createRoot } from "react-dom/client";
import { Simulation } from "./simulation.jsx";


const root = createRoot(document.getElementById('root'))
root.render(
    <Simulation/>
)