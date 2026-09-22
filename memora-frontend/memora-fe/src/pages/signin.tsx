import {Input} from "../components/ui/input";
import { Button } from "../components/ui/Button";
import { useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";


export function Signin(){
    const usernameRef=useRef<HTMLInputElement | null>(null); // using generics here to tell what kind of information usernameRef contains 
    const passwordRef=useRef<HTMLInputElement | null>(null);
    const navigate=useNavigate();

   async function  signin(){

        // we are using Ref , to get the username and password from the input Component

        const username=usernameRef.current?.value;
        const password=passwordRef.current?.value;
        const response=await axios.post(`${BACKEND_URL}/api/v1/auth/signin`,{
            username,
            password
                
        })
        // In signup we need to store the response to get back the token , and by doing response.data in axios we can get back the data
        const jwt=response.data.token;
        localStorage.setItem("token",jwt); // localStorage.setItem("key","value") is used to store data in the browser's local storage.

        // after user signin , we should redirect the user to dashboard page;

        navigate("/dashboard");

    }



    return <div className="h-screen w-screen bg-gray-200 flex justify-center items-center">
        <div className="bg-white rounded-md border min-w-48 p-4">
            <div className="flex justify-center text-2xl text-purple-800 -translate-y-2 ">
                SignIn
            </div>
            <div className="text-lg">
                <Input ref={usernameRef} placeholder="Username"/>
                <Input  ref={passwordRef} placeholder="Password"/>
            </div>

            <div className="flex justify-center pb-1 mt-2">
                <Button onClick={signin} loading={false} variant={"primary"} text="Signin" size="md" fullscreen={true}/>
            </div>



        </div>

    </div>
}