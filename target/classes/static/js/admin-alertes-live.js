// Script de polling AJAX pour alertes dynamiques
let alertesData = [];
let currentAlerteIndex = 0;
let lastAlertesIds = [];

function renderAlertes(alertes) {
    const container = document.querySelector('.alerts-list');
    if (!container) return;
    container.innerHTML = '';
    if (!alertes || alertes.length === 0) {
        container.innerHTML = '<div style="color:#888; padding:1em;">Aucune alerte récente.</div>';
        return;
    }
    alertes.forEach(a => {
        const div = document.createElement('div');
        div.className = 'alert-item';
        div.style.minHeight = '70px';
        div.style.padding = '12px 0';
        if (a.type === 'temp-basse' || a.type === 'humidite-haute') div.classList.add('warning');
        if (a.type === 'couvercle-ouvert') div.classList.add('info');
        div.innerHTML = `
            <i class="fa-solid ${a.icone}"></i>
            <div class="alert-content">
                <h4>${a.titre}</h4>
                <p>
                    ${a.ruche}
                    ${a.valeur ? ' - <span>' + a.valeur + '</span>' : ''}
                    ${a.heure ? ' - <span style=\'color:#aaa;font-size:0.95em;\'>' + a.heure + '</span>' : ''}
                </p>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderAlertesSlider(alertes) {
    alertesData = alertes || [];
    const container = document.querySelector('.card-alertes .alerts-list');
    if (!container) return;
    container.innerHTML = '';
    if (!alertesData.length) {
        container.innerHTML = '<div style="color:#888; padding:1em;">Aucune alerte récente.</div>';
        return;
    }
    // Affiche l'alerte courante
    const a = alertesData[currentAlerteIndex] || alertesData[0];
    const div = document.createElement('div');
    div.className = 'alert-item';
    div.style.minHeight = '70px';
    div.style.padding = '12px 0';
    if (a.type === 'temp-haute') div.classList.add('warning');
    if (a.type === 'humidite-haute') div.classList.add('warning');
    if (a.type === 'humidite-basse') div.classList.add('info');
    if (a.type === 'couvercle-ouvert') div.classList.add('info');
    div.innerHTML = `
        <i class="fa-solid ${a.icone}" style="font-size:1.5em; margin-right:10px;"></i>
        <div class="alert-content" style="display:inline-block; vertical-align:middle;">
            <h4 style="margin:0; font-size:1.1em; color:#bfa900;">${a.titre}</h4>
            <p style="margin:0; color:#444;">
                ${a.ruche}
                ${a.valeur ? ' - <span>' + a.valeur + '</span>' : ''}
                ${a.heure ? ' - <span style=\'color:#aaa;font-size:0.95em;\'>' + a.heure + '</span>' : ''}
            </p>
        </div>
    `;
    container.appendChild(div);
}

function showPrevAlerte() {
    if (!alertesData.length) return;
    currentAlerteIndex = (currentAlerteIndex - 1 + alertesData.length) % alertesData.length;
    renderAlertesSlider(alertesData);
}
function showNextAlerte() {
    if (!alertesData.length) return;
    currentAlerteIndex = (currentAlerteIndex + 1) % alertesData.length;
    renderAlertesSlider(alertesData);
}

document.addEventListener('DOMContentLoaded', function() {
    const leftBtn = document.querySelector('.card-alertes .slider-arrow.left');
    const rightBtn = document.querySelector('.card-alertes .slider-arrow.right');
    if (leftBtn) leftBtn.addEventListener('click', showPrevAlerte);
    if (rightBtn) rightBtn.addEventListener('click', showNextAlerte);
    fetchAlertes();
});

function fetchAlertes() {
    fetch('/api/alertes', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(alertes => {
            // Si l'alerte courante n'existe plus, reset l'index
            if (currentAlerteIndex >= alertes.length) currentAlerteIndex = 0;
            renderAlertesSlider(alertes);
        })
        .catch(() => {});
}

setInterval(fetchAlertes, 1000);

function showToastAlerte(message) {
    let toast = document.createElement('div');
    toast.className = 'alert-toast';
    toast.style.position = 'fixed';
    toast.style.top = '32px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#ffe066';
    toast.style.color = '#222';
    toast.style.fontWeight = 'bold';
    toast.style.fontSize = '1.2em';
    toast.style.padding = '18px 36px';
    toast.style.borderRadius = '16px';
    toast.style.boxShadow = '0 4px 24px #ffd70055';
    toast.style.zIndex = 9999;
    toast.style.opacity = '0.98';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

function renderAlertesScroll(alertes) {
    const container = document.querySelector('.alerts-list');
    if (!container) return;
    container.innerHTML = '';
    if (!alertes || !alertes.length) {
        container.innerHTML = '<div style="color:#888; padding:1em;">Aucune alerte récente.</div>';
        lastAlertesIds = [];
        return;
    }
    // Détecte nouvelle alerte (par id unique : ruche+type+heure)
    const ids = alertes.map(a => (a.ruche||'')+'-'+(a.type||'')+'-'+(a.heure||''));
    if (lastAlertesIds.length && ids[0] && !lastAlertesIds.includes(ids[0])) {
        showToastAlerte('Nouvelle alerte : ' + alertes[0].titre + (alertes[0].ruche ? ' ('+alertes[0].ruche+')' : ''));
    }
    lastAlertesIds = ids;
    alertes.forEach((a, idx) => {
        const div = document.createElement('div');
        div.className = 'alert-item';
        div.style.minHeight = '70px';
        div.style.padding = '12px 0';
        div.style.marginBottom = '18px';
        if (a.type === 'temp-haute') div.classList.add('warning');
        if (a.type === 'humidite-haute') div.classList.add('warning');
        if (a.type === 'humidite-basse') div.classList.add('info');
        if (a.type === 'couvercle-ouvert') div.classList.add('info');
        div.innerHTML = `
            <i class="fa-solid ${a.icone}"></i>
            <div class="alert-content">
                <h4>${a.titre}</h4>
                <p>
                    ${a.ruche}
                    ${a.valeur ? ' - <span>' + a.valeur + '</span>' : ''}
                    ${a.heure ? ' - <span style=\'color:#aaa;font-size:0.98em;\'>' + a.heure + '</span>' : ''}
                </p>
            </div>
        `;
        container.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetchAlertes();
});

function fetchAlertes() {
    fetch('/api/alertes', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(renderAlertesScroll)
        .catch(() => {});
}

setInterval(fetchAlertes, 1000); 