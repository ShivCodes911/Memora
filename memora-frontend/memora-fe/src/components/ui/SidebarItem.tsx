import type { ReactElement } from "react";

interface SidebarProps{
    text:string;
    icon:ReactElement;
}
export function SidebarItem(props: SidebarProps) {
  return (
    <div className="flex items-center text-gray-500 py-2 cursor-pointer hover:bg-gray-200 rounded max-w-48 transition-all duration-200">
  <div className="pr-2 translate-y-1.5 pl-4">
    {props.icon}
  </div>

  <div>
    {props.text}
  </div>
</div>
  )};