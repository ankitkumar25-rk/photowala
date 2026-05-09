import { PenTool } from 'lucide-react';
import MachineServiceWrapper from '../../../components/services/MachineServiceWrapper';

const MATERIAL_TYPES = ['Solid Wood', 'Plywood / MDF', 'Acrylic Sheets', 'Aluminum Composite (ACP)', 'PVC / Foam Board', 'Solid Surface (Corian)'];

export default function CNCRouterService() {
  return (
    <MachineServiceWrapper 
      serviceType="CNC_ROUTER"
      title="CNC Router Service"
      description="Precision 3D carving and large-format profile cutting for furniture, signage, and complex architectural components."
      icon={PenTool}
      materials={MATERIAL_TYPES}
      thicknesses={[]} // thicknesses not explicitly listed in original code as a separate dropdown
    />
  );
}
