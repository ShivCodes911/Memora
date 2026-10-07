import { ShareIcon } from "../../icons/shareIcon";
import { Delete } from "../../icons/delete";
import { YoutubeIcon } from "../../icons/youtube";
import { TwitterIcon } from "../../icons/twitter";
import type { ContentType } from "../../types/content";

interface CardProps{
    _id:string;
    title:string;
    link:string;
    type:ContentType;
    onDelete:(id:string)=>void;

}

export const Card=(props:CardProps)=>{
    return <div>
<div className="bg-white rounded-md border-gray-200 border p-4 mt-2 mr-2 w-72 h-105 flex flex-col">
    <div className="flex justify-between shrink-0">
        <div className=" flex items-center text-md truncate">
        <div className=" text-gray-500 pr-4 translate-y-1">
            {props.type==="youtube" && <YoutubeIcon/>}
            {props.type==="twitter" && <TwitterIcon/>}
            {props.type!=="youtube" && props.type!=="twitter" && <ShareIcon size="md"/>}
        </div>
        <span className="truncate text-xl font-bold text-gray-700">{props.title}</span>
        </div>
        
        <div className="flex items-center text-gray-500">
            <div className="pr-2">
            <ShareIcon size="md" onClick={async ()=>{
                await navigator.clipboard.writeText(props.link);
                alert("Url Copied !");
            }}/>
            </div>
            <div>
            <Delete onClick={()=>props.onDelete(props._id)} size="md"/>
                {/* {props.onDelete(props._id)=> is taken as dashboard me  card componet  jo prop hey onDelete function  name ka usme prop: _id pass krdo in form of another function name handleDelete } */}
            </div>

        </div>


    </div>
    <div>
    <div className="pt-4 flex-1 overflow-hidden">
        {props.type==="youtube" && <iframe className="w-full h-64 rounded"
        src={props.link.replace("watch?v=", "embed/")}
        title="YouTube video player" 
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerPolicy="strict-origin-when-cross-origin" 
        allowFullScreen>



{/* // overflow-y-auto=> "If the content becomes taller than the container, automatically show a vertical scrollbar." */}
        </iframe> }

       {props.type==="twitter" && <div className="h-64 overflow-y-auto "> 
         <blockquote
         className="twitter-tweet">

        <a href={props.link.replace("x.com","twitter.com")}>
        </a>
        </blockquote>
        </div>}
        
        </div>
    </div>
</div>
</div>

}
