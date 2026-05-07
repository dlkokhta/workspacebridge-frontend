import { File, Folder, Image } from "lucide-react";

interface FileIconProps {
  kind: string;
  color: string;
  size?: number;
}

export const FileIcon = ({ kind, color, size = 16 }: FileIconProps) => {
  if (kind === "Folder") return <Folder size={size} style={{ color }} />;
  if (kind === "Image") return <Image size={size} style={{ color }} />;
  return <File size={size} style={{ color }} />;
};
