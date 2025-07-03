export default function kebabize(str: string){
    let kebabizedStr = ''
    str.split(' ').forEach((word, i) => {
        if(str.split(' ').length === i+1){
            kebabizedStr += word.toLowerCase();
        } else {
            kebabizedStr += word.toLowerCase() + '-'
        }
    })
    return kebabizedStr;
}