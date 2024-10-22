document.getElementById('fileInput').addEventListener('change', handleFile, false);

function handleFile(event) {
    const file = event.target.files[0];
    if (file && file.type === 'image/avif') {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                extractTextFromImage(img);
            };
        };
        reader.readAsDataURL(file);
    } else {
        alert('Por favor, selecciona una imagen .avif.');
    }
}

function extractTextFromImage(image) {
    Tesseract.recognize(
        image,
        'eng',
        { logger: info => console.log(info) }
    ).then(({ data: { text } }) => {
        translateText(text);
    });
}

function translateText(text) {
    const url = 'https://api.libretranslate.com/translate';
    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            q: text,
            source: 'en',
            target: 'es',
            format: 'text'
        }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('output').textContent = `Traducción: ${data.translatedText}`;
    })
    .catch(error => console.error('Error en la traducción:', error));
}
