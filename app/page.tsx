"use client";

import { useState } from "react";
import { assayQuestions, particleQuestions, phasePoints, sample, sieves } from "./game-data";

const labels = ["ARGILA", "SILTE", "AREIA", "PEDREGULHO"];
const assays = ["PENEIRAMENTO", "SEDIMENTAÇÃO", "PENEIRAMENTO + SEDIMENTAÇÃO"];

function fmt(n: number) { return n.toLocaleString("pt-BR", { maximumFractionDigits: 3 }); }

function Plot({ active = false, guides = [], placed = 0 }: { active?: boolean; guides?: string[]; placed?: number }) {
  const xFor = (d: number) => 62 + ((Math.log10(d) + 2) / 3) * 510;
  const yFor = (p: number) => 270 - p * 2.2;
  const pts = sample.rows.slice(0, -1).map((r) => {
    const x = xFor(r.opening);
    const y = yFor(r.passing);
    return `${x},${y}`;
  }).join(" ");
  const xTicks = [0.01,0.02,0.04,0.06,0.08,0.1,0.2,0.4,0.6,0.8,1,2,4,6,8,10];
  const guideData = [{k:"D10",p:10,d:.08},{k:"D30",p:30,d:.175},{k:"D60",p:60,d:.3}];
  return <div className="plot" aria-label="Curva granulométrica semilogarítmica">
    <svg viewBox="0 0 620 330" role="img">
      <rect x="62" y="50" width="510" height="220" fill="#fff" stroke="#333" />
      {[0,10,20,30,40,50,60,70,80,90,100].map(v=><g key={v}><line x1="62" y1={yFor(v)} x2="572" y2={yFor(v)} stroke={v%20===0?"#b9b3a7":"#e4dfd5"}/><text x="53" y={yFor(v)+4} textAnchor="end" fontSize="11" fontWeight={v===10||v===30||v===60?"700":"400"}>{v}</text></g>)}
      {xTicks.map(v=><g key={v}><line x1={xFor(v)} y1="50" x2={xFor(v)} y2="270" stroke={[.01,.1,1,10].includes(v)?"#a9a397":"#e4dfd5"}/><text x={xFor(v)} y="287" textAnchor="middle" fontSize="9" transform={`rotate(-35 ${xFor(v)} 287)`}>{fmt(v)}</text></g>)}
      <line x1="62" y1="270" x2="572" y2="270" stroke="#333" strokeWidth="2" /><line x1="62" y1="50" x2="62" y2="270" stroke="#333" strokeWidth="2" />
      {(active || placed>1) && <polyline points={pts.split(" ").slice(0,active?undefined:placed).join(" ")} fill="none" stroke="#1d7f72" strokeWidth="4" strokeLinecap="round" className={active?"draw":""} />}
      {sample.rows.slice(0,active? -1:placed).map((r,i)=>{const [x,y]=pts.split(" ")[i].split(",");return <circle key={r.sieve} cx={x} cy={y} r="6" fill="#e7a93d" stroke="#fff" strokeWidth="2"/>})}
      {guideData.filter(g=>guides.includes(g.k)).map(g=><g key={g.k} className="guide"><line x1="62" y1={yFor(g.p)} x2={xFor(g.d)} y2={yFor(g.p)} stroke="#c44d3f" strokeWidth="2" strokeDasharray="6 4"/><line x1={xFor(g.d)} y1={yFor(g.p)} x2={xFor(g.d)} y2="270" stroke="#c44d3f" strokeWidth="2" strokeDasharray="6 4"/><circle cx={xFor(g.d)} cy={yFor(g.p)} r="6" fill="#c44d3f"/><text x={xFor(g.d)+8} y={yFor(g.p)-8} textAnchor="start" fontSize="10" fontWeight="800" fill="#a2382d">{g.k} = {fmt(g.d)} mm</text></g>)}
      <text x="317" y="327" textAnchor="middle" fontSize="13" fontWeight="700">Diâmetro das partículas (mm) — escala logarítmica</text>
      <text x="16" y="160" textAnchor="middle" fontSize="13" fontWeight="700" transform="rotate(-90 16 160)">Porcentagem que passa (%)</text>
    </svg>
  </div>;
}

