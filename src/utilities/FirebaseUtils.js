import { collection, addDoc, getDoc, updateDoc, doc, query, where, getDocs, deleteDoc, arrayUnion, setDoc } from "firebase/firestore";
import db from '../firebase/FirebaseDB'

async function retrieveGarden(gardenId) {
    try {
        const gardenRef = doc(db, 'gardens', gardenId);
        const gardenSnap = await getDoc(gardenRef);
        if (gardenSnap.exists()) {
            return gardenSnap.data();
        }
        throw new Error('Garden not found.');
    } catch (e) {
        console.error(`Error retrieving garden with ID: ${gardenId}; `, e);
    }
}

async function retrieveGardens(uid) {
    try {
        const gardensRef = collection(db, 'gardens');
        const userRef = doc(db, 'users', uid);
        const data = await getDoc(userRef);
        if (!data.exists) {
            throw new Error('User gardens snapshot not found.');
        } else {
            const q = query(gardensRef, where('id', 'in', data.data().gardens));
            const querySnapshot = await getDocs(q);
            const gardens = querySnapshot.docs.map((doc) => ({ ...doc.data() }));
            return gardens;
        }
    } catch (e) {
        console.error("Error fetching gardens:", e);
        return null;
    }
}

async function retrieveUser(uid) {
    try {
        const userRef = doc(db, 'users', uid);
        const data = await getDoc(userRef);
        if (!data.exists) {
            throw new Error('User now found.');
        } else {
            return data.data();
        }
    } catch (e) {
        console.error("Error fetching user data:", e);
        return null;
    }
};

async function clearGardens(uid, gardens) {
    try {
        const userRef = doc(db, 'users', uid);
        const gardensRef = collection(db, 'gardens');

        const q = query(gardensRef, where('id', 'in', gardens));
        const querySnapshot = await getDocs(q);

        // Remove gardens from gardens collection
        querySnapshot.forEach((docSnap) => {
            console.log(`Deleting Garden with ID: ${docSnap.id}.`);
            const docRef = doc(gardensRef, docSnap.id);
            deleteDoc(docRef);
        });

        // Remove garden ids from user document
        updateDoc(userRef, { gardens: [] });

        return true;

    } catch (e) {
        console.error("Error clearing gardens:", e);
        return false;
    }
}

async function createGarden(uid, garden) {
    try {
        // Add new garden to gardens collection
        const gardenRef = await addDoc(collection(db, 'gardens'), {
            ...garden
        });

        // Update new garden with id.
        garden.id = gardenRef.id;
        await updateDoc(gardenRef, { id: gardenRef.id });

        // Add garden id to user's garden list.
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { gardens: arrayUnion(garden.id) });

        // Set local garden id and gardens data.
        const existingGardens = JSON.parse(localStorage.getItem("gardens")) || [];
        const updatedGardens = [...existingGardens, garden];
        localStorage.setItem("gardens", JSON.stringify(updatedGardens));

        console.log(`New Garden written to Local Storage with id: ${gardenRef.id}}`);
        return garden.id;
    } catch (e) {
        console.error(`Error creating new garden: ${garden.name}`, e);
        return null;
    }
}

async function updateGarden(id, newGarden) {
    try {
        if (id !== newGarden.id) {
            throw Error(`Ids don't match: ${id} vs ${newGarden.id} `);
        }
        const gardenRef = doc(db, 'gardens', id);
        await setDoc(gardenRef, newGarden);
        console.log(`Saved garden with ID: ${id}}`);
        return true;
    } catch(e) {
        console.error(`Error saving garden: ${newGarden.name}`, e);
        return false;
    }
    
}

export { retrieveGarden, retrieveGardens, retrieveUser, clearGardens, createGarden, updateGarden };