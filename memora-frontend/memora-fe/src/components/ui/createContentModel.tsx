import { CrossIcon } from "../../icons/crossIcon";
import { Button } from "./Button";
import {Input} from "./input"

interface ContentModalProps{
    open:boolean;
    onClose:()=>void;

}

export function CreateContentModal(props:ContentModalProps){
    
        // making the Ui on top of the existing UI , when modal appears
    return (
    <div>
        {/* apprear thsi div only when the open is true */}
       {props.open && <div className="w-screen h-screen bg-slate-500 fixed top-0 left-0 opacity-60 flex justify-center"  >
        <div className="flex flex-col justify-center ">
            
        <span className="bg-white opacity-100 p-4 rounded-md ">
           <div className="flex justify-end">
            <div className="cursor-pointer" onClick={props.onClose}>
            <CrossIcon/>
            </div>
        </div>
    <div>   
                <Input placeholder="Title"/>
                <Input placeholder="Link"/>
            </div>

            <div className="flex justify-center">
                <Button variant="primary" text={"Summit"} size={'sm'} />
            </div>
            




        </span>
        </div>
        
    </div>}
       
    </div>)


}

