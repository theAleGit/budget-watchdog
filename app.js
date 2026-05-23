// 1. Inizializzazione: recuperiamo i dati o creiamo un array vuoto
let expenses = JSON.parse(localStorage.getItem('myExpenses')) || [];

const itemNameInput = document.getElementById('itemName');
const itemCostInput = document.getElementById('itemCost');
const frequencyInput = document.getElementById('frequency');
const addBtn = document.getElementById('addBtn');
const listDisplay = document.getElementById('list');
const totalDisplay = document.getElementById('total-display');
const budgetInput = document.getElementById('budgetLimit');

// 2. Funzione di Hardening: Sanitizzazione dell'input
function sanitizeInput(str) {
    const temp = document.createElement('div');
    temp.textContent = str; // Converte i caratteri pericolosi in testo puro
    return temp.innerHTML;
}

// 3. Logica di aggiornamento UI
function updateUI() {
    listDisplay.innerHTML = '';
    let total = 0;

    // Ciclo su ogni spesa per calcolare il totale e generare la lista
    expenses.forEach((item, index) => {
        // Calcolo: il moltiplicatore (12 o 1) è già nel value della select
        const annualCost = item.cost * item.freq;
        total += annualCost;

        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} (${item.freq === 12 ? 'Mensile' : 'Annuale'})</span>
            <span>€${item.cost}</span>
        `;

        // Creazione bottone per eliminare la voce specifica
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.onclick = () => {
            expenses.splice(index, 1); // Rimuove l'elemento dall'array
            localStorage.setItem('myExpenses', JSON.stringify(expenses)); // Aggiorna il salvataggio
            updateUI(); // Ridisegna la lista
        };
        
        li.appendChild(deleteBtn);
        listDisplay.appendChild(li);
    });

    // Aggiornamento del display totale
    totalDisplay.textContent = `Totale Annuo: €${total.toFixed(2)}`;

    // --- LOGICA BUDGET E BARRA DI PROGRESSO ---
    // Recuperiamo il budget dall'input (default 10.000€ se l'input è vuoto)
    const limit = parseFloat(budgetInput.value) || 10000;
    // Calcolo percentuale (con limite massimo al 100% per non rompere il layout)
    const percentage = Math.min((total / limit) * 100, 100);
    
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // Impostazione larghezza barra
    progressBar.style.width = percentage + '%';

    // LOGICA DI ALLERTA: se il totale supera il budget, aggiunge la classe rossa
    if (total > limit) {
        progressBar.classList.add('progress-bar-danger');
    } else {
        progressBar.classList.remove('progress-bar-danger');
    }
    
    // Aggiornamento testo informativo dinamico
    // --- LOGICA DI ALLERTA E TESTO DINAMICO ---
    if (total > limit) {
        progressBar.classList.add('progress-bar-danger');
        
        // Aggiornamento allerta con classi CSS
        progressText.classList.add('alert-text');
        const overBudget = total - limit;
        progressText.textContent = `⚠️ BUDGET SUPERATO DI €${overBudget.toFixed(2)}`;
    } else {
        progressBar.classList.remove('progress-bar-danger');
        
        // Ripristino stato neutro
        progressText.classList.remove('alert-text');
        progressText.style.color = '#94a3b8'; // Colore neutro originale
        progressText.textContent = `Budget: €${limit} | Utilizzo: ${percentage.toFixed(0)}%`;
    }
    // Commento per Debugging
    console.log(`[DEBUG] UI Updated. Total: ${total} | Budget Limit: ${limit} | Status: ${total > limit ? 'CRITICAL' : 'OK'}`);
}

// Aggiungiamo un listener per aggiornare la barra quando il budget cambia
budgetInput.addEventListener('input', updateUI);

// 4. Aggiunta dati
addBtn.addEventListener('click', () => {
    const name = sanitizeInput(itemNameInput.value);
    const cost = parseFloat(itemCostInput.value);
    const freq = parseInt(frequencyInput.value);

    // Validazione base
    if (name && !isNaN(cost) && cost > 0) {
        expenses.push({ name, cost, freq });
        localStorage.setItem('myExpenses', JSON.stringify(expenses));
        updateUI();
        
        // Reset campi
        itemNameInput.value = '';
        itemCostInput.value = '';
    } else {
        alert("Inserisci dati validi (Nome e Costo > 0)");
    }
});

// Caricamento iniziale
updateUI();
