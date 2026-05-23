// 1. Inizializzazione: recuperiamo i dati o creiamo un array vuoto
let expenses = JSON.parse(localStorage.getItem('myExpenses')) || [];

const itemNameInput = document.getElementById('itemName');
const itemCostInput = document.getElementById('itemCost');
const frequencyInput = document.getElementById('frequency');
const addBtn = document.getElementById('addBtn');
const listDisplay = document.getElementById('list');
const totalDisplay = document.getElementById('total-display');

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

    expenses.forEach((item, index) => {
        // Calcolo: il moltiplicatore (12 o 1) è già nel value della select
        const annualCost = item.cost * item.freq;
        total += annualCost;

        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} (${item.freq === 12 ? 'Mensile' : 'Annuale'})</span>
            <span>€${item.cost}</span>
        `;
        listDisplay.appendChild(li);
    });

    totalDisplay.textContent = `Totale Annuo: €${total.toFixed(2)}`;
}

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