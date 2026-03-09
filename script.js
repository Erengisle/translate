const ALWAYS_LANGUAGES = ["ukrainian", "spanish"];
const OPTIONAL_LANGUAGES = [
  "english", "arabic", "urdu", "bangla", "turkish",
  "tigrinya", "thai", "russian", "mandarin", "mongolian",
  "dari", "persian"
];

const LANGUAGE_META = {
  spanish: { sv: "Spanska", flag: "🇪🇸" },
  ukrainian: { sv: "Ukrainska", flag: "🇺🇦" },
  english: { sv: "Engelska", flag: "🇬🇧" },
  arabic: { sv: "Arabiska", flag: "🇸🇦" },
  urdu: { sv: "Urdu", flag: "🇵🇰" },
  bangla: { sv: "Bangla", flag: "🇧🇩" },
  turkish: { sv: "Turkiska", flag: "🇹🇷" },
  tigrinya: { sv: "Tigrinja", flag: "🇪🇷" },
  thai: { sv: "Thailändska", flag: "🇹🇭" },
  russian: { sv: "Ryska", flag: "🇷🇺" },
  mandarin: { sv: "Kinesiska (Mandarin)", flag: "🇨🇳" },
  mongolian: { sv: "Mongoliska", flag: "🇲🇳" },
  dari: { sv: "Dari", flag: "🇦🇫" },
  persian: { sv: "Persiska", flag: "🇮🇷" }
};

// Skapa kryssrutor
const container = document.getElementById("languageContainer");
OPTIONAL_LANGUAGES.forEach(lang => {
  const label = document.createElement("label");
  label.className = "lang-checkbox";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `lang-${lang}`;
  checkbox.value = lang;

  label.appendChild(checkbox);
  label.innerHTML += `<span>${LANGUAGE_META[lang].flag}</span>${LANGUAGE_META[lang].sv}`;
  container.appendChild(label);
});

document.getElementById("translateBtn").addEventListener("click", translate);

async function translate() {
  const text = document.getElementById("sourceText").value.trim();
  if (!text) {
    alert("Skriv in text att översätta.");
    return;
  }

  const selected = [...ALWAYS_LANGUAGES];
  OPTIONAL_LANGUAGES.forEach(lang => {
    const cb = document.getElementById(`lang-${lang}`);
    if (cb.checked) selected.push(lang);
  });

  document.getElementById("results").innerHTML = "";
  document.getElementById("loading").style.display = "block";
  document.getElementById("translateBtn").disabled = true;

  const translations = {};

  try {
    for (const lang of selected) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "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",  // <--- Lägg in din Claude-API-nyckel
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Translate the following Swedish text for school communication into ${LANGUAGE_META[lang].sv}. Use natural everyday language. Return only the translation.\n\nTEXT:\n${text}`
          }]
        })
      });

      if (!response.ok) throw new Error(`Fel vid översättning till ${LANGUAGE_META[lang].sv}`);
      const data = await response.json();
      translations[lang] = data.content[0].text.trim();
    }

    showTranslations(translations);
  } catch (err) {
    alert(err.message);
  } finally {
    document.getElementById("loading").style.display = "none";
    document.getElementById("translateBtn").disabled = false;
  }
}

function showTranslations(translations) {
  const results = document.getElementById("results");
  results.innerHTML = "";
  Object.entries(translations).forEach(([lang, text]) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-header">
        <span>${LANGUAGE_META[lang].flag}</span>${LANGUAGE_META[lang].sv}
      </div>
      <div class="card-text">${text}</div>
    `;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.innerText = "Kopiera";
    copyBtn.onclick = () => navigator.clipboard.writeText(text);

    card.appendChild(copyBtn);
    results.appendChild(card);
  });
}
