const endpoint = "https://nyqxplfhrzydxnwhvhco.supabase.co/functions/v1/translate"

const supabase = "https://nyqxplfhrzydxnwhvhco.supabase.co"

const anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cXhwbGZocnp5ZHhud2h2aGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODI5MTgsImV4cCI6MjA4ODY1ODkxOH0.zaWJIBgJahhU4KphbalcKc_RVL6kq1irTs6C074bgW0"

const alwaysIncludedLanguages = {
  spanish: "Spanska",
  ukrainian: "Ukrainska"
}

const optionalLanguages = {
  urdu: "Urdu",
  arabic: "Arabiska",
  english: "Engelska",
  turkish: "Turkiska",
  dari: "Dari",
  mongolian: "Mongoliska",
  persian: "Persiska",
  thai: "Thailändska",
  russian: "Ryska"
}

const allLanguages = {
  ...alwaysIncludedLanguages,
  ...optionalLanguages
}

let selected = {
  urdu: false,
  arabic: false,
  english: false,
  turkish: false,
  dari: false,
  mongolian: false,
  persian: false,
  thai: false,
  russian: false
}

init()

function init() {
  createLanguageGrid()
  loadFavorites()

  // Explicit globals for inline onclick handlers in index.html
  window.quick = quick
  window.runTranslate = runTranslate
  window.translate = translate // backward compatibility for cached HTML
  window.translateAll = translateAll
  window.saveFavorite = saveFavorite
  
}


function translate() {
  return runTranslate()
}

function quick(text) {
  document.getElementById("text").value = text
  runTranslate()
}

function createLanguageGrid() {
  const container = document.getElementById("languages")

  for (const key in optionalLanguages) {
    const div = document.createElement("div")
    div.className = "langbox"

    div.innerHTML = `<label>
<input type="checkbox" ${selected[key] ? "checked" : ""}>
${optionalLanguages[key]}
</label>`

    div.onclick = (e) => {
      const cb = div.querySelector("input")

      if (e.target.tagName !== "INPUT") {
        cb.checked = !cb.checked
      }

      selected[key] = cb.checked
    }

    container.appendChild(div)
  }
}

async function runTranslate() {
  const text = document.getElementById("text").value.trim()

  if (!text) return

  const results = document.getElementById("results")
  results.innerHTML = ""

  const langs = [
    ...Object.keys(alwaysIncludedLanguages),
    ...Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k)
  ]

  for (const lang of langs) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anon,
          Authorization: `Bearer ${anon}`
        },
        body: JSON.stringify({
          text,
          language: lang
        })
      })

      if (!res.ok) {
        const errorText = await res.text()
        createCard(allLanguages[lang], `Fel vid översättning (${res.status}): ${errorText}`, "")
        continue
      }

      const data = await res.json()
      createCard(allLanguages[lang], data.translation, data.id)
    } catch (error) {
      createCard(
        allLanguages[lang],
        `Nätverksfel vid översättning: ${error?.message || "okänt fel"}`,
        ""
      )
    }
  }
}

function translateAll() {
  for (const key in optionalLanguages) {
    selected[key] = true
  }

  runTranslate()
}

function createCard(lang, translation, id) {
  const container = document.getElementById("results")

  const card = document.createElement("div")
  card.className = "card"

  const title = document.createElement("div")
  title.className = "lang"
  title.innerText = lang

  const qr = document.createElement("div")

   })
  }

  const text = document.createElement("div")
  text.className = "translation"
  text.innerText = translation

  const tools = document.createElement("div")
  tools.className = "tools"

  const copy = document.createElement("button")
  copy.innerText = "Kopiera"

  copy.onclick = () => {
    navigator.clipboard.writeText(translation)
  }
  tools.appendChild(copy)

  card.appendChild(title)
   card.appendChild(text)
  card.appendChild(tools)

  container.appendChild(card)
}

async function saveFavorite() {
  const text = document.getElementById("text").value

  await fetch(`${supabase}/rest/v1/favorites`, {
    method: "POST",
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  })

  loadFavorites()
}

async function loadFavorites() {
  let data = []

  try {
    const res = await fetch(`${supabase}/rest/v1/favorites?select=*`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`
      }
    })

    if (res.ok) {
      data = await res.json()
    }
  } catch (_error) {
    data = []
  }

  const select = document.getElementById("favorites")

  select.innerHTML = "<option>Favoriter</option>"

  data.forEach((f) => {
    const option = document.createElement("option")

    option.value = f.text
    option.innerText = f.text

    select.appendChild(option)
  })

  select.onchange = (e) => {
    document.getElementById("text").value = e.target.value
  }
}

function printQR() {
  const cards = [...document.querySelectorAll(".card")]

  let html = ""

  cards.forEach((c) => {
    html += c.outerHTML
  })

  localStorage.setItem("qrprint", html)

  window.open("print.html")
}
