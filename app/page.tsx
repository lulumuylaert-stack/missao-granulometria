"use client";

import { useMemo, useState } from "react";
import { assayQuestions, particleQuestions, phasePoints, sample, sieves } from "./game-data";

const labels = ["ARGILA", "SILTE", "AREIA", "PEDREGULHO"];
const assays = ["PENEIRAMENTO", "SEDIMENTAÇÃO", "PENEIRAMENTO + SEDIMENTAÇÃO"];

function fmt(n: number) { return n.toLocaleString("pt-BR", { maximumFractionDigits: 3 }); }

function Plot({ active = false }: { active?: boolean }) {
  const pts = sample.rows.slice(0, -1).map((r) => {
    const x = 48 + ((Math.log10(r.opening) + 1.2) / 1.55) * 500;
    const y = 268 - r.passing * 2.25;
    return `${x},${y}`;
  }).join(" ");
  return <div className="plot" aria-label="Curva granulométrica semilogarítmica">
    <svg viewBox="0 0 620 330" role="img">
      <defs><pattern id="grid" width="50" height="22.5" patternUnits="userSpaceOnUse"><path d="M50 0H0V22.5" fill="none" stroke="#d8d2c5" /></pattern></defs>
      <rect x="48" y="42" width="520" height="226" fill="url(#grid)" />
      <line x1="48" y1="268" x2="568" y2="268" stroke="#333" strokeWidth="2" /><line x1="48" y1="42" x2="48" y2="268" stroke="#333" strokeWidth="2" />
      {[0,20,40,60,80,100].map(v=><text key={v} x="38" y={272-v*2.25} textAnchor="end" fontSize="12">{v}</text>)}
      {active && <polyline points={pts} fill="none" stroke="#1d7f72" strokeWidth="4" strokeLinecap="round" className="draw" />}
      {active && sample.rows.slice(0,-1).map((r,i)=>{const [x,y]=pts.split(" ")[i].split(",");return <circle key={r.sieve} cx={x} cy={y} r="6" fill="#e7a93d" stroke="#fff" strokeWidth="2"/>})}
      <text x="310" y="316" textAnchor="middle" fontSize="14">Diâmetro das partículas (mm) · escala log</text>
      <text x="15" y="155" textAnchor="middle" fontSize="14" transform="rotate(-90 15 155)">Porcentagem que passa (%)</text>
    </svg>
  </div>;
}

export default function Home() {
  const [phase, setPhase] = useState(0), [score,setScore]=useState(0), [lives,setLives]=useState(3);
  const [feedback,setFeedback]=useState(""), [q,setQ]=useState(0), [answered,setAnswered]=useState(0);
  const [order,setOrder]=useState(()=>[0.25,2,0.075,0.6,1.2,0.15,0.425]);
  const [shake,setShake]=useState(false), [calc,setCalc]=useState(""), [curve,setCurve]=useState(false), [targets,setTargets]=useState<string[]>([]);
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
  const calcQuestions=useMemo(()=>[
    {label:"% retida por 25 g",answer:5,resolve:"25 × 100 / 500 = 5%"},
    {label:"% retida acumulada após 5% e 9%",answer:14,resolve:"5% + 9% = 14%"},
    {label:"% que passa quando 46% ficou retido",answer:54,resolve:"100% − 46% = 54%"},
  ],[]);
  const cq=calcQuestions[answered];
  const checkCalc=()=>{if(Math.abs(Number(calc.replace(",","."))-cq.answer)<0.01){award(answered===2?234:233);setFeedback("✅ "+cq.resolve);setCalc("");if(answered===2)setAnswered(3);else setAnswered(answered+1)}else wrong("Confira a operação e a massa total de 500 g.")};
  const reset=()=>{setPhase(0);setScore(0);setLives(3);setFeedback("");setQ(Math.floor(Math.random()*5));setAnswered(0);setCurve(false);setTargets([]);setOrder([...sieves].sort(()=>Math.random()-.5))};
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
        {phase===4 && <><h2>Três pequenas missões de cálculo</h2><div className="table-wrap"><table><thead><tr><th>Peneira</th><th>Abertura</th><th>Massa retida</th></tr></thead><tbody>{sample.rows.map(r=><tr key={r.sieve}><td>#{r.sieve}</td><td>{fmt(r.opening)} mm</td><td>{r.mass} g</td></tr>)}</tbody></table></div>{answered<3?<div className="calc"><span>Massa total = 500 g</span><b>{cq.label}</b><label>Resposta <input value={calc} onChange={e=>setCalc(e.target.value)} inputMode="decimal"/> %</label><button onClick={checkCalc}>CONFERIR</button></div>:<p className="success">✅ Cálculos concluídos. A passagem é 100% − % retida acumulada.</p>}</>}
        {phase===5 && <><h2>Curva de distribuição granulométrica</h2><p>Confira os pontos fornecidos e trace a curva. A abscissa representa os diâmetros; a ordenada, as porcentagens acumuladas passadas.</p><Plot active={curve}/><button className="primary" onClick={()=>{if(!curve){setCurve(true);award(500)}else{award(200);setAnswered(1);setFeedback("✅ Distribuição bem graduada: a curva reúne uma ampla faixa de diâmetros.")}}}>{curve?"CLASSIFICAR DISTRIBUIÇÃO":"TRAÇAR CURVA"}</button></>}
        {phase===6 && <><h2>Localize os diâmetros característicos</h2><Plot active/><div className="hunt">{[{k:"D10",v:.08},{k:"D30",v:.175},{k:"D60",v:.3}].map(o=><button className={targets.includes(o.k)?"found":""} key={o.k} onClick={()=>{if(!targets.includes(o.k)){setTargets([...targets,o.k]);award(150)}}}>{o.k}<small>{targets.includes(o.k)?`${fmt(o.v)} mm`:"revelar"}</small></button>)}</div>{targets.length===3&&<div className="formula"><b>Cu = D60 / D10 = 3,75</b><span>Cu &lt; 5 → solo uniforme</span><b>Cc = (D30)² / (D10 · D60) = 1,28</b><span>Para areia bem graduada: 1 &lt; Cc &lt; 3 e Cu ≥ 4.</span><button onClick={()=>{award(350);setAnswered(1);setFeedback("✅ Coeficientes interpretados conforme a aula.")}}>CONFIRMAR ANÁLISE</button></div>}</>}
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
