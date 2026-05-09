import { Scissors } from 'lucide-react';
import MachineServiceWrapper from '../../../components/services/MachineServiceWrapper';

const MATERIAL_TYPES = ['Wood', 'Acrylic', 'Leather', 'MDF', 'Fabric', 'Paper/Cardboard'];
const THICKNESS_OPTIONS = ['1mm', '2mm', '3mm', '4mm', '5mm', '6mm', '8mm', '10mm'];

export default function CO2LaserService() {
  return (
    <MachineServiceWrapper 
      serviceType="CO2_LASER"
      title="CO2 Laser Machine Service"
      description="Precision cutting and engraving for organic materials. Our high-power industrial laser ensures microscopic detail and clean edges."
      icon={Scissors}
      materials={MATERIAL_TYPES}
      thicknesses={THICKNESS_OPTIONS}
    />
  );
}
