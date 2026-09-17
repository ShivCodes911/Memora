
import './App.css'
import { Button } from './components/ui/Button'

import { PlusIcon } from './icons/plusicon'
import { ShareIcon } from './icons/shareIcon'

function App() {
  
  return (
    <div className='flex gap-4'>
    <Button variant='secondary' text="Share" size="sm"  startIcon={<ShareIcon size={"md"}/>} />
    <Button variant='primary' text="Add Content" size="md"  startIcon={<PlusIcon size={"md"}/>} />
    
    </div>
  )
   
}

export default App
