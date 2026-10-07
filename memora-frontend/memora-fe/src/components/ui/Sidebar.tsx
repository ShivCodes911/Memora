import { TwitterIcon } from "../../icons/twitter";
import { YoutubeIcon } from "../../icons/youtube";
import { SidebarItem } from "./SidebarItem";
import { Logo } from "../../icons/logo";
import { ProfileMenu } from "./ProfileMenu";

export function Sidebar() {
    return (
        <div className="h-screen bg-white w-64 border-r border-gray-300 fixed left-0 top-0 pl-6 flex flex-col">
            <div className=" flex items-center text-2xl pt-8">
                <div className="pr-2 text-purple-600 ">
                    <a href="/dashboard"><Logo /></a>
                </div>
                Memora
            </div>
            <div className="pt-8 pl-4">

                    <SidebarItem icon={<TwitterIcon/>} text="Twitter"/>

                <SidebarItem icon={<YoutubeIcon/>} text="Youtube"/>
            </div>

            <div className="mt-auto pb-6 pr-6">
                <ProfileMenu/>
            </div>
        </div>
    );
}
