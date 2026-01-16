interface UserAvatarProps {
  name?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const UserAvatar = ({
  name,
  imageUrl,
  size = "md",
  className = "",
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (imageUrl) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-pri ${className}`}
      >
        <img
          src={imageUrl}
          alt={name || "User avatar"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-pri/20 border-2 border-pri flex items-center justify-center font-bold text-primary ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default UserAvatar;
