const LIMIT_PPM = 20000;
const SAMPLE_DATA = [
  {data:"2026-09-15",linha:"L1",produto:"Ventilador 40cm",defeito:"Ruído",produzido:500,rejeitado:8},
  {data:"2026-09-15",linha:"L2",produto:"Ventilador 50cm",defeito:"Vibração",produzido:420,rejeitado:12},
  {data:"2026-09-16",linha:"L1",produto:"Ventilador 40cm",defeito:"Grade quebrada",produzido:510,rejeitado:5},
  {data:"2026-09-16",linha:"L2",produto:"Ventilador 50cm",defeito:"Ruído",produzido:450,rejeitado:9},
  {data:"2026-09-17",linha:"L1",produto:"Ventilador 40cm",defeito:"Vibração",produzido:490,rejeitado:11}
];
let sourceData=[...SAMPLE_DATA], filteredData=[], paretoInstance=null, trendInstance=null;
const $=id=>document.getElementById(id);
const number=new Intl.NumberFormat("pt-BR",{maximumFractionDigits:0});
const decimal=new Intl.NumberFormat("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const ppm=(r,p)=>p ? r/p*1_000_000 : 0;
const escapeHtml=v=>String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

function parseCSV(text){
  const rows=[]; let row=[],cell="",quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&quoted&&n==='"'){cell+='"';i++;}else if(c==='"'){quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell="";}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell="";}else cell+=c;}
  row.push(cell);if(row.some(x=>x.trim()))rows.push(row);if(!rows.length)throw new Error("O arquivo está vazio.");
  const headers=rows.shift().map(h=>h.replace(/^\uFEFF/,"").trim().toLowerCase());
  const required=["data","linha","produto","defeito","produzido","rejeitado"];
  const missing=required.filter(h=>!headers.includes(h));if(missing.length)throw new Error(`Colunas ausentes: ${missing.join(", ")}`);
  return rows.map((values,index)=>{const item=Object.fromEntries(headers.map((h,i)=>[h,(values[i]??"").trim()]));item.produzido=Number(item.produzido);item.rejeitado=Number(item.rejeitado);if(!/^\d{4}-\d{2}-\d{2}$/.test(item.data)||!Number.isFinite(item.produzido)||!Number.isFinite(item.rejeitado)||item.produzido<0||item.rejeitado<0||item.rejeitado>item.produzido)throw new Error(`Dados inválidos na linha ${index+2}.`);return item;});
}
function setOptions(id,values){const el=$(id);el.innerHTML=values.map(v=>`<option selected value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");}
function selected(id){return [...$(id).selectedOptions].map(o=>o.value);}
function setupFilters(){const lines=[...new Set(sourceData.map(x=>x.linha))].sort(),products=[...new Set(sourceData.map(x=>x.produto))].sort(),dates=sourceData.map(x=>x.data).sort();setOptions("lineFilter",lines);setOptions("productFilter",products);$("startDate").value=dates[0]||"";$("endDate").value=dates.at(-1)||"";applyFilters();}
function applyFilters(){const lines=selected("lineFilter"),products=selected("productFilter"),start=$("startDate").value,end=$("endDate").value;filteredData=sourceData.filter(x=>lines.includes(x.linha)&&products.includes(x.produto)&&(!start||x.data>=start)&&(!end||x.data<=end));render();}
function showMessage(text,type){const el=$("message");el.textContent=text;el.className=`message ${type}`;}
function render(){const produced=filteredData.reduce((s,x)=>s+x.produzido,0),rejected=filteredData.reduce((s,x)=>s+x.rejeitado,0),value=ppm(rejected,produced),rate=produced?rejected/produced*100:0;$("producedKpi").textContent=number.format(produced);$("rejectedKpi").textContent=number.format(rejected);$("ppmKpi").textContent=number.format(value);$("rateKpi").textContent=`${decimal.format(rate)}%`;showMessage(filteredData.length?(value>LIMIT_PPM?`⚠ PPM crítico: ${number.format(value)}. Limite: ${number.format(LIMIT_PPM)}.`:`✓ PPM sob controle: ${number.format(value)}.`):"Nenhum registro encontrado para os filtros.",filteredData.length&&value<=LIMIT_PPM?"success":"error");renderPareto();renderTrend();renderTable();}
function renderPareto(){
  const totals={};filteredData.forEach(x=>totals[x.defeito]=(totals[x.defeito]||0)+x.rejeitado);
  const items=Object.entries(totals).sort((a,b)=>b[1]-a[1]),sum=items.reduce((s,x)=>s+x[1],0);let running=0;
  const cumulative=items.map(x=>sum?(running+=x[1])/sum*100:0);
  if(paretoInstance)paretoInstance.destroy();
  paretoInstance=new Chart($("paretoChart"),{type:"bar",data:{labels:items.map(x=>x[0]),datasets:[{type:"bar",label:"Rejeitados",data:items.map(x=>x[1]),backgroundColor:"rgba(228,87,86,.82)",borderRadius:7,yAxisID:"y"},{type:"line",label:"% acumulado",data:cumulative,borderColor:"#176b87",backgroundColor:"#176b87",pointBackgroundColor:"#fff",pointBorderWidth:2,pointRadius:4,tension:.25,yAxisID:"y1"}]},options:{maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{position:"bottom",labels:{usePointStyle:true,boxWidth:8,font:{family:"Inter",size:11}}},tooltip:{callbacks:{label:c=>c.datasetIndex===1?`${c.dataset.label}: ${c.parsed.y.toFixed(1)}%`:`${c.dataset.label}: ${number.format(c.parsed.y)}`}}},scales:{x:{grid:{display:false},ticks:{font:{family:"Inter",size:10}}},y:{beginAtZero:true,grid:{color:"#edf1f5"},ticks:{precision:0}},y1:{position:"right",min:0,max:100,grid:{display:false},ticks:{callback:v=>`${v}%`}}}}});
}
function renderTrend(){
  const totals={};filteredData.forEach(x=>{totals[x.data]??={produzido:0,rejeitado:0};totals[x.data].produzido+=x.produzido;totals[x.data].rejeitado+=x.rejeitado});
  const items=Object.entries(totals).sort().map(([date,v])=>({date,value:ppm(v.rejeitado,v.produzido)}));
  if(trendInstance)trendInstance.destroy();
  trendInstance=new Chart($("trendChart"),{type:"line",data:{labels:items.map(x=>x.date.split('-').reverse().join('/')),datasets:[{label:"PPM diário",data:items.map(x=>x.value),borderColor:"#176b87",backgroundColor:"rgba(39,169,194,.14)",fill:true,tension:.32,pointBackgroundColor:"#fff",pointBorderColor:"#27a9c2",pointBorderWidth:3,pointRadius:5},{label:"Limite",data:items.map(()=>LIMIT_PPM),borderColor:"#e45756",borderDash:[7,6],borderWidth:2,pointRadius:0,fill:false}]},options:{maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{position:"bottom",labels:{usePointStyle:true,boxWidth:8,font:{family:"Inter",size:11}}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${number.format(c.parsed.y)}`}}},scales:{x:{grid:{display:false},ticks:{font:{family:"Inter",size:10}}},y:{beginAtZero:true,grid:{color:"#edf1f5"},ticks:{callback:v=>number.format(v)}}}}});
}
function renderTable(){$("recordCount").textContent=`${filteredData.length} registro${filteredData.length===1?'':'s'}`;$("dataBody").innerHTML=filteredData.map(x=>`<tr><td>${x.data.split('-').reverse().join('/')}</td><td>${escapeHtml(x.linha)}</td><td>${escapeHtml(x.produto)}</td><td>${escapeHtml(x.defeito)}</td><td>${number.format(x.produzido)}</td><td>${number.format(x.rejeitado)}</td><td>${number.format(ppm(x.rejeitado,x.produzido))}</td></tr>`).join("");}
function downloadCSV(){const headers=["data","linha","produto","defeito","produzido","rejeitado","ppm"],quote=v=>`"${String(v).replaceAll('"','""')}"`,rows=filteredData.map(x=>[x.data,x.linha,x.produto,x.defeito,x.produzido,x.rejeitado,Math.round(ppm(x.rejeitado,x.produzido))]);const blob=new Blob(["\uFEFF"+[headers,...rows].map(r=>r.map(quote).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="controle_qualidade_filtrado.csv";a.click();URL.revokeObjectURL(a.href);}
$("fileInput").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{sourceData=parseCSV(await file.text());setupFilters();}catch(error){showMessage(error.message,"error");}});$("resetData").addEventListener("click",()=>{sourceData=[...SAMPLE_DATA];$("fileInput").value="";setupFilters();});$("applyFilters").addEventListener("click",applyFilters);$("downloadCsv").addEventListener("click",downloadCSV);setupFilters();
