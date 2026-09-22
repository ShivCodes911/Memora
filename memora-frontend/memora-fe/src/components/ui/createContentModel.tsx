import { useRef, useState } from "react";
import { CrossIcon } from "../../icons/crossIcon";
import { Button } from "./Button";
import {Input} from "./input"
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config";



type ContentType ="youtube"| "twitter" // making type stick to this all because anyone cannot write any type of Types here 


interface ContentModalProps{
    open:boolean;
    onClose:()=>void;
    type:ContentType 

}



export function CreateContentModal(props:ContentModalProps){

    const titleRef=useRef<HTMLInputElement | null>(null);
    const linkRef=useRef<HTMLInputElement | null>(null);
    const [type,setType]=useState<ContentType>(props.type);// now setType will only accept either youtube or twitter 

    


    async function addContent(){

        const title=titleRef.current?.value;
        const link=linkRef.current?.value;

        // after clicking on submit 

        await axios.post(`${BACKEND_URL}/api/v1/content`,{
            link,
            type,
            title
        },{
            headers:{
                "Authorization":`Bearer ${localStorage.getItem("token")}`
            }
        })
        
    
    }


    
        // making the Ui on top of the existing UI , when modal appears(Modal ui)
    return (
    <div>
        {/* apprear thsi div only when the open is true */}
       {props.open && <div className="w-screen h-screen bg-gray-50 fixed top-0 left-0  flex justify-center"  >
        <div className="flex flex-col justify-center ">
            
            
        <span className="bg-white opacity-100 p-4 rounded-md border ">
             <h1 className="flex justify-center ">Add Content</h1>
            
            
            
           <div className="flex justify-end -translate-y-8 translate-x-3 ">
           
            
            <div className="cursor-pointer" onClick={props.onClose}>
            <CrossIcon/>
            </div>
        </div>
    <div>   
                <Input ref={titleRef} placeholder="Title"/>
                <Input ref={linkRef} placeholder="Link"/>
            </div>
            <div>
                <h1 className="flex justify-center pb-2 ">Types</h1>
                <div className="flex justify-around pb-3">
                <Button text="Youtube" variant={type==="youtube"?"primary" :"secondary"} onClick={()=>{setType("youtube")} } size="sm"/>
                <Button text="Twitter" variant={type==="twitter"?"primary" :"secondary"} onClick={()=>{setType("twitter")} } size="sm"/>
            </div>
            </div>

            <div className="flex justify-center">
                <Button onClick={addContent} variant="primary" text={"Summit"} size={'sm'} />
            </div>
            




        </span>
        </div>
        
    </div>}
       
    </div>)


}

