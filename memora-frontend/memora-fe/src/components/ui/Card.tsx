import { ShareIcon } from "../../icons/shareIcon";
import { Delete } from "../../icons/delete";

interface CardProps{
    title:string;
    link:string;
    type:"twitter"|"youtube";

}

export const Card=(props:CardProps)=>{
    return <div>
<div className="bg-white rounded-md border-gray-200 border p-4 mt-2 mr-2 w-72 h-105 flex flex-col">
    <div className="flex justify-between shrink-0">
        <div className=" flex items-center text-md truncate">
        <div className=" text-gray-500 pr-4">

            <ShareIcon size="md"/>
        </div>
        <span className="truncate">{props.title}</span>
        </div>
        
        <div className="flex items-center text-gray-500">
            <div className="pr-2">
                <a href={props.link} target="_blank"/>
            <ShareIcon size="md"/>
            </div>
            <div>
            <Delete size="md"/>
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
