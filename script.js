const endpoint = "https://nyqxplfhrzydxnwhvhco.supabase.co/functions/v1/translate"

const supabase = "https://nyqxplfhrzydxnwhvhco.supabase.co"

const anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cXhwbGZocnp5ZHhud2h2aGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODI5MTgsImV4cCI6MjA4ODY1ODkxOH0.zaWJIBgJahhU4KphbalcKc_RVL6kq1irTs6C074bgW0"

// Bas-URL för view.html — fungerar både lokalt och på GitHub Pages
const viewBase = (() => {
  const p = location.pathname.replace(/\/[^/]*$/, "/")
  return location.origin + p + "view.html"
})()

const alwaysIncludedLanguages = {
  spanish: "Spanska",
  ukrainian: "Ukrainska"
}

const optionalLanguages = {
  urdu: "Urdu",
  english: "Engelska",
  turkish: "Turkiska",
  tigrinya: "Tigrinja",
  swahili: "Swahili",
  bangla: "Bangla",
  arabic: "Arabiska",
  russian: "Ryska",
  mandarin: "Kinesiska (Mandarin)",
  thai: "Thailändska",
  mongolian: "Mongoliska",
  dari: "Dari",
  persian: "Persiska"
}

const allLanguages = {
  ...alwaysIncludedLanguages,
  ...optionalLanguages
}

let selected = {
  urdu: false,
  english: false,
  turkish: false,
  tigrinya: false,
  swahili: false,
  bangla: false,
  arabic: false,
  russian: false,
  mandarin: false,
  thai: false,
  mongolian: false,
  dari: false,
  persian: false
}

init()

function init() {
  createLanguageGrid()
  loadFavorites()

  window.quick = quick
  window.runTranslate = runTranslate
  window.translate = translate
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
  container.innerHTML = ""

  for (const key in optionalLanguages) {
    const div = document.createElement("div")
    div.className = "langbox"

    div.innerHTML = `<label>
<input type="checkbox" ${selected[key] ? "checked" : ""}>
${optionalLanguages[key]}
</label>`

    const cb = div.querySelector("input")

    cb.addEventListener("change", () => {
      selected[key] = cb.checked
    })

    div.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return
      cb.checked = !cb.checked
      cb.dispatchEvent(new Event("change"))
    })

    container.appendChild(div)
  }
}

async function runTranslate() {
  const text = document.getElementById("text").value.trim()
  if (!text) return

  // Hitta översätt-knappen och ge feedback
  const translateBtn = document.querySelector('button[onclick="translate()"]') || 
                       document.querySelector('button[onclick="runTranslate()"]')
  
  if (translateBtn) {
    translateBtn.disabled = true
    const originalText = translateBtn.innerText
    translateBtn.innerText = "Översätter..."
    translateBtn.style.opacity = "0.7"
  }

  const results = document.getElementById("results")
  results.innerHTML = ""

  const customLang = document.getElementById("custom-lang").value.trim()

  // Extrahera text inom citationstecken och ersätt med platshållare
  const quotedPhrases = []
  const textWithPlaceholders = text.replace(/"([^"]*)"/g, (match, quoted) => {
    quotedPhrases.push(quoted)
    return `__QUOTE_${quotedPhrases.length - 1}__`
  })

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
        body: JSON.stringify({ text: textWithPlaceholders, language: lang })
      })

      if (!res.ok) {
        const errorText = await res.text()
        createCard(allLanguages[lang], `Fel vid översättning (${res.status}): ${errorText}`, text)
        continue
      }

      const data = await res.json()
      
      // Återställ citerad text i översättningen
      let finalTranslation = data.translation
      quotedPhrases.forEach((phrase, index) => {
        finalTranslation = finalTranslation.replace(`__QUOTE_${index}__`, `"${phrase}"`)
      })
      
      createCard(allLanguages[lang], finalTranslation, text)
    } catch (error) {
      createCard(
        allLanguages[lang],
        `Nätverksfel vid översättning: ${error?.message || "okänt fel"}`,
        text
      )
    }
  }

  // Anpassat språk
  if (customLang) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anon,
          Authorization: `Bearer ${anon}`
        },
        body: JSON.stringify({ text: textWithPlaceholders, language: customLang })
      })

      if (!res.ok) {
        const errorText = await res.text()
        createCard(customLang, `Fel vid översättning (${res.status}): ${errorText}`, text)
      } else {
        const data = await res.json()
        
        // Återställ citerad text i översättningen
        let finalTranslation = data.translation
        quotedPhrases.forEach((phrase, index) => {
          finalTranslation = finalTranslation.replace(`__QUOTE_${index}__`, `"${phrase}"`)
        })
        
        createCard(customLang, finalTranslation, text)
      }
    } catch (error) {
      createCard(customLang, `Nätverksfel: ${error?.message || "okänt fel"}`, text)
    }
  }

  // Återställ knappen med success-feedback
  if (translateBtn) {
    translateBtn.innerText = "✓ Klart!"
    translateBtn.style.opacity = "1"
    translateBtn.style.backgroundColor = "#10b981" // Grön färg
    
    setTimeout(() => {
      translateBtn.innerText = "Översätt"
      translateBtn.style.backgroundColor = "" // Återställ till original
      translateBtn.disabled = false
    }, 1500)
  }
}

function translateAll() {
  for (const key in optionalLanguages) {
    selected[key] = true
  }
  createLanguageGrid()
  runTranslate()
}

function createCard(lang, translation, originalText) {
  const container = document.getElementById("results")

  const card = document.createElement("div")
  card.className = "card"

  // --- Topprad: språknamn + kopiera-knapp ---
  const topRow = document.createElement("div")
  topRow.className = "card-top"

  const title = document.createElement("div")
  title.className = "lang"
  title.innerText = lang

  const copy = document.createElement("button")
  copy.className = "btn-copy"
  copy.innerText = "Kopiera"
  copy.onclick = () => {
    navigator.clipboard.writeText(translation)
    copy.innerText = "✓ Kopierat"
    setTimeout(() => (copy.innerText = "Kopiera"), 1800)
  }

  topRow.appendChild(title)
  topRow.appendChild(copy)

  // --- Översättningstext ---
  const text = document.createElement("div")
  text.className = "translation"
  text.innerText = translation

  // --- QR-kod ---
  const qrWrap = document.createElement("div")
  qrWrap.className = "qr-wrap"

  const qrLabel = document.createElement("p")
  qrLabel.className = "qr-label"
  qrLabel.innerText = "Skanna för att spara"

  const qrDiv = document.createElement("div")
  qrDiv.className = "qr-code"

  // Förkorta URL genom att bara inkludera översättningen (inte originalet)
  // Detta gör QR-koden mindre och lättare att skanna
  const viewUrl = `${viewBase}?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(translation)}`

  // Generera QR-kod (biblioteket läggs till i index.html)
  if (typeof QRCode !== "undefined") {
    new QRCode(qrDiv, {
      text: viewUrl,
      width: 120,
      height: 120,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.L  // Lägre korrektionsnivå = enklare kod
    })
  }

  qrWrap.appendChild(qrLabel)
  qrWrap.appendChild(qrDiv)

  card.appendChild(topRow)
  card.appendChild(text)
  card.appendChild(qrWrap)

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

  const select = document.getElementById("favoriter")
  select.innerHTML = "<option>⭐ Favoriter</option>"

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
