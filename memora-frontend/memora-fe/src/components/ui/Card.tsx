import { ShareIcon } from "../../icons/shareIcon";

interface CardProps{
    title:string;
    link:string;
    type:"twitter"|"youtube";

}

export const Card=(props:CardProps)=>{
    return <div>
    <div className="bg-white rounded-md 
         border-gray-200 border p-4 max-w-72 mt-2 mr-2 min-h-48 min-w-72 ">
        <div className="flex justify-between">
            <div className=" flex items-center text-md">
            <div className=" text-gray-500 pr-4">

                <ShareIcon size="md"/>
            </div>
            {props.title} 
            </div>
            
            <div className="flex items-center text-gray-500">
                <div className="pr-2">
                    <a href={props.link} target="_blank"/>
                <ShareIcon size="md"/>
                </div>
                <div>
                <ShareIcon size="md"/>
                </div>

            </div>


         </div>
         <div>
    <div className="pt-4  ">
        {props.type==="youtube" && <iframe className="w-full"// w-100 not to use , use instead w-full 
        src={props.link.replace("watch?v=", "embed/")}
        title="YouTube video player" 
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerPolicy="strict-origin-when-cross-origin" 
        allowFullScreen>

        </iframe> }

       {props.type==="twitter" &&<blockquote
         className="twitter-tweet">

        <a href={props.link.replace("x.com","twitter.com")}>
        </a>
        </blockquote>}


    </div>
    </div>
</div>
</div>

}