import {Input} from "../components/ui/input";
import { Button } from "../components/ui/Button";

export function Signin(){
    return <div className="h-screen w-screen bg-gray-200 flex justify-center items-center">
        <div className="bg-white rounded-md border min-w-48 p-4">
            <div className="flex justify-center text-2xl text-purple-800 -translate-y-2 ">
                SignIn
            </div>
            <div className="text-lg">
                <Input placeholder="Username"/>
                <Input placeholder="Password"/>
            </div>

            <div className="flex justify-center pb-1 mt-2">
                <Button loading={false} variant={"primary"} text="Signin" size="md" fullscreen={true}/>
            </div>



        </div>

    </div>
}