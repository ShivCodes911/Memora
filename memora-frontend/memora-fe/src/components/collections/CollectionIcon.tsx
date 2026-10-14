import React from "react";

export const DEFAULT_COLLECTION_ICON =
  "https://img.icons8.com/stickers/100/opened-folder.png";

export const PRESET_COLLECTION_ICONS: string[] = [
  "https://img.icons8.com/stickers/100/opened-folder.png",
  "https://img.icons8.com/stickers/100/artificial-intelligence.png",
  "https://img.icons8.com/stickers/100/brain.png",
  "https://img.icons8.com/stickers/100/books-1.png",
  "https://img.icons8.com/stickers/100/education.png",
  "https://img.icons8.com/stickers/100/classroom.png",
  "https://img.icons8.com/stickers/100/document.png",
  "https://img.icons8.com/stickers/100/project-management.png",
  "https://img.icons8.com/stickers/100/create-new.png",
  "https://img.icons8.com/stickers/100/search.png",
  "https://img.icons8.com/stickers/100/star--v1.png",
  "https://img.icons8.com/stickers/100/favorites.png",
  "https://img.icons8.com/stickers/100/strength.png",
  "https://img.icons8.com/stickers/100/youtube-play.png",
  "https://img.icons8.com/stickers/100/github.png",
  "https://img.icons8.com/stickers/100/conference-call.png",
  "https://img.icons8.com/stickers/100/user.png",
  "https://img.icons8.com/stickers/100/question-mark.png",
];

interface CollectionIconProps {
  icon?: string | null;
  className?: string;
  alt?: string;
}

export const CollectionIcon: React.FC<CollectionIconProps> = ({
  icon,
  className = "w-5 h-5",
  alt = "Collection icon",
}) => {
  const resolved = icon || DEFAULT_COLLECTION_ICON;

  const isUrl =
    resolved.startsWith("http://") ||
    resolved.startsWith("https://") ||
    resolved.startsWith("data:") ||
    resolved.startsWith("/");

  if (isUrl) {
    return (
      <img
        src={resolved}
        alt={alt}
        className={`object-contain inline-block shrink-0 ${className}`}
        loading="lazy"
      />
    );
  }

  // Handle legacy default emoji
  if (resolved === "📁") {
    return (
      <img
        src={DEFAULT_COLLECTION_ICON}
        alt={alt}
        className={`object-contain inline-block shrink-0 ${className}`}
        loading="lazy"
      />
    );
  }

  // Legacy or custom emoji
  return (
    <span className={`inline-flex items-center justify-center shrink-0 leading-none ${className}`}>
      {resolved}
    </span>
  );
};
