const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 700;

// Oyun değişkenleri
let score = 0;
let gameRunning = true;
let crosshairX = canvas.width / 2;
let crosshairY = canvas.height / 2;
let currentWeapon = 0;

// Silahlar
const weapons = [
    { name: 'Tüfek', damage: 10, ammo: 30, maxAmmo: 30, fireRate: 300 },
    { name: 'Shotgun', damage: 25, ammo: 15, maxAmmo: 15, fireRate: 500 },
    { name: 'Sniper', damage: 50, ammo: 10, maxAmmo: 10, fireRate: 800 },
    { name: 'Makinalı Tüfek', damage: 5, ammo: 120, maxAmmo: 120, fireRate: 50 },
    { name: 'Tüfek Granatlı', damage: 30, ammo: 20, maxAmmo: 20, fireRate: 600 }
];

let currentWeaponObj = weapons[currentWeapon];
let lastFireTime = 0;

// Ev nesneleri
class Building {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = 100;
        this.windows = [
            { x: x + 30, y: y + 20, width: 40, height: 40, broken: false },
            { x: x + 100, y: y + 20, width: 40, height: 40, broken: false },
            { x: x + 30, y: y + 90, width: 40, height: 40, broken: false },
            { x: x + 100, y: y + 90, width: 40, height: 40, broken: false }
        ];
    }

    draw() {
        // Duvar
        ctx.fillStyle = '#CD5C5C';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Pencereler
        this.windows.forEach(window => {
            if (!window.broken) {
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(window.x, window.y, window.width, window.height);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(window.x, window.y, window.width, window.height);
                // Cam çizgileri
                ctx.beginPath();
                ctx.moveTo(window.x + window.width / 2, window.y);
                ctx.lineTo(window.x + window.width / 2, window.y + window.height);
                ctx.moveTo(window.x, window.y + window.height / 2);
                ctx.lineTo(window.x + window.width, window.y + window.height / 2);
                ctx.stroke();
            } else {
                // Kırılmış cam
                ctx.fillStyle = 'rgba(135, 206, 235, 0.2)';
                ctx.fillRect(window.x, window.y, window.width, window.height);
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 1;
                ctx.strokeRect(window.x, window.y, window.width, window.height);
            }
        });
    }

    hit(x, y, damage) {
        // Pencereleri kontrol et
        for (let window of this.windows) {
            if (x > window.x && x < window.x + window.width &&
                y > window.y && y < window.y + window.height) {
                if (!window.broken) {
                    window.broken = true;
                    return true; // Cam kırıldı
                }
            }
        }
        
        // Duvara çarpma
        if (x > this.x && x < this.x + this.width &&
            y > this.y && y < this.y + this.height) {
            this.health -= damage;
            return true;
        }
        return false;
    }
}

// İçinde yer alan duvarlar ve evler
let buildings = [
    new Building(150, 200, 180, 180),
    new Building(450, 150, 180, 180),
    new Building(750, 200, 180, 180),
    new Building(300, 450, 180, 180),
    new Building(700, 450, 180, 180)
];

// Ateş etme
function fire() {
    const now = Date.now();
    if (now - lastFireTime < currentWeaponObj.fireRate) return;
    if (currentWeaponObj.ammo <= 0) return;

    lastFireTime = now;
    currentWeaponObj.ammo--;

    // Çarpışma kontrolü
    let hit = false;
    for (let building of buildings) {
        if (building.hit(crosshairX, crosshairY, currentWeaponObj.damage)) {
            hit = true;
            score += 5;
            break;
        }
    }

    if (hit) {
        // Patlama efekti
        ctx.fillStyle = 'rgba(255, 165, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(crosshairX, crosshairY, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    updateHUD();
}

// Nişangah çizme
function drawCrosshair() {
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;

    // Dış daire
    ctx.beginPath();
    ctx.arc(crosshairX, crosshairY, 20, 0, Math.PI * 2);
    ctx.stroke();

    // İç X
    ctx.beginPath();
    ctx.moveTo(crosshairX - 15, crosshairY - 15);
    ctx.lineTo(crosshairX + 15, crosshairY + 15);
    ctx.moveTo(crosshairX + 15, crosshairY - 15);
    ctx.lineTo(crosshairX - 15, crosshairY + 15);
    ctx.stroke();

    // Çizgiler
    ctx.beginPath();
    ctx.moveTo(crosshairX - 30, crosshairY);
    ctx.lineTo(crosshairX - 20, crosshairY);
    ctx.moveTo(crosshairX + 20, crosshairY);
    ctx.lineTo(crosshairX + 30, crosshairY);
    ctx.moveTo(crosshairX, crosshairY - 30);
    ctx.lineTo(crosshairX, crosshairY - 20);
    ctx.moveTo(crosshairX, crosshairY + 20);
    ctx.lineTo(crosshairX, crosshairY + 30);
    ctx.stroke();
}

// HUD güncelle
function updateHUD() {
    document.getElementById('weapon-name').textContent = currentWeaponObj.name;
    document.getElementById('ammo-count').textContent = `${currentWeaponObj.ammo}/${currentWeaponObj.maxAmmo}`;
    document.getElementById('score').textContent = score;
}

// Ana oyun döngüsü
function gameLoop() {
    // Arka plan
    ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Binaları çiz
    for (let building of buildings) {
        building.draw();
    }

    // Nişangah çiz
    drawCrosshair();

    // Oyun devam et
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Fare hareketi
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    crosshairX = e.clientX - rect.left;
    crosshairY = e.clientY - rect.top;
});

// Fare tıklaması
canvas.addEventListener('click', () => {
    fire();
});

// Tuş kontrolleri
document.addEventListener('keydown', (e) => {
    // Silah seçimi (1-5)
    if (e.key >= '1' && e.key <= '5') {
        currentWeapon = parseInt(e.key) - 1;
        if (currentWeapon < weapons.length) {
            currentWeaponObj = weapons[currentWeapon];
            updateHUD();
        }
    }

    // R = Yeniden başla
    if (e.key.toUpperCase() === 'R') {
        score = 0;
        currentWeapon = 0;
        currentWeaponObj = weapons[0];
        weapons.forEach(w => {
            w.ammo = w.maxAmmo;
        });
        buildings = [
            new Building(150, 200, 180, 180),
            new Building(450, 150, 180, 180),
            new Building(750, 200, 180, 180),
            new Building(300, 450, 180, 180),
            new Building(700, 450, 180, 180)
        ];
        updateHUD();
    }

    // SPACE = Yeniden yükle
    if (e.code === 'Space') {
        currentWeaponObj.ammo = currentWeaponObj.maxAmmo;
        updateHUD();
    }
});

// Oyunu başlat
update HUD();
gameLoop();
