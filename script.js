// ========= ajuste o NAMESPACE para algo único seu =========
// Por exemplo: use seu usuário e o nome do repo do Pages
const NAMESPACE = "julio-github-io-meu-site"; // mude aqui
const KEY = "visitas-total";

// Endpoint de contador global gratuito (sem cadastro).
// Obs: por ser público, terceiros poderiam manipular. Para algo mais sério,
// considere um backend/serverless com chave secreta.
const ENDPOINT = `https://api.countapi.xyz/hit/${encodeURIComponent(NAMESPACE)}/${encodeURIComponent(KEY)}`;

const elCounter = document.getElementById("counter");
const elStatus  = document.getElementById("status");

let current = 0;

function format(n){
  return new Intl.NumberFormat("pt-BR").format(n);
}

function animateTo(target){
  const startValue = current;
  const delta = target - startValue;
  const duration = 800; // ms
  const t0 = performance.now();

  function frame(now){
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    const val = Math.floor(startValue + delta * eased);
    elCounter.textContent = format(val);
    if (p < 1){
      requestAnimationFrame(frame);
    } else {
      current = target;
    }
  }
  requestAnimationFrame(frame);
}

async function hitGlobalCounter(){
  const res = await fetch(ENDPOINT, { mode: "cors", cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (typeof data.value !== "number") throw new Error("Resposta inválida");
  return data.value;
}

function fallbackLocal(){
  const k = "contador_local_visitas";
  const v = Number(localStorage.getItem(k) || 0) + 1;
  localStorage.setItem(k, String(v));
  return v;
}

(async function init(){
  try{
    const value = await hitGlobalCounter();
    elStatus.textContent = "contador global ativo";
    animateTo(value);
  } catch (err){
    console.warn("Falhou o contador global, usando local:", err);
    const value = fallbackLocal();
    elStatus.textContent = "modo offline/local (somente neste navegador)";
    animateTo(value);
  }
})();
