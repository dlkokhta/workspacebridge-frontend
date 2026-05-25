import type { Message } from "../types";

export const formatTime = (iso: string): string => {
  const date = new Date(iso);
  const hours = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = date.getHours() >= 12 ? "PM" : "AM";
  return `${hours}:${minutes} ${period}`;
};

export const getSenderName = (msg: Message): string => {
  if (msg.sender.firstname || msg.sender.lastname) {
    return `${msg.sender.firstname ?? ""} ${msg.sender.lastname ?? ""}`.trim();
  }
  return msg.sender.email;
};

export const getSenderInitials = (msg: Message): string => {
  if (msg.sender.firstname && msg.sender.lastname) {
    return `${msg.sender.firstname[0]}${msg.sender.lastname[0]}`.toUpperCase();
  }
  if (msg.sender.firstname) return msg.sender.firstname[0].toUpperCase();
  return msg.sender.email[0].toUpperCase();
};
