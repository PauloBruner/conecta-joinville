let usuarioAtual = null;

configurarLogout("btn-logout");

exigirLogin((user, perfil) => {
    usuarioAtual = user;
    const nome = (perfil && perfil.nome) || user.displayName || "Visitante";
    document.getElementById("saudacao").textContent = `Olá, ${nome} 👋`;

    carregarStats();
    carregarNecessidades();
});

function initMap() {
    const joinville = { lat: -26.3044, lng: -48.8487 };
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: joinville,
    });
    new google.maps.Marker({ position: joinville, map: map });
}
window.initMap = initMap;

async function carregarStats() {
    try {
        const [ajudasSnap, necessidadesSnap, perfisSnap] = await Promise.all([
            db.collection("ajudas").get(),
            db.collection("necessidades").get(),
            db.collection("perfis").get(),
        ]);
        document.getElementById("total-ajudas").textContent = ajudasSnap.size;
        document.getElementById("total-necessidades").textContent = necessidadesSnap.size;
        document.getElementById("total-usuarios").textContent = perfisSnap.size;
    } catch (e) {
        console.error("Erro ao carregar estatísticas:", e);
    }
}

async function carregarNecessidades() {
    const container = document.getElementById("lista-necessidades");
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get("tipo");

    try {
        const snap = await db.collection("necessidades").orderBy("criadoEm", "desc").get();
        const necessidades = await Promise.all(snap.docs.map(async (doc) => {
            const data = doc.data();
            const contagem = await db.collection("ajudas")
                .where("necessidadeId", "==", doc.id)
                .get();
            return {
                id: doc.id,
                titulo: data.titulo || "",
                descricao: data.descricao || "",
                bairro: data.bairro || "",
                totalAjudas: contagem.size,
            };
        }));

        if (tipo === "ajudar") {
            necessidades.sort((a, b) => a.totalAjudas - b.totalAjudas);
        }

        renderizarNecessidades(necessidades, container);
    } catch (e) {
        console.error("Erro ao carregar necessidades:", e);
        container.innerHTML = '<p class="empty-state">Não foi possível carregar as necessidades.</p>';
    }
}

async function jaAjudou(necessidadeId) {
    const ajudaId = `${necessidadeId}_${usuarioAtual.uid}`;
    const doc = await db.collection("ajudas").doc(ajudaId).get();
    return doc.exists;
}

function renderizarNecessidades(necessidades, container) {
    if (necessidades.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma necessidade cadastrada ainda.</p>';
        return;
    }

    container.innerHTML = "";
    necessidades.forEach(async (n) => {
        const item = document.createElement("div");
        item.className = "necessidade-item";

        const jaAjudouEsta = await jaAjudou(n.id);

        item.innerHTML = `
            <div class="necessidade-info">
                <h3></h3>
                <p></p>
                <span class="tag-bairro"></span>
            </div>
            <div style="text-align:right;">
                <div class="ajuda-count"><span class="qtd-ajudas"></span> pessoas ajudando</div>
                <button class="btn btn-primary btn-sm" style="margin-top:8px;">${jaAjudouEsta ? "Você já ajudou 💚" : "Quero ajudar"}</button>
            </div>
        `;

        item.querySelector("h3").textContent = n.titulo;
        item.querySelector("p").textContent = n.descricao;
        item.querySelector(".tag-bairro").textContent = n.bairro;
        item.querySelector(".qtd-ajudas").textContent = n.totalAjudas;

        const botao = item.querySelector("button");
        if (jaAjudouEsta) botao.disabled = true;
        botao.addEventListener("click", () => ajudar(n.id, botao));

        container.appendChild(item);
    });
}

async function ajudar(necessidadeId, botao) {
    botao.disabled = true;
    const ajudaId = `${necessidadeId}_${usuarioAtual.uid}`;

    try {
        await db.collection("ajudas").doc(ajudaId).set({
            necessidadeId: necessidadeId,
            uid: usuarioAtual.uid,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        });
        botao.textContent = "Você já ajudou 💚";
        const qtdEl = botao.closest(".necessidade-item").querySelector(".qtd-ajudas");
        qtdEl.textContent = Number(qtdEl.textContent) + 1;
        carregarStats();
    } catch (e) {
        console.error("Erro ao registrar ajuda:", e);
        botao.disabled = false;
    }
}
