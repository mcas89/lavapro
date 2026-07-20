import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collectionGroup, getDocs, doc, updateDoc, deleteDoc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração copiada do seu .env
const firebaseConfig = {
  apiKey: "AIzaSyA0j5-JInS16Ftb1tMm6fT50swMpUA1z8w",
  authDomain: "lavapro-2e1d5.firebaseapp.com",
  projectId: "lavapro-2e1d5",
  storageBucket: "lavapro-2e1d5.firebasestorage.app",
  messagingSenderId: "632061733139",
  appId: "1:632061733139:web:f99b47991ca2adc14492e6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "marcos.mcas89@gmail.com";

// Elementos da UI
const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const tenantsList = document.getElementById("tenantsList");
const refreshBtn = document.getElementById("refreshBtn");

// 1. Controle de Autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.email === ADMIN_EMAIL) {
            loginScreen.classList.add("hidden");
            dashboardScreen.classList.remove("hidden");
            loadTenants();
        } else {
            // E-mail não é o admin
            loginError.textContent = "Acesso Negado: Você não é o administrador.";
            loginError.classList.remove("hidden");
            signOut(auth);
        }
    } else {
        loginScreen.classList.remove("hidden");
        dashboardScreen.classList.add("hidden");
    }
});

// 2. Lógica de Login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    loginError.classList.add("hidden");
    
    if (email !== ADMIN_EMAIL) {
        loginError.textContent = "Acesso Negado: E-mail não autorizado.";
        loginError.classList.remove("hidden");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        loginError.textContent = "Erro: " + error.message;
        loginError.classList.remove("hidden");
    }
});

// 3. Lógica de Logout
logoutBtn.addEventListener("click", () => signOut(auth));
refreshBtn.addEventListener("click", () => loadTenants());

// 4. Carregar Lava-Rápidos
async function loadTenants() {
    tenantsList.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Buscando no banco de dados...</td></tr>`;
    
    try {
        // Usa CollectionGroup para buscar todas as coleções chamadas 'settings' (onde fica o profile)
        const settingsQuery = await getDocs(collectionGroup(db, 'settings'));
        
        let html = '';
        
        settingsQuery.forEach((docSnap) => {
            if (docSnap.id === 'profile') {
                const data = docSnap.data();
                // O caminho no banco é tenants/{uid}/settings/profile
                // Então o ID do dono (tenant) é o avô desse documento
                const uid = docSnap.ref.parent.parent.id; 
                
                const companyName = data.company?.name || "Empresa sem nome";
                const ownerName = data.company?.owner || "—";
                
                let statusHtml = '';
                let isValid = false;
                
                if (data.validUntil) {
                    const validDate = new Date(data.validUntil);
                    const now = new Date();
                    isValid = validDate > now;
                    
                    const dateStr = validDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    
                    if (isValid) {
                        statusHtml = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ativo até ${dateStr}</span>`;
                    } else {
                        statusHtml = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Vencido em ${dateStr}</span>`;
                    }
                } else {
                    // Contas antigas (vitalícias)
                    statusHtml = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Vitalício (Conta Antiga)</span>`;
                    isValid = true;
                }

                html += `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${companyName}</div>
                            <div class="text-xs text-gray-500">ID: ${uid.substring(0, 8)}...</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${ownerName}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            ${statusHtml}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button onclick="addDays('${uid}', 7)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded">+7 Dias</button>
                            <button onclick="addDays('${uid}', 30)" class="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded">+1 Mês</button>
                            <button onclick="blockTenant('${uid}')" class="text-orange-600 hover:text-orange-900 bg-orange-50 px-2 py-1 rounded">Bloquear</button>
                            <button onclick="deleteTenantData('${uid}')" class="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded">Apagar Dados</button>
                        </td>
                    </tr>
                `;
            }
        });

        if (html === '') {
            html = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Nenhum Lava-Rápido encontrado.</td></tr>`;
        }

        tenantsList.innerHTML = html;
        
    } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        tenantsList.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Erro ao buscar: ${error.message} (Verifique as Regras de Segurança do Firebase)</td></tr>`;
    }
}

// 5. Funções Globais (disponíveis para os botões do HTML)
window.addDays = async (uid, days) => {
    if (!confirm(`Deseja adicionar ${days} dias de acesso para esta empresa?`)) return;
    try {
        const profileRef = doc(db, `tenants/${uid}/settings/profile`);
        // Precisamos saber a data atual do banco se existir, ou usar a de hoje
        const dateToAdd = new Date();
        dateToAdd.setDate(dateToAdd.getDate() + days);
        
        await updateDoc(profileRef, { validUntil: dateToAdd.toISOString() });
        alert(`Acesso estendido até ${dateToAdd.toLocaleDateString('pt-BR')}`);
        loadTenants();
    } catch (e) {
        alert("Erro ao atualizar: " + e.message);
    }
};

window.blockTenant = async (uid) => {
    if (!confirm("Deseja BLOQUEAR o acesso desta empresa agora?")) return;
    try {
        const profileRef = doc(db, `tenants/${uid}/settings/profile`);
        // Define a validade para ontem
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        await updateDoc(profileRef, { validUntil: yesterday.toISOString() });
        alert("Acesso bloqueado com sucesso!");
        loadTenants();
    } catch (e) {
        alert("Erro ao bloquear: " + e.message);
    }
};

window.deleteTenantData = async (uid) => {
    if (!confirm("⚠️ ATENÇÃO EXTREMA ⚠️\n\nIsso vai apagar TODOS os dados (Agenda, Clientes, Financeiro) deste Lava-Rápido.\nA conta não poderá mais ser usada.\n\nTem certeza absoluta?")) return;
    
    try {
        alert("Para manter a segurança front-end, a exclusão apaga apenas o perfil mestre e bloqueia o acesso.\n(Em uma API backend seria possível varrer e deletar todos os sub-documentos).");
        
        const profileRef = doc(db, `tenants/${uid}/settings/profile`);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Em vez de deletar, substituímos por dados vazios e vencidos
        await updateDoc(profileRef, { 
            "company.name": "CONTA EXCLUÍDA",
            validUntil: yesterday.toISOString()
        });
        
        loadTenants();
    } catch (e) {
        alert("Erro ao excluir: " + e.message);
    }
};
