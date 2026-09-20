
import { useState } from 'react'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Sidebar } from '../components/ui/Sidebar'
import { CreateContentModal } from '../components/ui/createContentModel'

import { PlusIcon } from '../icons/plusicon'
import { ShareIcon } from '../icons/shareIcon'

export function Dashboard() {

  const [modalOpen,setModalOpen]=useState(false);// intially the modal box is not open 

  
  return (
    <div>
      <Sidebar/>
    
    <div className=' p-4 ml-64 min-h-screen bg-gray-100 ' >
      <CreateContentModal open={modalOpen} onClose={()=>{
        setModalOpen(false)
      }}/>
      <div className="flex justify-end gap-4">
      <Button  variant='secondary' text="Share Brain" size="sm" startIcon={<ShareIcon size={"md"}/>} />
      <Button  variant='primary' text="Add Content" size="md" onClick={()=>{setModalOpen(true)}} startIcon={<PlusIcon size={"md"}/>} />

    
    </div>
    
    
    <div className='flex gap-4'>
    <Card type={"youtube"} link={"https://www.youtube.com/?v=c6cvmWN3h5s"} title={"First YT"} />
    <Card type={"twitter"} link={"https://x.com/surajtwt_/status/2100826451985793381"} title={"suraj OP"} />
    </div>
    
    </div>
    </div>
  )
   
}


