// Helpers de autenticação compartilhados entre as páginas protegidas.

// Chama callback(user, perfil) quando o usuário está autenticado.
// Redireciona para login.html quando não está.
function exigirLogin(callback) {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    let perfil = null;
    try {
      const doc = await db.collection("perfis").doc(user.uid).get();
      if (doc.exists) perfil = doc.data();
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
    }

    callback(user, perfil);
  });
}

function configurarLogout(botaoId) {
  const botao = document.getElementById(botaoId);
  if (!botao) return;
  botao.addEventListener("click", async () => {
    await auth.signOut();
    window.location.href = "index.html";
  });
}

function exibirErro(elementoId, erro) {
  const el = document.getElementById(elementoId);
  if (!el) return;
  el.textContent = traduzirErroFirebase(erro);
}

function traduzirErroFirebase(erro) {
  const codigo = erro && erro.code;
  const mensagens = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-not-found": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  };
  return mensagens[codigo] || "Ocorreu um erro. Tente novamente.";
}
