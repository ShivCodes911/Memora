
import './App.css'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'

import { PlusIcon } from './icons/plusicon'
import { ShareIcon } from './icons/shareIcon'

function App() {
  
  return (
    <div className='p-4'>
      <div className="flex justify-end gap-4">
      <Button variant='secondary' text="Share Brain" size="sm"  startIcon={<ShareIcon size={"md"}/>} />
      <Button variant='primary' text="Add Content" size="md"  startIcon={<PlusIcon size={"md"}/>} />

    
    </div>
    
    <div className='flex gap-4'>
    <Card type={"youtube"} link={"https://www.youtube.com/?v=c6cvmWN3h5s"} title={"First YT"} />
    <Card type={"twitter"} link={"https://x.com/surajtwt_/status/2100826451985793381"} title={"suraj OP"} />
    </div>
    
    </div>
  )
   
}

export default App
