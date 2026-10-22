import {
  Droplets,
  Hammer,
  RefreshCw,
  Sparkles,
  Wind,
  Zap,
} from 'lucide-react';

const CATEGORY_ICONS = {
  electrical: Zap,
  plumbing: Droplets,
  carpentry: Hammer,
  cleaning: Sparkles,
  'appliance repair': RefreshCw,
  appliance: RefreshCw,
  'ac & hvac': Wind,
  hvac: Wind,
};

export function getJobCategoryIcon(category) {
  return CATEGORY_ICONS[String(category || '').trim().toLocaleLowerCase()] || Hammer;
}
