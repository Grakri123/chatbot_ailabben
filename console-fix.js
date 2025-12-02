// CONSOLE FIX SCRIPT - Kjør dette i nettleser-konsollen
// Åpne F12 → Console → Lim inn denne koden → Trykk Enter

console.log('🚨 STARTING EMERGENCY WIDGET FIX...');

// 1. Fjern eksisterende widget
const existingWidgets = document.querySelectorAll('.klchat-widget');
existingWidgets.forEach(w => {
    console.log('Removing existing widget:', w);
    w.remove();
});

// 2. Clear initialization
delete window.KLCHAT_INITIALIZED;
delete window.KLChatbot;

// 3. Last ny widget med ekstrem cache-busting
const cacheBust = Date.now() + Math.random().toString(36);
const script = document.createElement('script');
script.src = `https://klvarmechatbot.ailabben.no/widget.js?v=${cacheBust}&emergency=true&force=true&t=${Date.now()}`;

console.log('Loading widget from:', script.src);

script.onload = function() {
    console.log('✅ Widget script loaded successfully!');
    
    setTimeout(() => {
        if (window.KLChatbot) {
            console.log('✅ KLChatbot found, initializing...');
            window.KLChatbot.init();
            
            setTimeout(() => {
                // Check title
                const title = document.querySelector('.klchat-title');
                if (title) {
                    console.log('Widget title:', title.textContent);
                    if (title.textContent === 'KL VARME') {
                        console.log('🎉 SUCCESS! Title is correct: "KL VARME"');
                    } else {
                        console.log('❌ ERROR! Title is wrong:', title.textContent);
                    }
                } else {
                    console.log('❌ Could not find .klchat-title element');
                }
                
                // Open widget for testing
                if (window.KLChatbot.open) {
                    window.KLChatbot.open();
                    console.log('✅ Widget opened for testing');
                }
            }, 2000);
        } else {
            console.log('❌ KLChatbot not found after loading');
        }
    }, 1000);
};

script.onerror = function() {
    console.log('❌ Failed to load widget script');
};

document.head.appendChild(script);

console.log('🚀 Emergency fix script running...');
console.log('Wait 3-5 seconds for results...');
