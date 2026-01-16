interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent | React.FormEvent) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit";
}

const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  type = "button",
}: PrimaryButtonProps) => {
  const baseClasses =
    "w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 active:scale-[0.98]";

  const variantClasses = {
    primary: disabled
      ? "bg-muted text-muted-foreground cursor-not-allowed"
      : "bg-pri text-white hover:bg-pri/90",
    secondary: "bg-muted text-muted-foreground hover:bg-muted/80",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
