/**
 * SECTION 1: INIZIALIZZAZIONE E GESTIONE ERRORI (LOCAL STORAGE HARDENING)
 * * Obiettivo: Recuperare in sicurezza lo stato dell'applicazione persistito nel browser.
 * Protezione: Un fallimento nel parsing (es. localStorage alterato manualmente o corrotto)
 * causerebbe il crash immediato dell'intera applicazione. Il blocco try-catch isola l'errore,
 * garantendo un meccanismo di fallback sicuro (array vuoto) per mantenere l'app sempre operativa.
 */
let expenses = [];
try {
    expenses = JSON.parse(localStorage.getItem('myExpenses')) || [];
} catch (e) {
    console.error("Rilevata corruzione o anomalia nei dati locali. Inizializzazione di ripiego eseguita.", e);
    expenses = [];
}

// Collegamento sicuro ai nodi del DOM tramite ID univoci
const itemNameInput = document.getElementById('itemName');
const itemCostInput = document.getElementById('itemCost');
const frequencyInput = document.getElementById('frequency');
const addBtn = document.getElementById('addBtn');
const listDisplay = document.getElementById('list');
const totalDisplay = document.getElementById('total-display');
const budgetInput = document.getElementById('budgetLimit');

/**
 * SECTION 2: SANITIZZAZIONE PREVENTIVA DELLE STRINGHE (ANTI-XSS LAYER)
 * * Obiettivo: Bonificare le stringhe inserite dall'utente prima di qualsiasi elaborazione.
 * Protezione: Questo metodo sfrutta i meccanismi nativi del browser per convertire i caratteri
 * sensibili (come <, >, &, ") in entità HTML inerti. Se un utente malintenzionato tenta di iniettare
 * un tag <script>, questo viene disinnescato all'istante, impedendo attacchi Cross-Site Scripting (XSS).
 */
function sanitizeInput(str) {
    const temp = document.createElement('div');
    temp.textContent = str; // Inserisce la stringa come testo crudo, forzando l'escaping nativo
    return temp.innerHTML;  // Restituisce la stringa di testo convertita in entità HTML sicure
}

/**
 * SECTION 3: LOGICA REATTIVA DI RENDERING E CALCOLO DEL BUDGET
 * * Obiettivo: Ricostruire dinamicamente l'interfaccia utente (UI) garantendo l'integrità matematica.
 * Protezione: Non viene usato innerHTML per inserire i dati dell'utente. Ogni riga della lista
 * viene scomposta in elementi strutturali interni (div, span) popolati esclusivamente tramite textContent.
 * Viene eseguito l'hardening dei dati letti in memoria per neutralizzare input logici corrotti.
 */
