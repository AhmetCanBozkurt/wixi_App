import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as LuIcons from 'react-icons/lu';
import * as MdIcons from 'react-icons/md';

interface DynamicIconProps {
  name?: string;
  color?: string;
  className?: string;
}

/**
 * Renders a react-icon dynamically by its name.
 * Supports FontAwesome (Fa), Lucide (Lu), and Material Design (Md).
 */
export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, color, className }) => {
  if (!name) return null;

  // Try to find the icon in supported libraries
  const IconComponent = 
    (FaIcons as any)[name] || 
    (LuIcons as any)[name] || 
    (MdIcons as any)[name];

  if (!IconComponent) {
    // Fallback icon if not found
    return <FaIcons.FaQuestionCircle style={{ color }} className={className} />;
  }

  return <IconComponent style={{ color }} className={className} />;
};
