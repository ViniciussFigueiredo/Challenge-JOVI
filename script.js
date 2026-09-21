let totalCapacity = 30.0;
let usedSeguras = 24.2;
let usedOtimizavel = 3.4;
let freeSpace = 2.4;

let selectedImageId = null;

let mediaDatabase = [
    { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', tag: 'Viagens', isDuplicate: true, inCloud: false },
    { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', tag: 'Viagens', isDuplicate: true, inCloud: false },
    { id: 3, type: 'image', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', tag: 'Comidas', isDuplicate: false, inCloud: true },
    { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600', tag: 'Pessoas', isDuplicate: false, inCloud: false },
    { id: 5, type: 'image', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600', tag: 'Pessoas', isDuplicate: false, inCloud: true },
    { id: 6, type: 'image', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600', tag: 'Pessoas', isDuplicate: false, inCloud: false },
    { id: 7, type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600', tag: 'Prints', isDuplicate: false, inCloud: false },
    { id: 8, type: 'image', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600', tag: 'Comidas', isDuplicate: false, inCloud: true },
];

let trashDatabase = [];

function updateStorageUI() {
    const totalUsed = usedSeguras + usedOtimizavel;
    const usedPercent = Math.min(100, ((totalUsed / totalCapacity) * 100)).toFixed(1);
    
    document.getElementById('storagePercentText').innerText = `${usedPercent}%`;

    const pctSeguras = ((usedSeguras / totalCapacity) * 100).toFixed(1);
    const pctOtimizavel = ((usedOtimizavel / totalCapacity) * 100).toFixed(1);

    document.getElementById('barSeguras').style.width = `${pctSeguras}%`;
    document.getElementById('barOtimizavel').style.width = `${pctOtimizavel}%`;
    document.getElementById('barLivre').style.width = `${Math.max(0, (100 - pctSeguras - pctOtimizavel)).toFixed(1)}%`;

    document.getElementById('textSeguras').innerText = `${Math.max(0, usedSeguras).toFixed(1)} GB`;
    document.getElementById('textOtimizavel').innerText = `${Math.max(0, usedOtimizavel).toFixed(1)} GB`;
    document.getElementById('textLivre').innerText = `${Math.max(0, freeSpace).toFixed(1)} GB`;

    const btn = document.getElementById('btnLiberar');
    if (usedOtimizavel > 0) {
        btn.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 text-sm transition transform active:scale-95 cursor-pointer';
        btn.innerText = `Liberar ${usedOtimizavel.toFixed(1)} GB Agora`;
        btn.onclick = openModal;
    } else {
        btn.className = 'w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm cursor-default';
        btn.innerText = '✔ Celular Otimizado';
        btn.onclick = null;
    }
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (document.getElementById('viewGallery').classList.contains('hidden')) {
        switchTab('galeria');
    }

    if (!query) {
        renderGallery(mediaDatabase);
        return;
    }

    const filtered = mediaDatabase.filter(m => m.tag.toLowerCase().includes(query));
    renderGallery(filtered);
}

function renderGallery(items) {
    const grid = document.getElementById('mediaGrid');
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = `<p class="col-span-3 text-center text-xs text-gray-400 py-10">Nenhuma mídia encontrada.</p>`;
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'relative aspect-square rounded-lg overflow-hidden group shadow-sm bg-gray-200 cursor-pointer';
        card.onclick = () => openImagePreview(item.id);
        
        card.innerHTML = `
            <img src="${item.url}" class="w-full h-full object-cover">
            ${item.isDuplicate ? `<span class="absolute top-1 left-1 bg-amber-400/90 text-gray-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded backdrop-blur-sm">Duplicada</span>` : ''}
            ${item.inCloud ? `<i data-lucide="cloud" class="absolute top-1 right-1 w-3.5 h-3.5 text-white drop-shadow-md"></i>` : ''}
        `;
        grid.appendChild(card);
    });
    lucide.createIcons();
}

function openImagePreview(id) {
    const item = mediaDatabase.find(m => m.id === id);
    if (!item) return;

    selectedImageId = id;
    document.getElementById('previewImg').src = item.url;
    document.getElementById('previewTag').innerText = item.tag;
    document.getElementById('modalImagePreview').classList.remove('hidden');
}

function closeImagePreview() {
    selectedImageId = null;
    document.getElementById('modalImagePreview').classList.add('hidden');
}

function deleteSingleImage() {
    if (!selectedImageId) return;

    const index = mediaDatabase.findIndex(m => m.id === selectedImageId);
    if (index !== -1) {
        const removed = mediaDatabase.splice(index, 1)[0];
        trashDatabase.push(removed);

        freeSpace += 0.1;
        if (removed.isDuplicate) {
            usedOtimizavel = Math.max(0, usedOtimizavel - 0.1);
        } else {
            usedSeguras = Math.max(0, usedSeguras - 0.1);
        }

        updateStorageUI();
        closeImagePreview();
        renderGallery(mediaDatabase);
    }
}

function renderAlbums() {
    const grid = document.getElementById('albumsGrid');
    grid.innerHTML = '';

    const categories = ['Pessoas', 'Comidas', 'Viagens', 'Prints'];

    categories.forEach(category => {
        const items = mediaDatabase.filter(m => m.tag === category);
        
        let previewImages = items.map(i => i.url);
        while (previewImages.length < 4 && mediaDatabase.length > 0) {
            previewImages.push(mediaDatabase[previewImages.length % mediaDatabase.length].url);
        }

        const albumCard = document.createElement('div');
        albumCard.className = 'flex flex-col items-center cursor-pointer group';
        albumCard.onclick = () => {
            switchTab('galeria');
            filterByTag(category);
        };

        albumCard.innerHTML = `
            <div class="w-full aspect-square grid grid-cols-2 grid-rows-2 gap-0.5 rounded-xl overflow-hidden bg-gray-200 shadow-sm border border-gray-100 group-hover:opacity-90 transition">
                <img src="${previewImages[0]}" class="w-full h-full object-cover">
                <img src="${previewImages[1]}" class="w-full h-full object-cover">
                <img src="${previewImages[2]}" class="w-full h-full object-cover">
                <img src="${previewImages[3]}" class="w-full h-full object-cover">
            </div>
            <span class="text-xs font-semibold text-blue-600 mt-1.5 group-hover:underline">${category}</span>
        `;
        grid.appendChild(albumCard);
    });
}

function filterByTag(tagName) {
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.innerText.trim() === tagName) {
            btn.className = 'filter-btn active bg-blue-600 text-white px-3.5 py-1.5 rounded-lg font-medium shadow-sm transition';
        } else {
            btn.className = 'filter-btn bg-white text-blue-600 border border-blue-200 px-3.5 py-1.5 rounded-lg font-medium hover:bg-blue-50 transition';
        }
    });

    if (tagName === 'Todos') {
        renderGallery(mediaDatabase);
    } else {
        const filtered = mediaDatabase.filter(m => m.tag === tagName);
        renderGallery(filtered);
    }
}

function updateNavStyles(activeTab) {
    const tabs = ['camera', 'galeria', 'album', 'limpeza'];
    tabs.forEach(tab => {
        const btn = document.getElementById(`nav-${tab}`);
        if (btn) {
            if (tab === activeTab) {
                btn.className = 'nav-item text-blue-600 flex flex-col items-center space-y-0.5 w-1/4 font-semibold';
            } else {
                btn.className = 'nav-item text-gray-500 flex flex-col items-center space-y-0.5 w-1/4 font-normal';
            }
        }
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));

    const title = document.getElementById('pageTitle');
    const tagFilters = document.getElementById('tagFilters');

    updateNavStyles(tabName);

    if (tabName === 'galeria') {
        document.getElementById('viewGallery').classList.remove('hidden');
        tagFilters.classList.remove('hidden');
        title.innerText = 'Galeria';
        renderGallery(mediaDatabase);
    } else if (tabName === 'album') {
        document.getElementById('viewAlbums').classList.remove('hidden');
        tagFilters.classList.add('hidden');
        title.innerText = 'Álbuns';
        renderAlbums();
    } else if (tabName === 'limpeza') {
        document.getElementById('viewLimpeza').classList.remove('hidden');
        tagFilters.classList.add('hidden');
        title.innerText = 'Limpeza';
    } else if (tabName === 'camera') {
        document.getElementById('viewCamera').classList.remove('hidden');
        tagFilters.classList.add('hidden');
        title.innerText = 'Câmara';
    } else if (tabName === 'lixeira') {
        document.getElementById('viewLixeira').classList.remove('hidden');
        tagFilters.classList.add('hidden');
        title.innerText = 'Lixeira';
        renderTrash();
    }
}

function openModal() {
    if (usedOtimizavel <= 0) return;
    document.querySelector('#modalLimpeza h3').innerText = `Liberar ${usedOtimizavel.toFixed(1)} GB`;
    document.getElementById('modalLimpeza').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modalLimpeza').classList.add('hidden');
}

function executeOptimization() {
    closeModal();

    const duplicateGroups = {};
    mediaDatabase.forEach(item => {
        if (item.isDuplicate) {
            if (!duplicateGroups[item.url]) {
                duplicateGroups[item.url] = [];
            }
            duplicateGroups[item.url].push(item);
        }
    });

    Object.values(duplicateGroups).forEach(group => {
        if (group.length > 0) {
            group[0].isDuplicate = false;

            for (let i = 1; i < group.length; i++) {
                trashDatabase.push(group[i]);
                const index = mediaDatabase.indexOf(group[i]);
                if (index !== -1) {
                    mediaDatabase.splice(index, 1);
                }
            }
        }
    });

    mediaDatabase.forEach(item => {
        if (item.isDuplicate) {
            item.isDuplicate = false;
        }
    });

    freeSpace += usedOtimizavel;
    usedOtimizavel = 0;

    updateStorageUI();
    renderGallery(mediaDatabase);
}

function renderTrash() {
    const grid = document.getElementById('trashGrid');
    grid.innerHTML = '';
    
    if (trashDatabase.length === 0) {
        grid.innerHTML = `<p class="col-span-3 text-center text-xs text-gray-400 py-10">Lixeira vazia.</p>`;
        return;
    }

    trashDatabase.forEach(item => {
        const card = document.createElement('div');
        card.className = 'relative aspect-square rounded-lg overflow-hidden bg-gray-200 opacity-60';
        card.innerHTML = `<img src="${item.url}" class="w-full h-full object-cover">`;
        grid.appendChild(card);
    });
}

function capturePhoto() {
    const photoSize = 0.2; 
    const newMedia = {
        id: Date.now(),
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
        tag: 'Viagens',
        isDuplicate: true, 
        inCloud: false
    };

    mediaDatabase.unshift(newMedia);

    if (freeSpace >= photoSize) {
        freeSpace -= photoSize;
    }
    usedOtimizavel += photoSize;

    updateStorageUI();
    alert('Foto tirada! Armazenamento e recomendações de limpeza atualizados.');
    switchTab('galeria');
}

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateStorageUI();
    renderGallery(mediaDatabase);
});