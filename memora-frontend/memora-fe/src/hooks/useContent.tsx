import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

export   function useContent(){ 
    const [contents,setContents]=useState([]);

    // making the refresh function so that , the content gets dispalyed on the screen 

    function refresh(){
    
        axios.get(`${BACKEND_URL}/api/v1/content/`,{
            headers:{
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
         })
        .then((response)=>{
            setContents(response.data.content)
        })
    

    }



    useEffect( ()=>{
        // we cannot have the async useEffect so , we have to use .then() and .catch() synctax
        refresh();

        let interval=setInterval(()=>{
            refresh();

        },2*1000)


        // doing cleanup here for the intervals
        // now every 10 sec it will refresh things from backend

        return ()=>{
            clearInterval(interval);
        }

        },[]);

         

    return contents;

}