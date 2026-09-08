function tick(){
  const d = new Date();
  const el = document.getElementById('clock');
  if (el) el.textContent = String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}
tick(); setInterval(tick, 15000);

function setTab(name){
  document.querySelectorAll('[data-view]').forEach(v=>{
    v.classList.toggle('hidden', v.dataset.view !== name);
    if(v.dataset.view === name){ v.classList.remove('view'); void v.offsetWidth; v.classList.add('view'); }
  });
  document.querySelectorAll('.tab-btn').forEach(b=>{
    const on = b.dataset.tab === name;
    b.classList.toggle('text-brand', on);
    b.classList.toggle('nav-active', on);
    b.classList.toggle('text-slate-400', !on);
  });
  document.getElementById('screen').scrollTo({top:0, behavior:'instant'});
}

let toastTimer;
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  t.classList.remove('toast'); void t.offsetWidth; t.classList.add('toast');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.add('hidden'), 2400);
}

function openModal(id){
  const m = document.getElementById('modal-'+id);
  m.classList.remove('hidden');
  const card = m.querySelector('.modal-card');
  card.classList.remove('modal-card'); void card.offsetWidth; card.classList.add('modal-card');
}
function closeModal(id){ document.getElementById('modal-'+id).classList.add('hidden'); }

let presenceDone = false;
function confirmPresence(){
  const btn = document.getElementById('confirmPresenceBtn');
  if(presenceDone){ return; }
  presenceDone = true;
  btn.textContent = '✓ Presença confirmada';
  btn.classList.remove('bg-brand');
  btn.classList.add('bg-emerald');
  toast('Presença confirmada na aula de quinta');
}

const PRICE = { adult: 60, child: 30 };
const qty = { adult: 0, child: 0 };
let payMethod = 'pix';

function openTickets(){ openModal('tickets'); }
function stepQty(type, delta){
  qty[type] = Math.max(0, Math.min(10, qty[type] + delta));
  document.getElementById('qty-'+type).textContent = qty[type];
  renderTicketTotal();
}
function renderTicketTotal(){
  const total = qty.adult*PRICE.adult + qty.child*PRICE.child;
  document.getElementById('ticketTotal').textContent = brl(total);
  document.getElementById('checkoutBtn').disabled = total === 0;
}
function setPay(m){
  payMethod = m;
  document.querySelectorAll('.pay-opt').forEach(o=>{
    const on = o.dataset.pay === m;
    o.classList.toggle('border-emerald', on && m==='pix');
    o.classList.toggle('bg-emerald/5', on && m==='pix');
    o.classList.toggle('border-brand', on && m==='card');
    o.classList.toggle('bg-brand/5', on && m==='card');
    o.classList.toggle('border-slate-200', !on);
    o.classList.toggle('bg-white', !on);
  });
}
function checkoutTickets(){
  const totalQty = qty.adult + qty.child;
  const total = qty.adult*PRICE.adult + qty.child*PRICE.child;
  const btn = document.getElementById('checkoutBtn');
  btn.disabled = true;
  btn.textContent = 'Processando...';
  setTimeout(()=>{
    closeModal('tickets');
    btn.textContent = 'Finalizar compra';
    const parts = [];
    if(qty.adult) parts.push(qty.adult+' adulto'+(qty.adult>1?'s':''));
    if(qty.child) parts.push(qty.child+' infantil');

    document.getElementById('walletQty').textContent = parts.join(' + ') + ' · confirmados';
    document.getElementById('qrBox').classList.remove('grayscale','opacity-40');
    document.getElementById('qrLabel').innerHTML = '<span class="font-800 text-ink">Ingresso válido.</span> Apresente este QR Code na entrada da Arena Ice Park.';

    addHistory('gold','Ingressos · Show no Gelo', parts.join(' + '), total);
    toast('Compra aprovada via '+(payMethod==='pix'?'Pix':'Cartão')+' · '+brl(total));

    qty.adult = 0; qty.child = 0;
    document.getElementById('qty-adult').textContent = 0;
    document.getElementById('qty-child').textContent = 0;
    renderTicketTotal();
  }, 900);
}

const days = [
  {d:'SEG', n:11}, {d:'TER', n:12}, {d:'QUA', n:13}, {d:'QUI', n:14},
  {d:'SEX', n:15}, {d:'SÁB', n:16}, {d:'SEG', n:18}, {d:'TER', n:19}
];
const times = ['09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00','19:00'];
let selDay = null, selTime = null;

