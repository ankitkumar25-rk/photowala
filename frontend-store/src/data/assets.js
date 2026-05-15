// Branding assets
import logo from "../assets/branding/logo.png";
import logoDark from "../assets/branding/logo-dark.png";
import favicon from "../assets/branding/favicon.png";

// Placeholders
import productPlaceholder from "../assets/placeholders/product-placeholder.jpg";
import categoryPlaceholder from "../assets/placeholders/category-placeholder.jpg";

// Example product imports
import goldenShieldExcellenceAwardPlaque from "../assets/products/trophies/golden-shield-excellence-award-plaque.jpg";
import geometricCrystalTowerAchievementAward from "../assets/products/trophies/geometric-crystal-tower-achievement-award.jpg";
import starPerformerBlueGlassTrophy from "../assets/products/trophies/star-performer-blue-glass-trophy.jpg";

// Services
import serviceCo2Laser from "../assets/service_co2_laser.png";
import serviceLaserMarking from "../assets/service_laser_marking.png";
import serviceCncRouter from "../assets/service_cnc_router.png";
import serviceCustomPrinting from "../assets/service_custom_printing.png";
import serviceIndustrial from "../assets/service_industrial.png";
import serviceDrawing from "../assets/service_drawing.png";
import serviceMachine from "../assets/service_machine.png";
import serviceMaterial from "../assets/service_material.png";
import servicePenPreview from "../assets/service_pen_preview.png";
import garmentTagDie1 from "../assets/images/services/garment_tag_1.png";
import garmentTagGloss from "../assets/images/services/garment_tag_gloss.png";
import garmentTagDie2 from "../assets/images/services/garment_tag_2.png";
import garmentTagDie3 from "../assets/images/services/garment_tag_3.png";
import letterhead1 from "../assets/images/services/letterhead_1.png";
import letterhead2 from "../assets/images/services/letterhead_2.png";
import threadPremium from "../assets/images/services/thread_premium.png";
import threadStandard from "../assets/images/services/thread_standard.png";
import penSample1 from "../assets/images/services/pen_sample_1.jpg";
import penSample2 from "../assets/images/services/pen_sample_2.jpg";


// Brand exports
export const brandAssets = {
  logo,
  logoDark,
  favicon,
};

// Category registry (exact labels + storage keys)
export const categoryRegistry = [
  { key: "TROPHIES", label: "TROPHIES" },
  { key: "3D_MODELS", label: "3D_MODELS" },
  { key: "CORPORATE_GIFTS", label: "CORPORATE_GIFTS" },
  { key: "MOMENTOS", label: "MOMENTOS" },
  { key: "OTHERS", label: "OTHERS" },
  { key: "PEN_HOLDERS", label: "PEN HOLDERS" },
  { key: "TEMPLES", label: "TEMPLES" },
];

// Optional category thumbnails/banners
export const categoryImages = {
  TROPHIES: categoryPlaceholder,
  "3D_MODELS": categoryPlaceholder,
  CORPORATE_GIFTS: categoryPlaceholder,
  MOMENTOS: categoryPlaceholder,
  OTHERS: categoryPlaceholder,
  PEN_HOLDERS: categoryPlaceholder,
  TEMPLES: categoryPlaceholder,
};

// Product image mapping by slug
export const productImagesBySlug = {
  "golden-shield-excellence-award-plaque": goldenShieldExcellenceAwardPlaque,
  "geometric-crystal-tower-achievement-award": geometricCrystalTowerAchievementAward,
  "star-performer-blue-glass-trophy": starPerformerBlueGlassTrophy,
};

export const getProductImage = (slug) => productImagesBySlug[slug] || productPlaceholder;

export const serviceAssets = {
  co2Laser: serviceCo2Laser,
  laserMarking: serviceLaserMarking,
  cncRouter: serviceCncRouter,
  customPrinting: serviceCustomPrinting,
  industrial: serviceIndustrial,
  drawing: serviceDrawing,
  machine: serviceMachine,
  material: serviceMaterial,
  penPreview: servicePenPreview,
  garmentTagDie1,
  garmentTagGloss,
  garmentTagDie2,
  garmentTagDie3,
  letterhead1,
  letterhead2,
  threadPremium,
  threadStandard,
  penSample1,
  penSample2,
};

