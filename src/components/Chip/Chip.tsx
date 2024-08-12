import { ReactNode } from "react";

type Props = {
  onClick: () => void;
  isSelected?: boolean;
  children: ReactNode;
  className?: string;
}

const Chip = ({ onClick, isSelected, children, className }: Props) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-full py-2 px-4 border transition hover:border-primary-500 ${isSelected ? "bg-primary-500 text-white" : ""} ${className}`}
    >
      {children}
    </div>
  )
}

export default Chip
