import React from "react";

interface ButtonProps {
  text: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "danger";
  onClick?: () => void;
}

const sizeClasses = {
  xs: "px-2 py-1 text-xs",
  sm: "px-2 py-1 text-sm",
  md: "px-2.5 py-1.5 text-sm",
  lg: "px-3 py-2 text-sm",
  xl: "px-3.5 py-2.5 text-sm",
};

const colorClasses = {
  primary: "bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600",
  secondary: "bg-gray-600 hover:bg-gray-500 focus-visible:outline-gray-600",
  danger: "bg-red-600 hover:bg-red-500 focus-visible:outline-red-600",
};

const Button: React.FC<ButtonProps> = ({
  text,
  size = "md",
  color = "primary",
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`m-1 rounded-md font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${sizeClasses[size]} ${colorClasses[color]}`}
    >
      {text}
    </button>
  );
};

export default Button;
