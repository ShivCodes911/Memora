import { TwitterIcon } from "../../icons/twitter";
import { YoutubeIcon } from "../../icons/youtube";
import { SidebarItem } from "./SidebarItem";
import { Logo } from "../../icons/logo";

export function Sidebar() {
    return (
        <div className="h-screen bg-white w-64 border-r border-gray-300 fixed left-0 top-0 pl-6">
            <div className=" flex items-center text-2xl pt-8">
                <div className="pr-2 text-purple-600 ">
                    <Logo />
                </div>
                Memora
            </div>
            <div className="pt-8 pl-4">
                 
                    <SidebarItem icon={<TwitterIcon/>} text="Twitter"/>
                
                <SidebarItem icon={<YoutubeIcon/>} text="Youtube"/>
            </div>
        </div>
    );
}