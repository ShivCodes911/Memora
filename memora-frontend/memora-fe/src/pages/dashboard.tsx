
import { useState } from 'react'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Sidebar } from '../components/ui/Sidebar'
import { CreateContentModal } from '../components/ui/createContentModel'

import { PlusIcon } from '../icons/plusicon'
import { ShareIcon } from '../icons/shareIcon'
import { useContent } from '../hooks/useContent'
import axios from 'axios'
import { BACKEND_URL } from '../config'

export function Dashboard() {

  const [modalOpen,setModalOpen]=useState(false);// intially the modal box is not open 

  // using the custom made hook to fetch the card from backend
  const contents=useContent();

  
  return (
    <div>
      <Sidebar/>
    
    <div className=' p-4 ml-64 min-h-screen bg-gray-100 ' >
      <CreateContentModal type={"youtube"} open={modalOpen} onClose={()=>{
        setModalOpen(false)
      }}/>
      <div className="flex justify-end gap-4">
      <Button 
      
      onClick={async ()=>{
        const response=await axios.post(`${BACKEND_URL}/api/v1/content/share`,{
          share:true
        },{
          headers:{
            "Authorization":`Bearer ${localStorage.getItem("token")}`
          }
        })
        const shareUrl=`http://localhost:5173/content/share/${response.data.link}`;
        navigator.clipboard.writeText(shareUrl);
        alert("Url Copied !") 

      }}
      
      variant='secondary' text="Share Brain" size="sm" startIcon={<ShareIcon size={"md"}/>} />
      <Button  variant='primary' text="Add Content" size="md" onClick={()=>{setModalOpen(true)}} startIcon={<PlusIcon size={"md"}/>} />

    
    </div>
    
    
    <div className='flex gap-4 flex-wrap'> 
      {/* these are the hard codded Card , we need to fetch the cards from the backend */}
       {/* we can itrate through all the Card and then display them on the screen */}

       {contents.map(({type,link,title})=> <Card 
        type={type} 
        link={link} 
        title={title} 
      />
        
        )}

    </div>
    
    </div>
    </div>
  )
   
}


