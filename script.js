// Contador global: incrementa a cada acesso (toda vez que a página carrega)
const KEY = "visitas-total";

// NAMESPACE automático baseado no domínio + caminho do site (evita colisão com outros sites)
const NAMESPACE = (location.host + location.pathname.replace(/\/index\.html?$/i, "") || "localhost").toLowerCase();

// Endpoint de contador global público
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
  // Fallback apenas para não ficar 0 quando o serviço externo cair.
  const k = "contador_local_visitas";
  const v = Number(localStorage.getItem(k) || 0) + 1;
  localStorage.setItem(k, String(v));
  return v;
}

(async function init(){
  try{
    const value = await hitGlobalCounter(); // incrementa +1 a cada acesso
    elStatus.textContent = `contador global ativo (${NAMESPACE})`;
    animateTo(value);
  } catch (err){
    console.warn("Falhou o contador global, usando local:", err);
    const value = fallbackLocal();
    elStatus.textContent = "modo offline/local (somente neste navegador)";
    animateTo(value);
  }
})();
