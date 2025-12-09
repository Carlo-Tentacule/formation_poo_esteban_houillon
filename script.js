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
    constructor(title, categorie, level, duration) {
        this.id = Date.now(); 
        this.title = title;
        this.categorie = categorie;
        this.level = level;
        this.duration = duration;
    }
}

const formationManager = new LocalStorageManager('formations');

function addListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const idToDelete = Number(this.dataset.id); 
            
            if (confirm(`Êtes-vous sûr de vouloir supprimer cette formation ?`)) {
                if (formationManager.delete(idToDelete)) {
                    console.log('Formation supprimée !');
                    showFormations();
                } else {
                    console.error('Erreur: Formation non trouvée.');
                }
            }
        });
    });
    document.querySelectorAll('.update-btn').forEach(button => {
        button.addEventListener('click', function() {
            const idToUpdate = Number(this.dataset.id); 
            const formationToUpdate = formationManager.readOne(idToUpdate);
            
            if (formationToUpdate) {
                fillForm(formationToUpdate); 
            } else {
                alert('Erreur: Formation introuvable pour modification.');
            }
        });
    });
}

function showFormations() {
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
                <strong>${formation.title}</strong> 
                (Cat: ${formation.categorie} | Niveau: ${formation.level} | Durée: ${formation.duration}h)
            </div>
            <div class="actions">
                <button class="delete-btn" data-id="${formation.id}">Supprimer</button>
                <button class="update-btn" data-id="${formation.id}">Modifier</button>
            </div>
        `;
        
        listeUl.appendChild(li);
    });

    addListeners();
}

const submitButton = document.getElementById('submitButton');
const updateInput = document.getElementById('formationId');

function fillForm(formation) {
    document.getElementById('title').value = formation.title;
    document.getElementById('categorie').value = formation.categorie;
    document.getElementById('level').value = formation.level;
    document.getElementById('duration').value = formation.duration;
    
    updateInput.value = formation.id;
    
    switchForm('edit');
}

function switchForm(mode) {
    if (mode === 'edit') {
        submitButton.value = "Modifier";
        submitButton.style.backgroundColor = 'orange';
    } else {
        submitButton.value = "Ajouter";
        submitButton.style.backgroundColor = '';
        document.getElementById('formationForm').reset();
        updateInput.value = '';
    }
}

document.getElementById('formationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const editId = updateInput.value;

    const title = document.getElementById('title').value;
    const categorie = document.getElementById('categorie').value;
    const level = document.getElementById('level').value;
    const duration = document.getElementById('duration').value;

    let formation;

    if (editId) {
        formation = new Formation(title, categorie, level, duration);
        formation.id = Number(editId);
        
        if (formationManager.update(formation)) {
            console.log('Formation mise à jour avec succès !');
        } else {
            console.log('Erreur lors de la mise à jour.');
        }

        switchForm('create');

        this.reset();
        window.location.reload();
        
    } else {
        formation = new Formation(title, categorie, level, duration);
        formationManager.create(formation);
        this.reset();
    }

    showFormations();
});

document.addEventListener('DOMContentLoaded', showFormations);