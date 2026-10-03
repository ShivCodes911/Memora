import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import type { Content } from "../types/content";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Card } from "../components/ui/Card";

export  function SharedPage(){
    const {shareLink} = useParams();
    const [data,setData]=useState<{username:string,content:Content[]} | null>(null);

    useEffect( ()=>{
       axios.get(`${BACKEND_URL}/api/v1/content/${shareLink}`)
       .then((result)=>{setData(result.data)})
    },[shareLink]);

    if(!data){
        return <div>Loding...</div>
    }

    return (
    <div className="p-4 min-h-screen bg-gray-100">
      <h1 className="text-xl font-bold">{data.username}'s Brain</h1>
      <div className="flex gap-4 flex-wrap">
        {data.content.map(({_id,type,link,title})=>(
          <Card key={_id} _id={_id} type={type} link={link} title={title} onDelete={()=>{}} />
        ))}
      </div>
    </div>
  );
}

    
