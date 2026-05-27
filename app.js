// 1. Inizializzazione protetta da eccezioni (Try-Catch Hardening)
let expenses = [];
try {
    expenses = JSON.parse(localStorage.getItem('myExpenses')) || [];
} catch (e) {
    console.error("Rilevata corruzione nei dati locali. Inizializzazione di ripiego eseguita.", e);
    expenses = [];
}

const itemNameInput = document.getElementById('itemName');
const itemCostInput = document.getElementById('itemCost');
const frequencyInput = document.getElementById('frequency');
const addBtn = document.getElementById('addBtn');
const listDisplay = document.getElementById('list');
const totalDisplay = document.getElementById('total-display');
const budgetInput = document.getElementById('budgetLimit');

// 2. Sanitizzazione preventiva delle stringhe di input
function sanitizeInput(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// 3. Logica di rendering dell'interfaccia protetta
function updateUI() {
    listDisplay.innerHTML = ''; // Reset sicuro del contenitore lista
    let total = 0;

    // Controllo di validità sul limite del budget (Evita valori negativi o zero)
    let limit = parseFloat(budgetInput.value);
    if (isNaN(limit) || limit <= 0) {
        limit = 1000; 
    }

    // Generazione dinamica della lista con metodi nativi blindati (No XSS injection)
    expenses.forEach((item, index) => {
        // Hardening di integrità: Assicurati che i dati estratti dal DB siano effettivamente numeri stabili
        const safeCost = parseFloat(item.cost) || 0; 
        const safeFreq = parseInt(item.freq) || 12;

        const annualCost = safeCost * safeFreq;
        total += annualCost;

        const li = document.createElement('li');

        // Costruzione sicura dei nodi di testo tramite textContent usando i dati validati
        const detailsSpan = document.createElement('span');
        detailsSpan.textContent = `${item.name} (${safeFreq === 12 ? 'Mensile' : 'Annuale'})`;

        const costSpan = document.createElement('span');
        costSpan.textContent = `€${safeCost.toFixed(2)}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.onclick = () => {
            expenses.splice(index, 1);
            localStorage.setItem('myExpenses', JSON.stringify(expenses));
            updateUI();
        };

        // Aggancio sicuro dei nodi al genitore
        li.appendChild(detailsSpan);
        li.appendChild(costSpan);
        li.appendChild(deleteBtn);
        listDisplay.appendChild(li);
    });

    totalDisplay.textContent = `Totale Annuo: €${total.toFixed(2)}`;

    // Calcolo della percentuale della barra vincolato tra 0% e 100%
    const percentage = Math.min((total / limit) * 100, 100);
    
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    progressBar.style.width = percentage + '%';

    // Gestione reattiva degli allarmi visivi di sforamento
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

budgetInput.addEventListener('input', updateUI);

// 4. Inserimento dei record con correzione del calcolo in virgola mobile
addBtn.addEventListener('click', () => {
    const name = sanitizeInput(itemNameInput.value.trim());
    
    // Mitigazione dell'imprecisione dei float tramite arrotondamento preventivo al centesimo
    const rawCost = parseFloat(itemCostInput.value);
    const cost = Math.round(rawCost * 100) / 100;

    const freq = parseInt(frequencyInput.value);

    // Validazione dei vincoli prima dell'archiviazione
    if (name && !isNaN(cost) && cost > 0 && (freq === 12 || freq === 1)) {
        expenses.push({ name, cost, freq });
        localStorage.setItem('myExpenses', JSON.stringify(expenses));
        updateUI();
        
        itemNameInput.value = '';
        itemCostInput.value = '';
    } else {
        alert("Dati non validi. Verificare che il nome sia presente e il costo sia superiore a zero.");
    }
});

updateUI();