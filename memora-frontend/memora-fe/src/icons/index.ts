//this is the interface for all the icons , we can export it from here only 

export interface IconProps{
    size: "sm"|"md"|"lg";
    onClick?:()=>void;
  
}

export const iconSizeVariants={
    "sm":"size-2",
    "md":"size-4",
    "lg":"size-6",
}