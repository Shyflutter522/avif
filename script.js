document.getElementById('dropZone').addEventListener('dragover', (e) => {
    e.preventDefault();
    e.target.classList.add('dragover');
});

document.getElementById('dropZone').addEventListener('dragleave', (e) => {
    e.target.classList.remove('dragover');
});

document.getElementById('dropZone').addEventListener('drop', (e) => {
    e.preventDefault();
    e.target.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'image/avif')) {
        if (file.type === 'image/avif') {
            convertAvifToPng(file).then(processImage);
        } else {
            processImage(file);
        }
    } else {
        alert('Por favor, arrastra una imagen.');
    }
});

function convertAvifToPng(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function () {
            const img = new Image();
            img.src = reader.result;
            img.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(function (blob) {
                    resolve(blob);
                }, 'image/png');
            };
        };
        reader.readAsDataURL(file);
    });
}

function processImage(imageFile) {
    const reader = new FileReader();
    reader.onload = function () {
        Tesseract.recognize(reader.result, 'eng', { logger: m => console.log(m) })
            .then(({ data: { text } }) => {
                document.getElementById('translatedText').innerText = text;
                translateText(text);
            });
    };
    reader.readAsDataURL(imageFile);
}

function translateText(text) {
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const translatedText = data.responseData.translatedText;
            document.getElementById('translatedText').innerText = `Texto traducido: ${translatedText}`;
        })
        .catch(error => {
            console.error('Error al traducir:', error);
        });
}
