import {Input} from "../components/ui/input";
import { Button } from "../components/ui/Button";
import { useRef } from "react";
import axios from "axios";

import { BACKEND_URL } from "../config"; // import backend url from another file so that we do not have to write it again and again
import { useNavigate } from "react-router-dom";


export function Signup(){
    const usernameRef=useRef<HTMLInputElement | null>(null); // using generics here to tell what kind of information usernameRef 
    const passwordRef=useRef<HTMLInputElement | null>(null);
    const navigate=useNavigate();

   async function  signup(){

        // we are using Ref , to get the username and password from the input Component

        const username=usernameRef.current?.value;
        const password=passwordRef.current?.value;
        await axios.post(`${BACKEND_URL}/api/v1/auth/signup`,{
            username,
            password
                
        });
        navigate("/signin");
        alert("You have signed up!!!")
    }


    return <div className="h-screen w-screen bg-gray-200 flex justify-center items-center">
        <div className="bg-white rounded-md border min-w-48 p-4">
            <div className="flex justify-center text-2xl text-purple-800 -translate-y-2 ">
                SignUp
            </div>
            <div className="text-lg">
                <Input ref={usernameRef} placeholder="Username"/>
                <Input ref={passwordRef} placeholder="Password"/>
            </div>

            <div className="flex justify-center pb-1 mt-2">
                <Button onClick={signup} loading={false} variant={"primary"} text="Signup " size="md" fullscreen={true}/>
            </div>



        </div>

    </div>
}