function updateUI() {
    listDisplay.innerHTML = ''; // Reset sicuro del contenitore lista prima del ridisegno
    let total = 0;

    // Convalida del limite di budget: previene l'uso di valori non numerici, negativi o zero
    let limit = parseFloat(budgetInput.value);
    if (isNaN(limit) || limit <= 0) {
        limit = 1000; // Valore di fallback predefinito e stabile
    }

    // Ciclo di analisi delle singole spese memorizzate
    expenses.forEach((item, index) => {
        // HARDENING DI INTEGRITÀ: Forza la conversione in tipi primitivi stabili (Number) 
        // per evitare errori matematici o injection di tipi di dati inaspettati dal localStorage.
        const safeCost = parseFloat(item.cost) || 0; 
        const safeFreq = parseInt(item.freq) || 12;

        // Calcolo della proiezione annua per il singolo record
        const annualCost = safeCost * safeFreq;
        total += annualCost; // Accumulo nel computo globale

        // Creazione dell'elemento di lista principale (li)
        const li = document.createElement('li');

        // FUNZIONE SCONTRINO: Generazione del wrapper Flexbox configurato tramite foglio di stile
        const receiptWrapper = document.createElement('div');
        receiptWrapper.className = 'receipt-wrapper';

        // Nodo Sinistro: Dettaglio del record (Nome, Costo base e Frequenza)
        const detailsSpan = document.createElement('span');
        detailsSpan.className = 'receipt-details';
        detailsSpan.textContent = `${item.name} (€${safeCost.toFixed(2)} ${safeFreq === 12 ? 'mensili' : 'annui'})`;

        // Nodo Destro: Proiezione analitica annualizzata evidenziata
        const annualSpan = document.createElement('span');
        annualSpan.className = 'receipt-annual';
        annualSpan.textContent = `→ €${annualCost.toFixed(2)} annui`;

        // Assemblaggio strutturale ad albero dell'area "Scontrino" (Previene XSS)
        receiptWrapper.appendChild(detailsSpan);
        receiptWrapper.appendChild(annualSpan);

        // Creazione del comando di eliminazione record
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.onclick = () => {
            expenses.splice(index, 1); // Rimozione chirurgica dall'array tramite indice
            localStorage.setItem('myExpenses', JSON.stringify(expenses)); // Sincronizzazione storage
            updateUI(); // Ridisegno immediato dell'interfaccia
        };

        // Innesto finale dei nodi dentro il componente di riga (li)
        li.appendChild(receiptWrapper);
        li.appendChild(deleteBtn);
        listDisplay.appendChild(li);
    });

    // Aggiornamento del display del totale complessivo annuo
    totalDisplay.textContent = `Totale Annuo: €${total.toFixed(2)}`;

    // Calcolo restrittivo della percentuale della barra (Range vincolato matematicamente tra 0 e 100)
    const percentage = Math.min((total / limit) * 100, 100);
    
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    progressBar.style.width = percentage + '%';

    // Gestione degli stati visivi di allarme in caso di sforamento delle soglie critiche
    if (total > limit) {
        progressBar.classList.add('progress-bar-danger');
        progressText.classList.add('alert-text');
        const overBudget = total - limit;
        progressText.textContent = `⚠️ BUDGET SUPERATO DI €${overBudget.toFixed(2)}`;
    } else {
        progressBar.classList.remove('progress-bar-danger');
        progressText.classList.remove('alert-text');
        progressText.style.color = '#94a3b8';
        progressText.textContent = `Budget: €${limit.toFixed(2)} | Utilizzo: ${percentage.toFixed(0)}%`;
    }

    console.log(`[DEBUG] Interfaccia aggiornata. Totale: ${total.toFixed(2)} | Limite: ${limit.toFixed(2)}`);
}

// Event listener per aggiornare dinamicamente l'interfaccia alla modifica del budget limite
budgetInput.addEventListener('input', updateUI);

/**
 * SECTION 4: GESTIONE EVENTI E INTERCETTAZIONE INPUT (DATA INTERGITY LAYER)
 * * Obiettivo: Validare, correggere e archiviare in sicurezza le nuove voci di spesa.
 * Protezione: Gestisce in modo preventivo i difetti strutturali di precisione dei numeri a virgola mobile 
 * (Floating-point) tipici di JavaScript e blocca l'inserimento di dati incompleti o non conformi.
 */
addBtn.addEventListener('click', () => {
    // Sanitizzazione della stringa e rimozione degli spazi vuoti superflui (Trim)
    const name = sanitizeInput(itemNameInput.value.trim());
    
    // CORREZIONE FLOATING-POINT: Moltiplica per 100, arrotonda all'intero più vicino e divide per 100.
    // Questa tecnica di hardening matematico neutralizza le imprecisioni dello standard IEEE 754 (es. 0.1 + 0.2).
    const rawCost = parseFloat(itemCostInput.value);
    const cost = Math.round(rawCost * 100) / 100;

    const freq = parseInt(frequencyInput.value);

    // Validazione rigorosa dei vincoli di consistenza prima dell'archiviazione
    if (name && !isNaN(cost) && cost > 0 && (freq === 12 || freq === 1)) {
        expenses.push({ name, cost, freq }); // Inserimento sicuro nell'array di stato
        localStorage.setItem('myExpenses', JSON.stringify(expenses)); // Scrittura cruda serializzata
        updateUI(); // Sincronizzazione UI
        
        // Reset dei soli campi di testo per ottimizzare l'esperienza utente
        itemNameInput.value = '';
        itemCostInput.value = '';
    } else {
        alert("Dati non validi. Verificare che il nome sia presente e il costo sia superiore a zero.");
    }
});

// Esecuzione del rendering iniziale al caricamento della pagina per mostrare eventuali dati storici
updateUI();