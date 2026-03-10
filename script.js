const endpoint="https://nyqxplfhrzydxnwhvhco.supabase.co/functions/v1/translate"

const supabase="https://nyqxplfhrzydxnwhvhco.supabase.co"

const anon="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cXhwbGZocnp5ZHhud2h2aGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODI5MTgsImV4cCI6MjA4ODY1ODkxOH0.zaWJIBgJahhU4KphbalcKc_RVL6kq1irTs6C074bgW0"

const defaultLanguages={
"Ukrainska":"Ukrainian",
"Spanska":"Spanish"
}

loadFavorites()

async function translate(){

const text=document.getElementById("text").value

if(!text)return alert("Skriv text")

const results=document.getElementById("results")

results.innerHTML=""

let languages={...defaultLanguages}

document.querySelectorAll("input[type=checkbox]:checked")
.forEach(cb=>languages[cb.parentNode.textContent.trim()]=cb.value)

for(const label in languages){

const res=await fetch(endpoint,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
text:text,
language:languages[label]
})
})

const data=await res.json()

createCard(label,data.translation,data.id)

}

}

function createCard(lang,translation,id){

const container=document.getElementById("results")

const card=document.createElement("div")

card.className="card"

const title=document.createElement("div")
title.className="lang"
title.innerText=lang

const qr=document.createElement("div")

new QRCode(qr,{
text:`view.html?id=${id}`,
width:150,
height:150
})

const text=document.createElement("div")
text.className="translation"
text.innerText=translation

card.appendChild(title)
card.appendChild(qr)
card.appendChild(text)

container.appendChild(card)

}

async function saveFavorite(){

const text=document.getElementById("text").value

await fetch(`${supabase}/rest/v1/favorites`,{
method:"POST",
headers:{
apikey:anon,
Authorization:`Bearer ${anon}`,
"Content-Type":"application/json"
},
body:JSON.stringify({text:text})
})

loadFavorites()

}

async function loadFavorites(){

const res=await fetch(`${supabase}/rest/v1/favorites?select=*`,{
headers:{
apikey:anon,
Authorization:`Bearer ${anon}`
}
})

const data=await res.json()

const select=document.getElementById("favorites")

select.innerHTML="<option>Favoriter</option>"

data.forEach(f=>{

const option=document.createElement("option")

option.value=f.text
option.innerText=f.text

select.appendChild(option)

})

select.onchange=e=>{
document.getElementById("text").value=e.target.value
}

}

function printQR(){

const cards=[...document.querySelectorAll(".card")]

let html=""

cards.forEach(c=>{
html+=c.outerHTML
})

localStorage.setItem("qrprint",html)

window.open("print.html")

}
