// difining the type of Button Component

import type { ReactElement } from "react";

 
interface ButtonProps{
    variant:"primary" | "secondary";
    size:"sm" | "md" | "lg";
    text:string;
    // do not use any type leave it for the worstCase senario
    startIcon?:ReactElement;      //1. these icons should be optional
    endIcon?:ReactElement;
    onClick?:()=>void;
    fullscreen?:boolean;
    loading?:boolean;
}


const variantStyles={
    "primary":" px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/30 active:translate-y-0 ",
    "secondary":"px-6 py-3 rounded-xl bg-purple-500 text-white font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/30 active:translate-y-0"
};

const sizeStyles={
    "sm":"py-1 px-2",
    "md":"py-2 px-4",
    "lg":"py-3 px-6"

}


const defaultStyles="rounded-md p-4 flex items-center justify-center font-light"

export const Button=(props:ButtonProps)=>{
    return <button onClick={props.onClick} className=
    {`${variantStyles[props.variant]} ${defaultStyles} ${sizeStyles[props.size]} cursor-pointer ${props.fullscreen ? "w-full flex justify-center items-center " : ""} ${props.loading ? "opacity-45":""} `} disabled={props.loading} >
        {props.startIcon ? <div className="pr-2">
        {props.startIcon}</div>:null}
        {props.text}
        {props.endIcon? <div className="pl-2">{props.endIcon}</div>:null }
        </button>

};

