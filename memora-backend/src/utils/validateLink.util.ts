// turns user input into a safe web link, or null if it isn't one
export function toWebLink(input:unknown):string|null{
    if(typeof input!=="string"){
        return null;
    };

    const trimmed=input.trim();

    if(!trimmed || trimmed.length>2048){
        return null;
    };

    // "youtube.com" has no scheme → assume https
    const hasScheme=/^[a-z][a-z0-9+.-]*:/i.test(trimmed);
    const withScheme=hasScheme ? trimmed : "https://"+trimmed;

    let url:URL;
    try {
        url=new URL(withScheme);
    } catch {
        return null;
    };

    // only real web links, this blocks javascript:, data:, file: ...
    if(url.protocol!=="http:" && url.protocol!=="https:"){
        return null;
    };

    // "hello" would become https://hello/ → needs a real domain
    if(!url.hostname.includes(".")){
        return null;
    };

    return url.href;
}
