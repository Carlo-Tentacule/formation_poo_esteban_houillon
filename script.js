// CRUD
class LocalStorageManager {
    constructor(storageKey) {
        if (!storageKey) {
            throw new Error("storageKey est requis");
        }
        this.storageKey = storageKey;
    }

    create(item) {
        const items = this.readAll();
        items.push(item);
        this.#save(items);
    }

    readAll() {
        const historiqueJSON = localStorage.getItem(this.storageKey);
        return historiqueJSON ? JSON.parse(historiqueJSON) : [];
    }

    readOne(id) {
        return this.readAll().find(item => item.id === id);
    }

    update(updatedItem) {
        let items = this.readAll();
        const index = items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
            items[index] = updatedItem;
            this.#save(items);
            return true;
        }
        return false;
    }

    delete(idToDelete) {
        let items = this.readAll();
        const itemsFiltered = items.filter(item => item.id !== idToDelete);
        
        if (itemsFiltered.length !== items.length) {
            this.#save(itemsFiltered);
            return true;
        }
        return false;
    }

    #save(itemsArray) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(itemsArray));
            console.log(`Collection '${this.storageKey}' sauvegardée.`);
        } catch (e) {
            console.error('Erreur lors de la sauvegarde dans localStorage:', e);
        }
    }
}

class Formation {
    constructor(titre, categorie, niveau, temp) {
        this.id = Date.now(); 
        this.titre = titre;
        this.categorie = categorie;
        this.niveau = niveau;
        this.temp = temp;
    }
}

const formationManager = new LocalStorageManager('formations');

function attacherEcouteurs() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const idToDelete = Number(this.dataset.id); 
            
            if (confirm(`Êtes-vous sûr de vouloir supprimer cette formation ?`)) {
                if (formationManager.delete(idToDelete)) {
                    console.log('Formation supprimée !');
                    afficherListeFormations();
                } else {
                    console.error('Erreur: Formation non trouvée.');
                }
            }
        });
    });
}

function afficherListeFormations() {
    const listeUl = document.getElementById('formationsList');
    listeUl.innerHTML = '';
    
    const formations = formationManager.readAll();

    if (formations.length === 0) {
        listeUl.innerHTML = '<p>Aucune formation enregistrée.</p>';
        return;
    }

    formations.forEach(formation => {
        const li = document.createElement('li');
        
        li.innerHTML = `
            <div>
                <strong>${formation.titre}</strong> 
                (Cat: ${formation.categorie} | Niveau: ${formation.niveau} | Durée: ${formation.temp}h)
            </div>
            <div class="actions">
                <button class="delete-btn" data-id="${formation.id}">Supprimer</button>
            </div>
        `;
        
        listeUl.appendChild(li);
    });

    attacherEcouteurs();
}

document.getElementById('formationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const categorie = document.getElementById('categorie').value;
    const level = document.getElementById('level').value;
    const duration = document.getElementById('duration').value;

    const nouvelleFormation = new Formation(title, categorie, level, duration);

    formationManager.create(nouvelleFormation);

    this.reset();
    afficherListeFormations();
});

document.addEventListener('DOMContentLoaded', afficherListeFormations);