function openPrivate(){
  selDay = null; selTime = null;
  renderPrivate();
  openModal('private');
}
function renderPrivate(){
  const dg = document.getElementById('dayGrid');
  dg.innerHTML = days.map((x,i)=>`
    <button onclick="pickDay(${i})" class="press rounded-2xl py-2 text-center border-2 ${selDay===i?'border-brand bg-brand/5':'border-slate-200'}">
      <span class="block text-[9.5px] font-700 text-slatey">${x.d}</span>
      <span class="block font-800 text-[15px] ${selDay===i?'text-brand':'text-ink'}">${x.n}</span>
    </button>`).join('');
  const tg = document.getElementById('timeGrid');
  tg.innerHTML = times.map((t,i)=>`
    <button onclick="pickTime(${i})" class="press rounded-2xl py-2.5 text-center border-2 text-[12.5px] font-800 ${selTime===i?'border-brand bg-brand/5 text-brand':'border-slate-200 text-ink'}">${t}</button>`).join('');
  document.getElementById('privateBtn').disabled = !(selDay!==null && selTime!==null);
}
function pickDay(i){ selDay = i; renderPrivate(); }
function pickTime(i){ selTime = i; renderPrivate(); }
function confirmPrivate(){
  const d = days[selDay], t = times[selTime];
  const btn = document.getElementById('privateBtn');
  btn.disabled = true; btn.textContent = 'Reservando...';
  setTimeout(()=>{
    closeModal('private');
    btn.textContent = 'Confirmar e reservar';
    addHistory('brand','Aula particular VIP', `${d.d} ${d.n} · ${t}`, 180);
    toast(`Aula VIP reservada · ${d.d} ${d.n} às ${t}`);
  }, 800);
}

let tuitionPaid = false;
function payTuition(){ openModal('pix'); }
function copyPix(){
  const code = '00020126580014br.gov.bcb.pix0136paula.donatti@icepark520400005303986...';
  if(navigator.clipboard){ navigator.clipboard.writeText(code).catch(()=>{}); }
  document.getElementById('copyPixBtn').textContent = '✓ Código copiado';
  toast('Código Pix copiado');
}
function confirmPixPaid(){
  closeModal('pix');
  markTuitionPaid();
}
function markTuitionPaid(){
  if(tuitionPaid) return;
  tuitionPaid = true;
  const tag = document.getElementById('tuitionTag');
  tag.textContent = 'Paga';
  tag.classList.remove('text-magenta');
  tag.classList.add('text-emerald');
  const card = document.getElementById('tuitionCard');
  card.style.background = 'linear-gradient(135deg,#10B981 0%,#059669 120%)';
  const btn = document.getElementById('payPixBtn');
  btn.classList.add('opacity-60','pointer-events-none');
  btn.querySelector('.font-800').textContent = 'Mensalidade paga';
  btn.querySelector('.text-white\\/80').textContent = 'Agosto quitado · obrigado!';
  addHistory('emerald','Mensalidade de Agosto', 'Pix · quitada', 320);
  toast('Mensalidade de Agosto paga com sucesso');
}
function openCard(){ openModal('card'); }
function saveCard(){
  closeModal('card');
  toast('Cartão cadastrado · débito automático ativo');
}

const historyData = [
  {c:'emerald', title:'Mensalidade de Julho', sub:'Pix · quitada', val:320, date:'08 Jul'},
  {c:'brand', title:'Aula particular VIP', sub:'Sáb 21 Jun · 10:00', val:180, date:'19 Jun'},
  {c:'gold', title:'Ingressos · Recital Outono', sub:'2 adultos', val:120, date:'03 Mai'},
];
function iconFor(c){
  if(c==='emerald') return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  if(c==='gold') return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16l-1.5 9a2 2 0 01-2 1.7H7.5a2 2 0 01-2-1.7L4 10z"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>';
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15l-2 5 2-1.2L14 20l-2-5"/><circle cx="12" cy="8" r="6"/></svg>';
}
function bgFor(c){ return c==='emerald'?'bg-emerald/10':c==='gold'?'bg-gold/15':'bg-brand/10'; }
function historyRow(item){
  return `<div class="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 p-3">
    <div class="h-10 w-10 rounded-xl ${bgFor(item.c)} grid place-items-center shrink-0">${iconFor(item.c)}</div>
    <div class="flex-1 min-w-0">
      <p class="font-800 text-ink text-[13px] truncate">${item.title}</p>
      <p class="text-[11px] text-slatey truncate">${item.sub} · ${item.date||'hoje'}</p>
    </div>
    <p class="font-800 text-ink text-[13px] shrink-0">${brl(item.val)}</p>
  </div>`;
}
function renderHistory(){
  document.getElementById('historyList').innerHTML = historyData.map(historyRow).join('');
}
function addHistory(c, title, sub, val){
  historyData.unshift({c, title, sub, val, date:'hoje'});
  renderHistory();
}

