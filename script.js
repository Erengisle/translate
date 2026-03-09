const languages = {

Ukrainian:"uk",
Spanish_Latin_America:"es",

English:"en",
Arabic:"ar",
Urdu:"ur",
Bangla:"bn",
Turkish:"tr",
Tigrinya:"ti",
Thai:"th",
Russian:"ru",
Chinese_Mandarin:"zh",
Mongolian:"mn",
Dari:"fa-AF",
Persian:"fa"

}
}

async function translate(){

const text = document.getElementById("sourceText").value

const prompt =
"Translate the following Swedish text into: " +
Object.keys(languages).join(", ") +
". Return JSON like {language:text}."

const response = await fetch("https://api.anthropic.com/v1/messages",{

method:"POST",

headers:{
"Content-Type":"application/json",
"x-api-key":"YOUR_API_KEY",
"anthropic-version":"2023-06-01"
},

body:JSON.stringify({

model:"claude-3-5-sonnet-20241022",

max_tokens:1000,

messages:[{
role:"user",
content:prompt + "\n\nTEXT:\n" + text
}]

})

})

const data = await response.json()

let translations

try{

translations = JSON.parse(data.content[0].text)

}catch{

alert("Translation error")
return

}

showTranslations(translations)

}

function showTranslations(translations){

const container = document.getElementById("results")

container.innerHTML=""

for(const lang in translations){

const text = translations[lang]

const card = document.createElement("div")
card.className="card"

const title = document.createElement("h3")
title.innerText = lang

const t = document.createElement("div")
t.className="translation"
t.innerText = text

const copy = document.createElement("button")
copy.innerText="Copy"
copy.onclick=()=>navigator.clipboard.writeText(text)

const qr = document.createElement("div")
qr.className="qr"

card.appendChild(title)
card.appendChild(t)
card.appendChild(copy)
card.appendChild(qr)

container.appendChild(card)

createQR(text,lang,qr)

}

}

function createQR(text,lang,element){

const url =
window.location.origin +
window.location.pathname.replace("index.html","") +
"view.html?lang="+
encodeURIComponent(lang)+
"&text="+
encodeURIComponent(text)

new QRCode(element,{
text:url,
width:140,
height:140
})

}

function printQR(){

window.print()

}
