import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserIcon } from "../../icons/userIcon";
import { CrossIcon } from "../../icons/crossIcon";
import { BACKEND_URL } from "../../config";

interface User{
    _id:string;
    username:string;
}

export function ProfileMenu(){
    const [user,setUser]=useState<User | null>(null);
    const [menuOpen,setMenuOpen]=useState(false);      // dropdown open/close
    const [profileOpen,setProfileOpen]=useState(false); // profile details box
    const menuRef=useRef<HTMLDivElement | null>(null);
    const navigate=useNavigate();

    // fetch the logged in user once
    useEffect(()=>{
        axios.get(`${BACKEND_URL}/api/v1/auth/me`,{
            headers:{
                Authorization:`Bearer ${localStorage.getItem("token")}`
            }
        })
        .then((response)=>{
            setUser(response.data.user)
        })
        .catch(()=>{
            // token missing/invalid -> treat as logged out
            logout();
        })
    },[]);

    // close the dropdown when clicking anywhere outside it
    useEffect(()=>{
        function handleClickOutside(e:MouseEvent){
            if(menuRef.current && !menuRef.current.contains(e.target as Node)){
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown",handleClickOutside);
        return ()=>{
            document.removeEventListener("mousedown",handleClickOutside);
        }
    },[]);

    function logout(){
        localStorage.removeItem("token");
        navigate("/signin");
    }

    return (
        <div ref={menuRef} className="relative">

            {/* dropdown menu, opens upward because we sit at the bottom of the sidebar */}
            {menuOpen && <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-300 rounded-md shadow-md py-1">
                <div
                    onClick={()=>{ setProfileOpen(true); setMenuOpen(false); }}
                    className="px-4 py-2 text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                    Profile
                </div>
                <div
                    onClick={logout}
                    className="px-4 py-2 text-red-500 cursor-pointer hover:bg-gray-100"
                >
                    Logout
                </div>
            </div>}

            {/* the always-visible part: icon + username */}
            <div
                onClick={()=>{ setMenuOpen(!menuOpen) }}
                className="flex items-center gap-2 cursor-pointer rounded py-2 px-2 hover:bg-gray-200 transition-all duration-200"
            >
                <div className="bg-purple-100 text-purple-600 rounded-full p-1">
                    <UserIcon/>
                </div>
                <div className="text-gray-700">
                    {user?.username}
                </div>
            </div>

            {/* profile details box */}
            {profileOpen && <div className="w-screen h-screen bg-black/30 fixed top-0 left-0 flex justify-center items-center z-10">
                <div className="bg-white p-4 rounded-md border min-w-72">
                    <div className="flex justify-between items-center pb-4">
                        <h1 className="text-lg">Profile</h1>
                        <div className="cursor-pointer" onClick={()=>{ setProfileOpen(false) }}>
                            <CrossIcon/>
                        </div>
                    </div>

                    <div className="flex justify-center pb-4">
                        <div className="bg-purple-100 text-purple-600 rounded-full p-3">
                            <UserIcon/>
                        </div>
                    </div>

                    <div className="pb-2">
                        <div className="text-sm text-gray-500">Username</div>
                        <div className="text-gray-800">{user?.username}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">User ID</div>
                        <div className="text-gray-800 text-sm">{user?._id}</div>
                    </div>
                </div>
            </div>}
        </div>
    )
}