const stock = {28:3,29:1,30:4,31:2,32:0,33:5,34:2,35:3,36:2,37:1,38:0,39:4,40:2,41:3,42:1,43:2,44:0};
let selSize = 36;
let selReason = null;
const reasons = [
  {id:'forgot', label:'Esqueci meu equipamento', icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>'},
  {id:'maintenance', label:'Patins em manutenção', icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 00-5.2 5.2L4 17v3h3l5.5-5.5a4 4 0 005.2-5.2l-2.5 2.5-2-2 2.5-2.5z"/></svg>'},
  {id:'trial', label:'Aluno em aula teste', icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.6 6.9L22 9.3l-5.4 4.7 1.7 7.3L12 17.8 5.7 21.3l1.7-7.3L2 9.3l7.4-.4z"/></svg>'},
];

function renderSizes(){
  const grid = document.getElementById('sizeGrid');
  let html = '';
  for(let n=28; n<=44; n++){
    const s = stock[n];
    const out = s === 0;
    const active = n === selSize;
    let cls = 'size-pill relative rounded-2xl py-2.5 text-center font-800 text-[13px] border-2 ';
    if(out){ cls += 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'; }
    else if(active){ cls += 'border-brand bg-brand text-white shadow-lg shadow-brand/30'; }
    else { cls += 'border-slate-200 bg-white text-ink'; }
    html += `<button ${out?'disabled':''} onclick="pickSize(${n})" class="${cls}">${n}
      ${out?'<span class="block text-[8px] font-700 text-slate-300 leading-none mt-0.5">esgot.</span>':''}
    </button>`;
  }
  grid.innerHTML = html;
}
function pickSize(n){
  if(stock[n] === 0) return;
  selSize = n;
  renderSizes();
  updateSkatePreview();
}
function updateSkatePreview(){
  document.getElementById('sizeBig').textContent = selSize;
  const s = stock[selSize];
  const line = document.getElementById('stockLine');
  const color = s >= 3 ? '#34D399' : s === 0 ? '#F87171' : '#FBBF24';
  line.innerHTML = `<span class="h-1.5 w-1.5 rounded-full" style="background:${color}"></span>
    Nº ${selSize} — ${s} ${s===1?'unidade disponível':'unidades disponíveis'} para a aula de hoje`;
}
function renderReasons(){
  document.getElementById('reasonList').innerHTML = reasons.map(r=>`
    <button onclick="pickReason('${r.id}')" class="press w-full flex items-center gap-3 rounded-2xl border-2 ${selReason===r.id?'border-brand bg-brand/5':'border-slate-200 bg-white'} p-3.5 text-left">
      <span class="h-9 w-9 rounded-xl bg-brand/10 grid place-items-center shrink-0">${r.icon}</span>
      <span class="flex-1 font-700 text-[13px] text-ink">${r.label}</span>
      <span class="h-5 w-5 rounded-full border-2 ${selReason===r.id?'border-brand bg-brand':'border-slate-300'} grid place-items-center">
        ${selReason===r.id?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>':''}
      </span>
    </button>`).join('');
}
function pickReason(id){ selReason = id; renderReasons(); }
function confirmSkate(){
  if(stock[selSize] === 0){ toast('Selecione uma numeração disponível'); return; }
  if(!selReason){ toast('Selecione o motivo da reserva'); setTab('skates'); return; }
  const btn = document.getElementById('skateConfirmBtn');
  btn.disabled = true; btn.textContent = 'Reservando...';
  setTimeout(()=>{
    stock[selSize] = Math.max(0, stock[selSize]-1);
    renderSizes();
    updateSkatePreview();
    document.getElementById('savedSize').textContent = 'Nº '+selSize;
    btn.disabled = false;
    btn.textContent = 'Confirmar reserva do patins';
    toast(`Patins Nº ${selSize} reservado · retire na pista`);
  }, 800);
}

function brl(v){ return 'R$ ' + v.toFixed(2).replace('.', ','); }

renderSizes();
updateSkatePreview();
renderReasons();
renderHistory();
renderTicketTotal();
setPay('pix');
