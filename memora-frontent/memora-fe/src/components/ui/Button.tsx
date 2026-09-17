




// difining the type of Button Component

import type { ReactElement } from "react";

 
interface ButtonProps{
    variant:"primary" | "secondary";
    size:"sm" | "md" | "lg";
    text:string;
    // do not use any type leave it for the worstCase senario
    startIcon?:ReactElement;      //1. these icons should be optional
    endIcon?:ReactElement;
    onClick:()=>void;
}


const variantStyles={
    "primary":"bg-purple-600 text-white ",
    "secondary":"bg-purple-200 text-purple-600"
};

const sizeStyles={
    "sm":"py-1 px-2",
    "md":"py-2 px-4",
    "lg":"py-3 px-6"

}


const defaultStyles="rounded-md p-4 flex items-center justify-center"

export const Button=(props:ButtonProps)=>{
    return <button className=
    {`${variantStyles[props.variant]}
     ${defaultStyles}
     ${sizeStyles[props.size]} cursor-pointer` }>
        {props.startIcon ? <div className="pr-2">
        {props.startIcon}</div>:null}
        {props.text}
        {props.endIcon? <div className="pl-2">{props.endIcon}</div>:null }
        </button>

};

