export function hash(len:number){
    let options="snfjanrfqwfnhvsjvnahdajahfefja";
    let length=options.length;

    let ans="";

    for(let i =0;i<options.length;i++){
        ans += options[Math.floor((Math.random()*length))] 
    }
    return ans;

}