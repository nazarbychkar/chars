import GridIconSvg from "./grid.svg";
import GroupIconSvg from "./group.svg";
import BoxIconLineSvg from "./box-line.svg";
import DollarLineIconSvg from "./dollar-line.svg";
import ChevronDownIconSvg from "./chevron-down.svg";
import ListIconSvg from "./list.svg";
import TableIconSvg from "./table.svg";
import HorizontaLDotsSvg from "./horizontal-dots.svg";
import MoreDotIconSvg from "./more-dot.svg";
import Image from "next/image";

function createIconComponent(src: string, alt: string) {
  return function Icon(props: {
    width?: number;
    height?: number;
    className?: string;
  }) {
    const { width = 24, height = 24, className } = props;
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  };
}

export const GridIcon = createIconComponent(GridIconSvg, "Grid Icon");
export const GroupIcon = createIconComponent(GroupIconSvg, "Group Icon");
export const BoxIconLine = createIconComponent(BoxIconLineSvg, "Box Line Icon");
export const DollarLineIcon = createIconComponent(
  DollarLineIconSvg,
  "Dollar Line Icon"
);
export const ChevronDownIcon = createIconComponent(
  ChevronDownIconSvg,
  "Chevron Down Icon"
);
export const ListIcon = createIconComponent(ListIconSvg, "List Icon");
export const TableIcon = createIconComponent(TableIconSvg, "Table Icon");
export const HorizontaLDots = createIconComponent(
  HorizontaLDotsSvg,
  "Horizontal Dots Icon"
);
export const MoreDotIcon = createIconComponent(MoreDotIconSvg, "More Dot Icon");
