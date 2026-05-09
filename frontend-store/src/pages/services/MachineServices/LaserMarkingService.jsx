import { Zap } from 'lucide-react';
import MachineServiceWrapper from '../../../components/services/MachineServiceWrapper';

const MATERIAL_TYPES = ['Stainless Steel', 'Aluminum', 'Brass/Copper', 'Titanium', 'Anodized Metal', 'Industrial Plastics'];

export default function LaserMarkingService() {
  return (
    <MachineServiceWrapper 
      serviceType="LASER_MARKING"
      title="Laser Marking Service"
      description="High-speed fiber laser marking for industrial branding, serial numbers, and permanent identification on metals and plastics."
      icon={Zap}
      materials={MATERIAL_TYPES}
      thicknesses={[]} // Fiber laser usually marks surface, thickness selection often not needed for flat marking
    />
  );
}