export default function Home() {
  const [phase, setPhase] = useState(0), [score,setScore]=useState(0), [lives,setLives]=useState(3);
  const [feedback,setFeedback]=useState(""), [q,setQ]=useState(0), [answered,setAnswered]=useState(0);
  const [order,setOrder]=useState(()=>[0.25,2,0.075,0.6,1.2,0.15,0.425]);
  const [shake,setShake]=useState(false), [curve,setCurve]=useState(false), [targets,setTargets]=useState<string[]>([]);
  const [tableAnswers,setTableAnswers]=useState(()=>sample.rows.map(()=>["","",""]));
  const [plotStep,setPlotStep]=useState(0), [curveClass,setCurveClass]=useState("");
  const pq = particleQuestions[q % particleQuestions.length], aq=assayQuestions[q % assayQuestions.length];
  const title = ["Briefing da missão","Que partícula é essa?","Escolha o ensaio","Monte a torre de peneiras","Analise as massas retidas","Construa a curva granulométrica","Caça ao D10, D30 e D60","Descubra o solo"][phase];
  const progress=Math.round((phase/7)*100);
  const next=()=>{setFeedback("");setQ(q+1);setAnswered(0);setPhase(Math.min(7,phase+1));};
  const award=(amount:number)=>setScore(s=>Math.min(4000,s+amount));
  const wrong=(msg:string)=>{setLives(v=>Math.max(0,v-1));setFeedback("❌ "+msg);};
  const particle=(choice:string)=>{if(choice===pq.label){award(500);setFeedback("✅ CORRETO! +500 pontos — "+pq.why);setAnswered(1)}else wrong("Tente novamente. Dica: compare o diâmetro com 0,002; 0,06 e 2 mm.")};
  const assay=(choice:string)=>{if(choice===aq.answer){award(300);setFeedback("✅ Procedimento correto! +300 pontos — "+aq.why);setAnswered(1)}else wrong("Releia se a amostra é grossa, fina ou contém as duas frações.")};
  const move=(i:number,dir:number)=>{const n=[...order],j=i+dir;if(j<0||j>=n.length)return;[n[i],n[j]]=[n[j],n[i]];setOrder(n)};
  const verifyTower=()=>{if(order.every((v,i)=>v===sieves[i])){award(500);setFeedback("✅ TORRE MONTADA! +500 pontos");setAnswered(1)}else wrong("A torre deve ir da maior abertura, no topo, para a menor.")};
  const updateTable=(row:number,col:number,value:string)=>setTableAnswers(old=>old.map((r,i)=>i===row?r.map((v,j)=>j===col?value:v):r));
  const checkTable=()=>{const expected=sample.rows.map(r=>[r.retained,r.cumulative,r.passing]);const ok=expected.every((r,i)=>r.every((v,j)=>Math.abs(Number(tableAnswers[i][j].replace(",","."))-v)<.01));if(ok){award(700);setAnswered(1);setFeedback("✅ TABELA COMPLETA! +700 pontos. % passante = 100% − % retida acumulada.")}else wrong("Há valores a revisar. Use: % retida = massa retida × 100 / 500; depois acumule e subtraia de 100.")};
  const placePoint=(value:number)=>{const row=sample.rows[plotStep];if(value===row.passing){award(70);setPlotStep(s=>s+1);setFeedback(`✅ Ponto posicionado: ${fmt(row.opening)} mm → ${row.passing}% passante.`)}else wrong("Esse ponto não corresponde à porcentagem passante calculada na tabela.")};
  const classifyCurve=(choice:string)=>{setCurveClass(choice);if(choice==="uniforme"){award(200);setAnswered(1);setFeedback("✅ Correto. Pelo critério da aula, Cu = 3,75 e Cu < 5: solo uniforme.")}else wrong("Confira o coeficiente de não uniformidade: Cu = 3,75. Pela aula, Cu < 5 indica solo uniforme.")};
  const reset=()=>{setPhase(0);setScore(0);setLives(3);setFeedback("");setQ(Math.floor(Math.random()*5));setAnswered(0);setCurve(false);setTargets([]);setPlotStep(0);setCurveClass("");setTableAnswers(sample.rows.map(()=>["","",""]));setOrder([...sieves].sort(()=>Math.random()-.5))};
  return <main>
    <header className="topbar"><div className="brand"><span className="mark">MG</span><div><b>MISSÃO GRANULOMETRIA</b><small>Laboratório de Mecânica dos Solos</small></div></div><div className="stats"><span>🏆 {score}</span><span>❤️ {lives}</span><button onClick={reset}>↻ Recomeçar</button></div></header>
    <div className="progress"><span style={{width:`${progress}%`}}/><b>{progress}%</b></div>
    <section className="stage">
      <aside><span className="eyebrow">FASE {phase || "—"} / 7</span><h1>{title}</h1><p>Analise a amostra, tome decisões e registre o laudo granulométrico.</p><div className="sample-chip"><i/> AMOSTRA {sample.name}</div><div className="phase-list">{[1,2,3,4,5,6,7].map(n=><span className={n===phase?"on":n<phase?"done":""} key={n}>{n}</span>)}</div></aside>
      <article className="card">
        {phase===0 && <div className="hero"><div className="lab-visual"><div className="jar"><span/><span/><span/></div><div className="sieve-stack">{[1,2,3,4].map(n=><i key={n}/>)}</div><div className="soil"/></div><span className="eyebrow">ANÁLISE • DECISÃO • DESCOBERTA</span><h2>Você recebeu uma amostra de solo desconhecida.</h2><p>Sua missão é realizar a análise granulométrica e descobrir que solo é esse.</p><button className="primary" onClick={()=>setPhase(1)}>INICIAR MISSÃO →</button></div>}
        {phase===1 && <><QuestionBadge n={answered+1} total={1}/><h2>Uma partícula possui diâmetro de <strong>{fmt(pq.d)} mm</strong>. Como ela é classificada?</h2><div className="choices four">{labels.map(x=><button onClick={()=>particle(x)} key={x}>{x}</button>)}</div></>}
        {phase===2 && <><QuestionBadge n={1} total={1}/><h2>{aq.text}</h2><p>Qual procedimento deve ser adotado?</p><div className="choices">{assays.map(x=><button onClick={()=>assay(x)} key={x}>{x}</button>)}</div></>}
        {phase===3 && <><h2>Ordene da maior abertura para a menor</h2><p>Use as setas (também funcionam por toque) para montar a torre.</p><div className={`tower ${shake?"vibrating":""}`}>{order.map((x,i)=><div className="sieve" key={x}><button aria-label="Mover para cima" onClick={()=>move(i,-1)}>↑</button><b>{fmt(x)} mm</b><button aria-label="Mover para baixo" onClick={()=>move(i,1)}>↓</button></div>)}</div><div className="actions"><button className="primary" onClick={verifyTower}>VERIFICAR ORDEM</button>{answered>0&&<button onClick={()=>{setShake(true);setTimeout(()=>setShake(false),1800)}}>INICIAR PENEIRAMENTO</button>}</div></>}
        {phase===4 && <><h2>Complete a tabela granulométrica</h2><p>Massa total da amostra: <strong>500 g</strong>. Preencha todas as células em porcentagem.</p><div className="table-wrap full-table"><table><thead><tr><th>Peneira</th><th>Abertura</th><th>Massa retida</th><th>% retida</th><th>% retida acumulada</th><th>% passante</th></tr></thead><tbody>{sample.rows.map((r,i)=><tr key={r.sieve}><td>#{r.sieve}</td><td>{fmt(r.opening)} mm</td><td>{r.mass} g</td>{[0,1,2].map(j=><td key={j}><input aria-label={`${["Porcentagem retida","Porcentagem retida acumulada","Porcentagem passante"][j]} peneira ${r.sieve}`} value={tableAnswers[i][j]} onChange={e=>updateTable(i,j,e.target.value)} inputMode="decimal" disabled={answered>0}/></td>)}</tr>)}</tbody></table></div><div className="table-help"><span><b>1.</b> % retida = massa × 100 / 500</span><span><b>2.</b> Some para acumular</span><span><b>3.</b> % passante = 100 − acumulada</span></div>{answered===0?<button className="primary" onClick={checkTable}>VERIFICAR TABELA</button>:<p className="success">✅ Tabela conferida. Agora esses pontos podem ser levados à curva.</p>}</>}
        {phase===5 && <><h2>Construa a curva ponto a ponto</h2><p>Para cada abertura, use a tabela que você completou e escolha a porcentagem passante correta. O ponto será colocado no gráfico.</p><Plot active={curve} placed={plotStep}/>{plotStep<6?<div className="plot-mission"><span>PONTO {plotStep+1} DE 6</span><h3>Peneira #{sample.rows[plotStep].sieve} — abertura {fmt(sample.rows[plotStep].opening)} mm</h3><p>Qual é a porcentagem passante?</p><div>{[Math.max(0,sample.rows[plotStep].passing-10),sample.rows[plotStep].passing,Math.min(100,sample.rows[plotStep].passing+10)].sort((a,b)=>(a*7%13)-(b*7%13)).map(v=><button key={v} onClick={()=>placePoint(v)}>{v}%</button>)}</div></div>:!curve?<button className="primary" onClick={()=>{setCurve(true);award(80);setFeedback("✅ Seis pontos posicionados. Agora a curva foi ligada.")}}>LIGAR OS PONTOS E TRAÇAR CURVA</button>:answered===0?<div className="curve-class"><h3>Com Cu = 3,75, como esta distribuição deve ser classificada?</h3><div>{["uniforme","bem graduada","granulometria descontínua"].map(x=><button className={curveClass===x?"selected":""} key={x} onClick={()=>classifyCurve(x)}>{x}</button>)}</div></div>:<p className="success">✅ Curva construída e classificada como uniforme.</p>}</>}
        {phase===6 && <><h2>Localize os diâmetros característicos</h2><p>Escolha um percentual. A linha sai do eixo vertical, encontra a curva e desce até o diâmetro no eixo horizontal.</p><Plot active guides={targets}/><div className="hunt">{[{k:"D10",v:.08},{k:"D30",v:.175},{k:"D60",v:.3}].map(o=><button className={targets.includes(o.k)?"found":""} key={o.k} onClick={()=>{if(!targets.includes(o.k)){setTargets([...targets,o.k]);award(150)}}}>{o.k}<small>{targets.includes(o.k)?`${fmt(o.v)} mm`:`mostrar linha de ${o.k.slice(1)}%`}</small></button>)}</div>{targets.length===3&&<div className="formula"><b>Cu = D60 / D10 = 3,75</b><span>Cu &lt; 5 → solo uniforme</span><b>Cc = (D30)² / (D10 · D60) = 1,28</b><span>Para areia bem graduada: 1 &lt; Cc &lt; 3 e Cu ≥ 4.</span><button onClick={()=>{award(350);setAnswered(1);setFeedback("✅ Coeficientes interpretados conforme a aula.")}}>CONFIRMAR ANÁLISE</button></div>}</>}
        {phase===7 && <Final score={score} done={answered>0} onAnswer={(x)=>{if(x===sample.description){award(500);setAnswered(1);setFeedback("🎉 MISSÃO CONCLUÍDA! A fração predominante é areia, com presença de silte.")}else wrong("Observe quais frações são mais quantificadas.")}} onReset={reset}/>} 
        {feedback&&<div className={feedback.startsWith("❌")?"feedback bad":"feedback"}>{feedback}</div>}
        {phase>0&&phase<7&&answered>0&&<button className="next" onClick={next}>PRÓXIMA FASE →</button>}
        {phase===7&&answered>0&&<div className="certificate"><span>LAUDO GRANULOMÉTRICO</span><h2>{sample.name}</h2><div><b>D10</b> 0,08 mm <b>D30</b> 0,175 mm <b>D60</b> 0,3 mm <b>Cu</b> 3,75 <b>Cc</b> 1,28</div><strong>{sample.description}</strong><p>{score+500>=3400?"🥇 Mestre dos Solos":score+500>=2500?"🥈 Técnico em Granulometria":"🥉 Auxiliar de Laboratório"}</p></div>}
      </article>
    </section>
    <footer><button onClick={()=>setFeedback("💡 Dica: use os limites e fórmulas exibidos na aula; cada etapa traz apenas o necessário.")}>💡 DICA</button><span>Conteúdo técnico baseado em “Aula 4 - Granulometria”.</span></footer>
  </main>;
}

function QuestionBadge({n,total}:{n:number,total:number}){return <span className="question-badge">DESAFIO {n} DE {total}</span>}
function Final({score,done,onAnswer,onReset}:{score:number,done:boolean,onAnswer:(x:string)=>void,onReset:()=>void}){const options=["Areia","Areia siltosa","Silte arenoso","Argila areno-siltosa"];return <><h2>Qual é o solo?</h2><p>A depender da quantidade relativa, a denominação considera as porções mais quantificadas.</p><div className="fractions">{Object.entries(sample.fractions).map(([k,v])=><div key={k}><span><i style={{height:`${Math.max(8,v)}%`}}/></span><b>{k}</b><strong>{v}%</strong></div>)}</div>{!done?<div className="choices four">{options.map(x=><button onClick={()=>onAnswer(x)} key={x}>{x}</button>)}</div>:<button className="primary" onClick={onReset}>JOGAR COM NOVA ORDEM →</button>}<p className="scoreline">Pontuação atual: {score} / 4.000</p></>}
