Budget-Watchdog
Minimalist web application for tracking recurring expenses and optimizing personal financial planning.

Features
Offline-First: All data is saved locally using the browser's localStorage.
Design Philosophy: The application is built with an 'Offline-First' approach. By excluding external dependencies like currency conversion APIs, the project ensures 100% uptime, zero latency, and enhanced user privacy.

Input Sanitization: Built-in hardening to prevent XSS attacks during data entry.

Clean UI: Professional dark-mode design for high readability.

Annual Calculation: Automatically converts costs into a unified annual view to track burn-rate effectively.

Tech Stack
HTML5 & Vanilla CSS

Vanilla JavaScript (No external frameworks or libraries)

Security & Hardening
The application treats all user inputs as untrusted data, utilizing sanitization methods to ensure browser safety. Designed for privacy-focused usage with zero backend dependencies.

How to run
Simply open index.html in any modern web browser. No installation or server required.

# Budget-Watchdog 

Budget-Watchdog è una Web Application "Offline-First" progettata per il monitoraggio della propria esposizione finanziaria. 
L'obiettivo è fornire una visione chiara e immediata del budget annuale, con alert visivi in caso di superamento delle soglie impostate.

## Tecnologie Utilizzate
* **Frontend:** HTML5, CSS3 (Flexbox), JavaScript (Vanilla).
* **Storage:** localStorage API (nessun database esterno richiesto).
* **Hardening:** Input sanitization per prevenire vulnerabilità XSS.

## Funzionalità Principali
* **CRUD Operations:** Aggiunta, visualizzazione ed eliminazione rapida delle spese.
* **Smart Monitoring:** Calcolo automatico del totale annuo basato su frequenza (Mensile/Annuale).
* **Visual Alerts:** Barra di progresso dinamica che cambia stato al superamento del budget.
* **Privacy-Focused:** Elaborazione dati interamente locale, zero tracking.

## Deployment
Il progetto è ospitato su **GitHub Pages**: [https://thealegit.github.io/Budget-Watchdog/](https://thealegit.github.io/Budget-Watchdog/)